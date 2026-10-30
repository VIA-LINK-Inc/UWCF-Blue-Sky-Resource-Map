/**
 * Starts the resource map application.
 *
 * Settings, including the API key, come from js/config.js.
 */
function updateMapStatus(title, message) {
    const status = document.getElementById("map-status");
    const titleElement =
        document.getElementById("map-status-title");
    const messageElement =
        document.getElementById("map-status-message");

    if (!status || !titleElement || !messageElement) {
        return;
    }

    status.hidden = false;
    status.classList.remove("map-status--error");

    titleElement.textContent = title;
    messageElement.textContent = message;
}

function hideMapStatus() {
    const status = document.getElementById("map-status");

    if (status) {
        status.hidden = true;
    }
}

function showMapError(error) {
    const status = document.getElementById("map-status");

    if (!status) {
        console.error("Application failed to start:", error);
        return;
    }

    status.hidden = false;
    status.classList.add("map-status--error");

    status.innerHTML = `
        <div class="map-status__content">
            <h2>Map Unavailable</h2>

            <p>
                The resource map could not be loaded.
                Please check your connection and try again.
            </p>

            <button
                type="button"
                class="map-status__retry"
                id="map-status-retry"
            >
                Try Again
            </button>
        </div>
    `;

    document
        .getElementById("map-status-retry")
        ?.addEventListener("click", () => {
            window.location.reload();
        });

    console.error("Application failed to start:", error);
}

function loadGoogleMapsApi() {

    // Avoid loading Google Maps more than once.
    if (window.google?.maps?.importLibrary) {
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {

        const callbackName = "googleMapsApiLoaded";

        window[callbackName] = () => {
            delete window[callbackName];
            resolve();
        };

        const parameters = new URLSearchParams({
            key: CONFIG.googleMaps.apiKey,
            v: "weekly",
            loading: "async",
            callback: callbackName
        });

        const script = document.createElement("script");

        script.src =
            `https://maps.googleapis.com/maps/api/js?${parameters.toString()}`;

        script.async = true;

        script.onerror = () => {
            delete window[callbackName];

            reject(
                new Error("The Google Maps JavaScript API could not be loaded.")
            );
        };

        document.head.appendChild(script);
    });
}

/* ================================================================
   Search, ZIP, filter, and Near Me state
   CHANGED (Veterans map): these pieces now work together.
   ================================================================ */

/*
 * zipActive is true while the map is showing resources
 * around a searched ZIP code (rather than the visitor's
 * own location from "Use My Location").
 */
const searchState = {
    zipActive: false
};

// ZIP lookups are remembered for the visit, so repeat
// searches don't ask Google again.
const zipLocationCache = new Map();

// Default distance for a ZIP search. Must match a value
// in the Distance dropdown in index.html.
const ZIP_SEARCH_RADIUS_MILES = "10";

function getUiElements() {
    return {
        searchControls:
            document.querySelector(".resource-search__controls"),
        searchInput:
            document.getElementById("resource-search-input"),
        clearButton:
            document.getElementById("resource-search-clear"),
        resultsText:
            document.getElementById("resource-search-results"),
        resultsList:
            document.getElementById("resource-results-list"),
        nearMeStatus:
            document.getElementById("near-me-status"),
        radiusContainer:
            document.getElementById("near-me-radius-container"),
        radiusSelect:
            document.getElementById("near-me-radius"),
        resetButton:
            document.getElementById("near-me-reset")
    };
}

function renderResultCards(markers) {
    const { resultsList } = getUiElements();

    if (!resultsList) {
        return;
    }

    resultsList.innerHTML = "";

    for (const marker of markers) {
        resultsList.appendChild(
            window.resultCardBuilder.build(marker)
        );
    }
}

