// ====================================================================
// UWCF Disaster Resource Map
// Application Configuration
// ====================================================================

// Central location for application settings.

const CONFIG = {

    client: {
    name: "UWCF",
    mapTitle: "UWCF Gray Sky Resource Map",
    demoMapTitle: "DEMO - UWCF Gray Sky Resource Map",
    brandColor: "#005291"
},

    // Google Maps configuration
    googleMaps: {
        apiKey: "AIzaSyAClbVNIqRwa7Yy1kbjU9LIHbgWEp_oV_0"
    },

    // Google Sheets configuration
    googleSheets: {
        spreadsheetId: "1OH1m7_PImrYwaeROkAB_THNsxBtjhhNihKY0uZ556tY"
    },

    demo: {
    enabled: true,

    title: "This is a Demo Version",

    message: "This resource map is a demo version of the tool that United Way Central Florida deploys during disasters. The information displayed here is sample data and does not represent actual resources.",

    buttonText: "I Understand"
},

resourceCategories: {
    styles: {

        "Boil Water Advisory": {
            type: "warning"
        },

        "Charging Station": {
            background: "#f57c00",
            border: "#e65100",
            icon: "charging"
        },

        "Cooling Station": {
            background: "#039be5",
            border: "#0277bd",
            icon: "snowflake"
        },

        "FEMA": {
            background: "#455a64",
            border: "#263238",
            icon: "shield"
        },

        "Food Distribution": {
            background: "#2e7d32",
            border: "#1b5e20",
            icon: "food"
        },

        "Shelters": {
            background: "#1976d2",
            border: "#0d47a1",
            icon: "shelter"
        },

        "Special Needs Shelters": {
            background: "#7b1fa2",
            border: "#4a148c",
            icon: "specialNeedsShelter"
        },

        "Supplies & Tarps": {
            background: "#ef6c00",
            border: "#bf360c",
            icon: "hammer"
        },

        "Sandbags": {
            background: "#795548",
            border: "#4e342e",
            icon: "sandbag"
        },

        "Volunteer Reception": {
            background: "#00897b",
            border: "#00695c",
            icon: "volunteer"
        },

        "Donation Drop Off": {
            background: "#c2185b",
            border: "#880e4f",
            icon: "donation"
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