// The title and content elements for the main announcement pane.
let titleHeader;
let subParagraph;

// Arrays to hold separate announcement categories until they are all retrieved.
let mainTitles = [];
let mainContents = [];
let libraryTitles = [];
let libraryContents = [];
let calendarTitles = [];
let calendarContents = [];

// Booleans indicating whether announcement categories have been retrieved.
let filledMain = false;
let filledLibrary = false;
let filledCalendar = false;

// The final arrays to hold the announcements.
let titles = [];
let contents = [];
// Index of currently displayed announcement.
let announcementIndex = 0;
// A switch set by the showlibrary GET parameter that determines whether library announcements are added in.
let showLibrary = false;

// Google API key.
const API_KEY = "AIzaSyCzjAj9QlD1P_eG_1HT7KqQjbfmfSDw-TU";
const DISCOVERY_DOCS = ["https://content.googleapis.com/discovery/v1/apis/sheets/v4/rest", "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

// Load the google api client and authenticate.
function loadClient() {
    return gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: DISCOVERY_DOCS,
    }).then(function () {
            // Initially populate the announcement arrays.
            updateArrays();
            // Cycle the announcements every 5 seconds.
            setInterval(cycleAnnouncements, 5 * 1000);
            // Update the announcements every 30 minutes.
            setInterval(updateArrays, 5 * 60 * 1000);
        },
        function (err) {
            console.error("Error loading GAPI client for API", err);
        });
}

// Fill the final announcement arrays.
function populateAnnouncements() {
    // Reset to avoid holdovers.
    titles = [];
    contents = [];

    // We fill in the order Main, [Library], Calendar.
    titles = mainTitles;
    contents = mainContents;

    if (showLibrary) {
        titles = titles.concat(libraryTitles);
        contents = contents.concat(libraryContents);
    }

    titles = titles.concat(calendarTitles);
    contents = contents.concat(calendarContents);

    // Reset the temporary announcement arrays to avoid holdovers.

    mainTitles = [];
    mainContents = [];
    libraryTitles = [];
    libraryContents = [];
    calendarTitles = [];
    calendarContents = [];
}
function processError(err) {
    console.error("Execution error.", err);
}

// Runs recursively until all the announcement data has been retrieved, so that we don't get partial stuff.
function finalize() {
    if (filledMain && filledLibrary && filledCalendar) {
        filledMain = false;
        filledLibrary = false;
        filledCalendar = false;

        populateAnnouncements();
        cycleAnnouncements();
    } else {
        setTimeout(finalize, 500);
    }
}

// Fill the announcement data arrays.
function updateArrays() {
    // Retrieve the main announcements from the spreadsheet.
    gapi.client.sheets.spreadsheets.values.get({
        "spreadsheetId": "1Vlo2zrJM6Hz05T4_ux96p4EhaQVX9p_WJ0xMw3Lsj6s",
        "range": "A1:B",
        "dateTimeRenderOption": "FORMATTED_STRING",
        "majorDimension": "ROWS",
        "valueRenderOption": "FORMATTED_VALUE"
    }).then(function (response) {
        for (let i = 1; i < response.result.values.length; i++) {
            let colA = response.result.values[i][0];
            let colB = response.result.values[i][1];

            let colANull = false;
            let colBNull = false;

            if (colA == null || colA === "") {
                colANull = true;
            } else {
                mainTitles.push(colA);
            }

            if (colB == null || colB === "") {
                colBNull = true;
            } else {
                mainContents.push(colB);
            }

            if (colANull && colBNull) continue;
            if (colANull) mainTitles.push("");
            else if (colBNull) mainContents.push("");
        }
        filledMain = true;
    }, processError);

    if (showLibrary) {
        // Retrieve the library announcements from the spreadsheet.
        setTimeout(gapi.client.sheets.spreadsheets.values.get({
            "spreadsheetId": "1Vlo2zrJM6Hz05T4_ux96p4EhaQVX9p_WJ0xMw3Lsj6s",
            "range": "'Library Announcements'!A1:B",
            "dateTimeRenderOption": "FORMATTED_STRING",
            "majorDimension": "ROWS",
            "valueRenderOption": "FORMATTED_VALUE"
        }).then(function (response) {
            for (let i = 1; i < response.result.values.length; i++) {
                let colA = response.result.values[i][0];
                let colB = response.result.values[i][1];

                let colANull = false;
                let colBNull = false;

                if (colA == null || colA === "") {
                    colANull = true;
                } else {
                    libraryTitles.push(colA);
                }

                if (colB == null || colB === "") {
                    colBNull = true;
                } else {
                    libraryContents.push(colB);
                }

                if (colANull && colBNull) continue;
                if (colANull) libraryTitles.push("");
                else if (colBNull) libraryContents.push("");

            }
            filledLibrary = true;
        }, processError), 100);
    } else {
        filledLibrary = true;
    }

    // Retrieve calendar events from the public school calendar.
    updateCalendarEvents();

    // Run finalize() until we get all the data we need.
    setTimeout(finalize, 500);
}