function updateNearbyResults() {

    const { resultsList, resultsText } = getUiElements();

    if (
        !resultsList ||
        !resultsText ||
        !window.mapManager.userLocation
    ) {
        return;
    }

    const nearbyMarkers =
        window.mapManager
            .getMarkersSortedByDistance(
                window.mapManager.userLocation,
                window.mapManager.visibleMarkers
            );

    renderResultCards(nearbyMarkers);

    if (nearbyMarkers.length === 0) {

        const radius =
            window.mapManager
                .nearMeRadiusMiles;

        resultsText.textContent =
            radius !== null
                ? `No resources found within ${radius} miles. ` +
                  "Try a larger distance."
                : "No nearby resources found";

        return;
    }

    resultsText.textContent =
        nearbyMarkers.length === 1
            ? "1 nearby resource"
            : `${nearbyMarkers.length} nearby resources`;
}

/**
 * Redraws the Results list to match what the map
 * is currently showing.
 */
function refreshResultsList() {
    const { resultsList, resultsText } = getUiElements();

    if (!resultsList || !resultsText) {
        return;
    }

    // A location (Near Me or ZIP) lists by distance.
    if (window.mapManager.userLocation) {
        updateNearbyResults();
        return;
    }

    // A text search lists its matches.
    if (window.mapManager.searchQuery !== "") {
        const markers = window.mapManager.visibleMarkers;

        renderResultCards(markers);

        resultsText.textContent =
            markers.length === 1
                ? "1 resource found"
                : `${markers.length} resources found`;

        return;
    }

    // Nothing searched: empty list.
    resultsList.innerHTML = "";
    resultsText.textContent = "";
}

/**
 * Empties the search box and hides its Clear button.
 * Does not change the map by itself.
 */
function clearSearchBox() {
    const {
        searchControls,
        searchInput,
        clearButton
    } = getUiElements();

    if (searchInput) {
        searchInput.value = "";
    }

    if (clearButton) {
        clearButton.hidden = true;
    }

    searchControls?.classList.remove(
        "resource-search__controls--with-clear"
    );
}

/**
 * Removes the location (Near Me or ZIP) from the map
 * and hides the Distance and Reset controls.
 */
function clearLocation() {
    const {
        nearMeStatus,
        radiusContainer,
        radiusSelect,
        resetButton
    } = getUiElements();

    window.mapManager.clearUserLocation();

    if (nearMeStatus) {
        nearMeStatus.textContent = "";
    }

    if (radiusContainer) {
        radiusContainer.hidden = true;
    }

    if (resetButton) {
        resetButton.hidden = true;
    }

    if (radiusSelect) {
        radiusSelect.value = "5";
    }

    searchState.zipActive = false;
}

/**
 * Looks up the center of a ZIP code with Google.
 * Requires the Geocoding API to be enabled for the
 * project's API key.
 */
async function lookUpZipLocation(zip) {
    if (zipLocationCache.has(zip)) {
        return zipLocationCache.get(zip);
    }

    const { Geocoder } =
        await google.maps.importLibrary("geocoding");

    const geocoder = new Geocoder();

    const response = await geocoder.geocode({
        address: zip,
        componentRestrictions: {
            country: "US",
            postalCode: zip
        }
    });

    const point =
        response?.results?.[0]?.geometry?.location;

    if (!point) {
        throw new Error(`ZIP ${zip} could not be found.`);
    }

    const location = {
        lat: point.lat(),
        lng: point.lng()
    };

    zipLocationCache.set(zip, location);

    return location;
}

/**
 * Connects the sidebar buttons to the map filtering system.
 * Buttons follow the spreadsheet's tab order.
 */
function initializeFilterButtons() {
    const container =
        document.getElementById("resource-filter-buttons");

    if (!container) {
        console.error(
            "Resource filter button container could not be found."
        );
        return;
    }

    const orderedCategories =
        window.resourceManager.getCategories();

    container.innerHTML = "";

    /*
     * CHANGED (Veterans map):
     * If a text search plus this filter would show nothing,
     * the search is cleared automatically so the filter
     * shows its resources. A ZIP search is kept, since
     * filtering within a distance is useful; its message
     * suggests a larger distance if nothing is close.
     */
    const handleFilterClick = (category) => {
        const visibleCount =
            window.mapManager.filterMarkers(category);

        if (
            visibleCount === 0 &&
            window.mapManager.searchQuery !== ""
        ) {
            clearSearchBox();
            window.mapManager.searchMarkers("", true);
        }

        refreshResultsList();
    };

    const addButton = (label, category) => {
        const button =
            document.createElement("button");

        button.type = "button";
        button.textContent = label;
        button.dataset.category = category;

        button.classList.add(
            "resource-filter-button"
        );

        button.addEventListener(
            "click",
            () => handleFilterClick(category)
        );

        container.appendChild(button);
    };

    /*
     * "All" always exists because it represents
     * every currently active resource.
     */
    addButton("All", "All");

    /*
     * One button for each category that
     * actually contains active resources.
     */
    for (const category of orderedCategories) {
        addButton(category, category);
    }

    console.log(
        "Resource filter buttons created:",
        [
            "All",
            ...orderedCategories
        ]
    );
}

