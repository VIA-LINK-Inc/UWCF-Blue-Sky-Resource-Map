// Turns a spreadsheet cell into a coordinate.
// A blank cell becomes "not a number" instead of 0.
function parseCoordinate(value) {
    const text = String(value ?? "").trim();
    return text === "" ? NaN : Number(text);
}

class Resource {

    constructor(data) {
        this.id = data.id ?? null;

        this.name =
            String(data.name ?? "").trim();

        this.category =
            String(data.category ?? "Other").trim();

        this.address =
            String(data.address ?? "").trim();

        this.latitude =
            parseCoordinate(data.latitude);

        this.longitude =
            parseCoordinate(data.longitude);

        this.parish =
            String(data.parish ?? "").trim();

        this.description =
            String(data.description ?? "").trim();

        this.hours =
            String(data.hours ?? "").trim();

        this.phone =
            String(data.phone ?? "").trim();

        this.email =
            String(data.email ?? "").trim();

        this.website =
            String(data.website ?? "").trim();

        // NEW (Veterans map)
        this.eligibility =
            String(data.eligibility ?? "").trim();

        // NEW (Veterans map): the "Insurance / Cost" column
        this.cost =
            String(data.cost ?? "").trim();

        this.active =
            Boolean(data.active);

        this.location = {
            lat: this.latitude,
            lng: this.longitude
        };
    }

    /**
     * Confirms that the minimum information needed
     * for a map marker exists.
     */
    isValid() {
        return (
            this.name.length > 0 &&
            Number.isFinite(this.latitude) &&
            Number.isFinite(this.longitude) &&
            Math.abs(this.latitude) <= 90 &&
            Math.abs(this.longitude) <= 180 &&
            !(this.latitude === 0 && this.longitude === 0)
        );
    }

    /**
     * Produces a Google Maps directions URL.
     *
     * Whether the Directions button is displayed
     * is controlled by whether Address exists.
     */
    getDirectionsUrl() {
        const destination = encodeURIComponent(
            `${this.latitude},${this.longitude}`
        );

        return (
            "https://www.google.com/maps/dir/" +
            `?api=1&destination=${destination}`
        );
    }

    /**
     * Produces a telephone link suitable
     * for mobile devices.
     */
    getPhoneUrl() {
        const normalizedPhone =
            this.phone.replace(/[^\d+]/g, "");

        return normalizedPhone
            ? `tel:${normalizedPhone}`
            : "";
    }

    /**
     * NEW (Veterans map):
     * Produces a safe website link.
     *
     * Entries typed without https:// (for example
     * "www.example.org") get it added automatically,
     * so they no longer disappear from the map.
     * Only normal http/https web addresses are allowed.
     */
    getWebsiteUrl() {
        let text = this.website;

        if (!text) {
            return "";
        }

        if (!/^https?:\/\//i.test(text)) {
            text = `https://${text}`;
        }

        try {
            const url = new URL(text);

            if (
                (url.protocol === "https:" ||
                    url.protocol === "http:") &&
                url.hostname.includes(".")
            ) {
                return url.href;
            }
        }
        catch (error) {
            console.warn(
                "Invalid resource website:",
                this.website
            );
        }

        return "";
    }

    /**
     * NEW (Veterans map):
     * Produces an email link that opens the
     * visitor's mail app. Only plain email
     * addresses are accepted.
     */
    getEmailUrl() {
        const isPlainEmail =
            /^[A-Za-z0-9._+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
                .test(this.email);

        return isPlainEmail
            ? `mailto:${this.email}`
            : "";
    }
}

window.Resource = Resource;