class InfoWindowBuilder {

    /**
     * Prevents spreadsheet or JSON values
     * from being interpreted as HTML.
     */
    escapeHtml(value) {
        const element =
            document.createElement("div");

        element.textContent =
            value ?? "";

        return element.innerHTML;
    }

    /**
     * NEW (Veterans map):
     * Escapes text, then keeps line breaks
     * typed inside a spreadsheet cell.
     */
    formatMultiline(value) {
        return this.escapeHtml(value)
            .replace(/\r?\n/g, "<br>");
    }

    /**
     * CHANGED (Veterans map):
     * Only permits normal web addresses, and adds
     * https:// when a cell starts with "www." or
     * just a domain name. Kept here in case other
     * files call it.
     */
    getSafeWebsiteUrl(website) {
        let text =
            String(website ?? "").trim();

        if (!text) {
            return "";
        }

        if (!/^https?:\/\//i.test(text)) {
            text = `https://${text}`;
        }

        try {
            const url =
                new URL(text);

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
                website
            );
        }

        return "";
    }

    build(resource) {
        const name =
            this.escapeHtml(resource.name);

        const category =
            this.escapeHtml(resource.category);

        const address =
            this.escapeHtml(resource.address);

        const parish =
            this.escapeHtml(resource.parish);

        const hours =
            this.formatMultiline(resource.hours);

        const phone =
            this.escapeHtml(resource.phone);

        const email =
            this.escapeHtml(resource.email);

        const website =
            this.escapeHtml(resource.website);

        const description =
            this.formatMultiline(resource.description);

        // NEW (Veterans map)
        const eligibility =
            this.formatMultiline(resource.eligibility);

        // NEW (Veterans map)
        const cost =
            this.formatMultiline(resource.cost);

        const websiteUrl =
            this.getSafeWebsiteUrl(
                resource.website
            );

        /*
         * Directions technically work from coordinates,
         * but we only show the button when Address exists.
         */
        const directionsUrl =
            address
                ? resource.getDirectionsUrl()
                : "";

        const phoneUrl =
            resource.getPhoneUrl();

        // NEW (Veterans map)
        const emailUrl =
            resource.getEmailUrl();

        const hasActions =
            directionsUrl ||
            phoneUrl ||
            websiteUrl ||
            emailUrl;

        return `
            <article class="resource-popup">

                <h2 class="resource-popup__title">
                    ${name}
                </h2>

                <p class="resource-popup__category">
                    ${category}
                </p>

                ${
                    address
                        ? `
                            <p>
                                <strong>Address</strong><br>
                                ${address}
                            </p>
                        `
                        : ""
                }

                ${
                    parish
                        ? `
                            <p>
                                <strong>Parish</strong><br>
                                ${parish}
                            </p>
                        `
                        : ""
                }

                ${
                    hours
                        ? `
                            <p>
                                <strong>Hours</strong><br>
                                ${hours}
                            </p>
                        `
                        : ""
                }

                ${
                    phone
                        ? `
                            <p>
                                <strong>Phone</strong><br>
                                ${phone}
                            </p>
                        `
                        : ""
                }

                ${
                    email
                        ? `
                            <p>
                                <strong>Email</strong><br>
                                ${email}
                            </p>
                        `
                        : ""
                }

                ${
                    websiteUrl
                        ? `
                            <p>
                                <strong>Website</strong><br>
                                ${website}
                            </p>
                        `
                        : ""
                }

                ${
                    description
                        ? `
                            <p>
                                <strong>Description</strong><br>
                                ${description}
                            </p>
                        `
                        : ""
                }

                ${
                    eligibility
                        ? `
                            <p>
                                <strong>Eligibility</strong><br>
                                ${eligibility}
                            </p>
                        `
                        : ""
                }

                ${
                    cost
                        ? `
                            <p>
                                <strong>Insurance / Cost</strong><br>
                                ${cost}
                            </p>
                        `
                        : ""
                }

                ${
                    hasActions
                        ? `
                            <div class="resource-popup__actions">

                                ${
                                    directionsUrl
                                        ? `
                                            <a
                                                href="${directionsUrl}"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Directions
                                            </a>
                                        `
                                        : ""
                                }

                                ${
                                    phoneUrl
                                        ? `
                                            <a href="${phoneUrl}" target="_top">
                                                Call
                                            </a>
                                        `
                                        : ""
                                }

                                ${
                                    websiteUrl
                                        ? `
                                            <a
                                                href="${websiteUrl}"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Website
                                            </a>
                                        `
                                        : ""
                                }

                                ${
                                    emailUrl
                                        ? `
                                            <a href="${emailUrl}" target="_top">
                                                Email
                                            </a>
                                        `
                                        : ""
                                }

                            </div>
                        `
                        : ""
                }

            </article>
        `;
    }
}

window.infoWindowBuilder =
    new InfoWindowBuilder();