function initializeResourceSearch() {
    const {
        searchControls,
        searchInput,
        clearButton,
        resultsText,
        resultsList,
        nearMeStatus,
        radiusContainer,
        radiusSelect,
        resetButton
    } = getUiElements();

    const searchButton =
        document.getElementById("resource-search-submit");

    if (
        !searchControls ||
        !searchInput ||
        !searchButton ||
        !clearButton ||
        !resultsText ||
        !resultsList
    ) {
        console.error("Search controls could not be initialized.", {
            searchInput,
            searchButton,
            clearButton,
            resultsText,
            resultsList
        });

        return;
    }

    /*
     * CHANGED (Veterans map):
     * A 5-digit ZIP shows resources within a distance of
     * that ZIP (10 miles to start, changeable with the
     * Distance dropdown). Anything else is a text search.
     */
    const runSearch = async () => {
        const query = searchInput.value.trim();

        clearButton.hidden = query === "";

        searchControls.classList.toggle(
            "resource-search__controls--with-clear",
            query !== ""
        );

        /*
         * If the Distance dropdown is already showing,
         * keep the visitor's chosen distance for this
         * search instead of going back to the default.
         */
        const chosenRadius =
            radiusContainer &&
            !radiusContainer.hidden &&
            radiusSelect
                ? radiusSelect.value
                : null;

        // A new search replaces an earlier ZIP search.
        if (searchState.zipActive) {
            clearLocation();
        }

        if (/^\d{5}$/.test(query)) {

            resultsText.textContent =
                `Looking up ZIP ${query}...`;

            try {
                const location =
                    await lookUpZipLocation(query);

                // The ZIP is a location, not text to match.
                window.mapManager.searchMarkers("", false);

                window.mapManager.createUserLocationMarker(
                    location,
                    `ZIP ${query}`
                );

                const radius =
                    chosenRadius || ZIP_SEARCH_RADIUS_MILES;

                if (radiusSelect) {
                    radiusSelect.value = radius;
                }

                window.mapManager.setNearMeRadius(
                    radius
                );

                if (radiusContainer) {
                    radiusContainer.hidden = false;
                }

                if (resetButton) {
                    resetButton.hidden = false;
                }

                if (nearMeStatus) {
                    nearMeStatus.textContent =
                        `Showing resources near ZIP ${query}.`;
                }

                searchState.zipActive = true;

                updateNearbyResults();
                return;
            }
            catch (zipError) {
                // Falls back to a normal text search.
                console.warn(
                    "ZIP lookup failed; using text search instead.",
                    zipError
                );
            }
        }

        window.mapManager.searchMarkers(query, true);

        refreshResultsList();
    };

    searchButton.addEventListener("click", runSearch);

    searchInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            runSearch();
        }
    });

    clearButton.addEventListener("click", () => {
        clearSearchBox();

        if (searchState.zipActive) {
            clearLocation();
        }

        window.mapManager.searchMarkers("", true);

        refreshResultsList();

        searchInput.focus();
    });
}