// Retrieve calendar events from the school calendar.
function updateCalendarEvents() {

    let day = now.getDate();
    let month = now.getMonth();
    let year = now.getFullYear();

    let today = new Date(year, month, day);
    let tomorrow = new Date(year, month, day + 1);

    let todayTimestamp = ISODateString(today);
    let tomorrowTimestamp = ISODateString(tomorrow);

    return gapi.client.calendar.events.list({
        'calendarId': '7b7lqip1244c4k7d9pdl6hair746q2nd@import.calendar.google.com',
        'timeMin': todayTimestamp,
        'timeMax': tomorrowTimestamp,
        'showDeleted': false,
        'singleEvents': true,
        'maxResults': 100,
        'orderBy': 'startTime'
    }).then(function (response) {
        let events = response.result.items;
        let dayRegex = new RegExp("Day\\s[1-7]");

        if (events.length > 0) {
            for (i = 0; i < events.length; i++) {
                let event = events[i];
                let summary = event["summary"];

                if (dayRegex.test(summary))
                    continue;

                let time = event["start"]["dateTime"];
                if (time) {
                    let startTime = new Date(time);
                    let endTime = new Date(event["end"]["dateTime"]);

                    let startTimeString = startTime.toLocaleString('en-US', {
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true
                    });
                    let endTimeString = endTime.toLocaleString('en-US', {
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true
                    });
                    time = startTimeString + " - " + endTimeString;
                } else {
                    time = "";
                }

                calendarTitles.push("Today's Events:");
                calendarContents.push(summary + "<br>" + time);
            }
        }
        filledCalendar = true;
    });
}

// Cycle through the announcements in the main pane.
function cycleAnnouncements() {
    if (mainTitles.length !== 0 || mainContents.length !== 0
    || libraryTitles.length !== 0 || libraryContents.length !== 0
    || calendarTitles.length !== 0 || calendarContents.length !== 0) {
        populateAnnouncements();
    }
    titleHeader.innerHTML = titles[announcementIndex];
    subParagraph.innerHTML = contents[announcementIndex];

    if (announcementIndex >= titles.length - 1) announcementIndex = 0;
    else announcementIndex++;
}

window.addEventListener("load", function () {
    // This is for retrieving the GET parameters.
    let queryDict = {};
    location.search.substr(1).split("&").forEach(function (item) {
        queryDict[item.split("=")[0]] = item.split("=")[1]
    });

    // Be a bit lenient on the capitalization.
    if (queryDict["showlibrary"] === "true") showLibrary = true;
    if (queryDict["showLibrary"] === "true") showLibrary = true;

    // Set the elements only once the window is loaded.
    titleHeader = document.getElementById("announcementTitle");
    subParagraph = document.getElementById("announcementBody");
});