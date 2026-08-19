// ====================================================================
// UWCF Disaster Resource Map
// Application Configuration
// ====================================================================

// Central location for application settings.

const CONFIG = {

    client: {
    name: "UWCF",
    mapTitle: "UWCF Blue Sky Resource Map",
    demoMapTitle: "DEMO - UWCF Blue Sky Resource Map",
    brandColor: "#005291"
},

    // Google Maps configuration
    googleMaps: {
        apiKey: "AIzaSyB9BBv0FgbDXt6E6sTMDMJn9h9hxX0_d_Y"
    },

    // Google Sheets configuration
    googleSheets: {
        spreadsheetId: "1aQrwUlAsEVS66fkLziPviNl46PMowqqmWnybcbe5l0g"
    },

    demo: {
    enabled: true,

    title: "This is a Demo Version",

    message: "This resource map is a demo version of the tool that United Way Central Florida deploys during Blue Skys. The information displayed here is sample data and does not represent actual resources.",

    buttonText: "I Understand"
},

resourceCategories: {
    styles: {

        "Food Pantry": {
            background: "#2e7d32",
            border: "#1b5e20",
            icon: "food"
        },

        "Farmer's Markets": {
            background: "#558b2f",
            border: "#33691e",
            icon: "market"
        },

        "Community Meals": {
            background: "#ef6c00",
            border: "#bf360c",
            icon: "meal"
        }
    },

    defaultStyle: {
        background: "#757575",
        border: "#424242",
        icon: "default"
    }
},

    // Map configuration
    map: {

    // Default map center: UWCF service area
    // Polk, Hardee, and Highlands Counties
    defaultCenter: {
        lat: 27.65,
        lng: -81.55
    },

    defaultZoom: 8,

    clusterZoomStep: 2,
    clusterMaxZoom: 16,
    singleResourceZoom: 13,

    // Google Maps Map ID
    mapId: "YOUR_MAP_ID"
}
};