function initializeNearMe() {

    const button =
        document.getElementById(
            "near-me-button"
        );

    const {
        nearMeStatus: status,
        radiusContainer,
        radiusSelect,
        resetButton
    } = getUiElements();

    if (
        !button ||
        !resetButton ||
        !status ||
        !radiusContainer ||
        !radiusSelect
    ) {
        console.error(
            "Near Me controls could not be initialized."
        );

        return;
    }

    button.addEventListener(
        "click",
        async () => {

            status.textContent =
                "Finding your location...";

            button.disabled = true;

            let location;

            try {
                location =
                    await window.locationManager
                        .getCurrentLocation();
            }
            catch (locationError) {

                /*
                 * CHANGED (Veterans map):
                 * If location can't be found, say so instead of
                 * pretending the visitor is at the map's center.
                 * Error code 1 means the visitor (or the website
                 * the map is embedded in) blocked location access.
                 */
                console.warn(
                    "Live location unavailable:",
                    locationError
                );

                status.textContent =
                    locationError?.code === 1
                        ? "Location access is turned off. " +
                          "To use Near Me, allow location for " +
                          "this site in your browser settings, " +
                          "then try again."
                        : "We couldn't find your location. " +
                          "Please try again, or search by ZIP " +
                          "code to see resources nearby.";

                button.disabled = false;
                return;
            }

            try {

                // Real location replaces an earlier ZIP search.
                if (searchState.zipActive) {
                    clearSearchBox();
                    searchState.zipActive = false;
                }

                window.mapManager
                    .createUserLocationMarker(
                        location
                    );

                window.mapManager
                    .setNearMeRadius(
                        radiusSelect.value
                    );

                updateNearbyResults();

                radiusContainer.hidden =
                    false;

                resetButton.hidden =
                    false;

                status.textContent =
                    "Location found";
            }
            catch (processingError) {

                console.error(
                    "Near Me processing failed:",
                    processingError
                );

                status.textContent =
                    "Location was found, but nearby " +
                    "resources could not be calculated.";
            }
            finally {
                button.disabled = false;
            }
        }
    );

    radiusSelect.addEventListener(
        "change",
        () => {

            window.mapManager
                .setNearMeRadius(
                    radiusSelect.value
                );

            updateNearbyResults();
        }
    );

    resetButton.addEventListener(
        "click",
        () => {

            // Resetting a ZIP search also empties the box.
            if (searchState.zipActive) {
                clearSearchBox();
            }

            clearLocation();

            refreshResultsList();
        }
    );
}

function initializeMobileSidebar() {
    const sidebar =
        document.getElementById("resource-sidebar");

    const button =
        document.getElementById("mobile-resource-button");

    if (!sidebar || !button) {
        console.warn(
            "Mobile resource controls could not be initialized."
        );

        return;
    }

    button.addEventListener("click", () => {
        sidebar.classList.toggle("sidebar--open");
    });
}

function initializeClientBranding() {
    const brandColor =
        CONFIG.client?.brandColor;

    if (brandColor) {
        document.documentElement.style.setProperty(
            "--brand-primary",
            brandColor
        );
    }

    const pageTitle =
        document.getElementById("page-title");

    const mapTitle =
        document.getElementById("map-title");

    const title =
        CONFIG.demo?.enabled
            ? CONFIG.client.demoMapTitle
            : CONFIG.client.mapTitle;

    document.title = title;

    if (pageTitle) {
        pageTitle.textContent = title;
    }

    if (mapTitle) {
        mapTitle.textContent = title;
    }
}

/**
 * NEW (Veterans map):
 * Adds an "About this map" button next to the header
 * title. It opens a panel with the text from
 * CONFIG.about, ending with a clickable email link.
 * Built entirely here, so index.html doesn't change.
 */
