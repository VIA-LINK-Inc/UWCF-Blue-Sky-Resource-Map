// ====================================================================
// UWCF Veterans Resource Map
// Application Configuration
// ====================================================================

// Central location for application settings.

const CONFIG = {

    client: {
        name: "UWCF",
        mapTitle: "UWCF Veterans Resource Map",
        demoMapTitle: "DEMO - UWCF Veterans Resource Map",
        brandColor: "#005291"
    },

    // Google Maps configuration
    googleMaps: {
        apiKey: "AIzaSyAjjm24_xUxakT0zeyROPIK_AZv1qYfuqY"
    },

    // Google Sheets configuration
    googleSheets: {
        spreadsheetId: "1aQrwUlAsEVS66fkLziPviNl46PMowqqmWnybcbe5l0g"
    },

    demo: {
        enabled: false,

        title: "This is a Demo Version",

        message: "This resource map is a demo version of the veterans resource map from United Way Central Florida. The information displayed here is sample data and does not represent actual resources.",

        buttonText: "I Understand"
    },

    // "About this map" button in the header.
    // The email address is added as a clickable link
    // at the end of the message.
    about: {
        enabled: true,

        // Shown on phones only. Screen readers hear "About this map".
        buttonText: "About",

        title: "About This Map",

        message: "This map is made possible by the United Way of Central Florida. It provides live and detailed information about critical veteran specific and veteran friendly resources in Polk, Hardee and Highlands County. If you know of a resource that should be listed on this map, or you have a need that you cannot find on this map, please email",

        email: "missionunited@uwcf.org"
    },

    resourceCategories: {

        // Filter buttons follow the spreadsheet's tab order.
        // To reorder the filters, drag the tabs in Google Sheets.

        // Marker colors and icons. Names must match the spreadsheet tab names exactly.
        // Icon names marked "NEW" don't have drawings in map.js yet.
        styles: {

            "Food": {
                background: "#2e7d32",
                border: "#1b5e20",
                icon: "food"
            },

            "Counseling": {
                background: "#c2185b",
                border: "#880e4f",
                icon: "heart"          // NEW for Blue Sky
            },

            "Elderly": {
                background: "#6d4c41",
                border: "#3e2723",
                icon: "elderly"        // NEW, waiting on client's pick
            },

            "Employment": {
                background: "#0288d1",
                border: "#01579b",
                icon: "briefcase"      // NEW
            },

            "Housing": {
                background: "#00897b",
                border: "#00695c",
                icon: "house"          // NEW for Blue Sky
            },

            "Legal": {
                background: "#283593",
                border: "#1a237e",
                icon: "scale"          // NEW
            },

            "Veteran Service Office (VSO)": {
                background: "#c62828",
                border: "#8e0000",
                icon: "shield"         // NEW for Blue Sky
            },

            "Transportation": {
                background: "#ef6c00",
                border: "#bf360c",
                icon: "bus"            // NEW
            },

            "Independent Living / ALF": {
                background: "#8e24aa",
                border: "#4a148c",
                icon: "alf"            // NEW, waiting on client's pick
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