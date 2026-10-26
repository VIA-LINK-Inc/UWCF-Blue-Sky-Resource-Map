class ResultCardBuilder {

    /**
     * CHANGED (Veterans map):
     * Cards are now built with textContent instead of
     * innerHTML, so spreadsheet text can never run as
     * code on the page. Class names are unchanged, so
     * existing CSS still applies.
     */
    build(marker) {

        const resource = marker.resource;

        const card = document.createElement("div");

        card.className = "resource-result";

        // Adds a line of text to the card, skipping blanks.
        const addText = (tagName, text, className) => {
            const value = String(text ?? "").trim();

            if (!value) {
                return;
            }

            const element = document.createElement(tagName);

            if (className) {
                element.className = className;
            }

            element.textContent = value;
            card.appendChild(element);
        };

        addText(
            "p",
            resource.category || "Resource",
            "resource-result__category"
        );

        addText("h4", resource.name);

        if (Number.isFinite(resource.distanceMiles)) {
            addText(
                "p",
                `${resource.distanceMiles.toFixed(1)} mi away`,
                "resource-result__distance"
            );
        }

        addText("p", resource.address);

        addText("p", resource.phone);

        /*
         * NEW (Veterans map):
         * Eligibility, shortened so long entries don't
         * stretch the card. The full text is in the popup.
         */
        if (resource.eligibility) {
            const maxLength = 120;

            const shortEligibility =
                resource.eligibility.length > maxLength
                    ? `${resource.eligibility.slice(0, maxLength).trim()}…`
                    : resource.eligibility;

            addText(
                "p",
                `Eligibility: ${shortEligibility}`,
                "resource-result__eligibility"
            );
        }

        /*
         * NEW: keyboard support. Cards can be reached
         * with Tab and opened with Enter or Space.
         */
        card.tabIndex = 0;
        card.setAttribute("role", "button");
        card.setAttribute(
            "aria-label",
            `Show ${resource.name} on the map`
        );

        const openOnMap = () => {
            window.mapManager.focusMarker(marker);
        };

        card.addEventListener("click", openOnMap);

        card.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openOnMap();
            }
        });

        return card;
    }
}

window.resultCardBuilder = new ResultCardBuilder();