function initializeAboutPanel() {

    const about = CONFIG.about;

    if (!about?.enabled) {
        return;
    }

    const mapTitle =
        document.getElementById("map-title");

    if (!mapTitle) {
        console.warn(
            "About button could not be added: #map-title not found."
        );

        return;
    }

    // The header button.
    const openButton =
        document.createElement("button");

    openButton.type = "button";
    openButton.className = "about-button";
    openButton.setAttribute("aria-haspopup", "dialog");
    openButton.setAttribute(
        "aria-label",
        about.title || "About this map"
    );

    const icon = document.createElement("span");
    icon.className = "about-button__icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "i";

    const buttonLabel = document.createElement("span");
    buttonLabel.textContent =
        about.buttonText || "About this map";

    openButton.append(icon, buttonLabel);

    mapTitle.insertAdjacentElement(
        "afterend",
        openButton
    );

    // The dimmed backdrop and panel.
    const overlay =
        document.createElement("div");

    overlay.className = "about-overlay";
    overlay.hidden = true;

    const panel =
        document.createElement("div");

    panel.className = "about-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-labelledby", "about-panel-title");

    const closeButton =
        document.createElement("button");

    closeButton.type = "button";
    closeButton.className = "about-panel__close";
    closeButton.setAttribute("aria-label", "Close");
    closeButton.textContent = "✕";

    const heading =
        document.createElement("h2");

    heading.id = "about-panel-title";
    heading.textContent =
        about.title || "About This Map";

    // Fills an element with the message, ending
    // with a clickable email link.
    const email =
        String(about.email ?? "").trim();

    const fillMessage = (element) => {
        element.textContent =
            String(about.message ?? "").trim();

        if (email) {
            const emailLink =
                document.createElement("a");

            emailLink.href = `mailto:${email}`;
            emailLink.target = "_top";
            emailLink.textContent = email;

            element.append(" ", emailLink, ".");
        }
    };

    const message =
        document.createElement("p");

    fillMessage(message);

    panel.append(closeButton, heading, message);

    /*
     * Desktop: the same message typed out in the header.
     * CSS shows this on wide screens and the button
     * on phones (see the About block in styles.css).
     */
    const inlineMessage =
        document.createElement("p");

    inlineMessage.className = "about-inline";

    fillMessage(inlineMessage);

    mapTitle.insertAdjacentElement(
        "afterend",
        inlineMessage
    );
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    const openPanel = () => {
        overlay.hidden = false;
        closeButton.focus();
    };

    const closePanel = () => {
        overlay.hidden = true;
        openButton.focus();
    };

    openButton.addEventListener("click", openPanel);
    closeButton.addEventListener("click", closePanel);

    // Clicking the dimmed area outside the panel closes it.
    overlay.addEventListener("click", (event) => {
        if (event.target === overlay) {
            closePanel();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !overlay.hidden) {
            closePanel();
        }
    });
}

function initializeDemoMode() {

    const overlay =
        document.getElementById(
            "demo-overlay"
        );

    const dismissButton =
        document.getElementById(
            "demo-overlay-dismiss"
        );

    const title =
        document.getElementById(
            "demo-overlay-title"
        );

    const message =
        document.getElementById(
            "demo-overlay-message"
        );

    if (!overlay || !dismissButton) {
        console.warn(
            "Demo mode controls could not be initialized."
        );

        return;
    }

    // Populate demo content from config.
    if (title) {
        title.textContent =
            CONFIG.demo.title;
    }

    if (message) {
        message.textContent =
            CONFIG.demo.message;
    }

    dismissButton.textContent =
        CONFIG.demo.buttonText;

    const demoEnabled =
        CONFIG.demo?.enabled === true;

    if (!demoEnabled) {
        overlay.hidden = true;

        document.body.classList.remove(
            "demo-mode-active"
        );

        return;
    }

    overlay.hidden = false;

    document.body.classList.add(
        "demo-mode-active"
    );

    dismissButton.addEventListener(
        "click",
        () => {

            overlay.hidden = true;

            document.body.classList.remove(
                "demo-mode-active"
            );
        }
    );
}

document.addEventListener("DOMContentLoaded", async () => {
    console.log("Application starting...");

    initializeClientBranding();
    initializeAboutPanel();
    initializeDemoMode();

    try {
        updateMapStatus(
            "Loading Resource Map",
            "Connecting to Google Maps..."
        );

        await loadGoogleMapsApi();

        updateMapStatus(
            "Loading Resource Map",
            `Loading ${CONFIG.client.name} resources...`
        );

        await window.mapManager.initialize();

        updateMapStatus(
            "Loading Resource Map",
            "Preparing map controls..."
        );

        initializeFilterButtons();
        initializeResourceSearch();
        initializeNearMe();
        initializeMobileSidebar();

        hideMapStatus();

        console.log("Application ready.");

    } catch (error) {
        showMapError(error);
    }
});