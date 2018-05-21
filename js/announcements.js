let titleHeader;
let subParagraph;

let mainTitles = [];
let mainContents = [];
let libraryTitles = [];
let libraryContents = [];
let calendarTitles = [];
let calendarContents = [];

let titles = [];
let contents = [];
let announcementIndex = 0;
let showLibrary = false;

const API_KEY = "AIzaSyCzjAj9QlD1P_eG_1HT7KqQjbfmfSDw-TU";
const DISCOVERY_DOCS = ["https://content.googleapis.com/discovery/v1/apis/sheets/v4/rest", "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

function loadClient() {
    return gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: DISCOVERY_DOCS,
    })
        .then(function () {
                updateArrays();
                setInterval(cycleAnnouncements, 5 * 1000);
                setInterval(updateArrays, 5 * 60 * 1000);
            },
            function (err) {
                console.error("Error loading GAPI client for API", err);
            });
}

function populateAnnouncements() {
    titles = mainTitles;
    contents = mainContents;

    if (showLibrary) {
        titles = titles.concat(libraryTitles);
        contents = contents.concat(libraryContents);
    }

    titles = titles.concat(calendarTitles);
    contents = contents.concat(calendarContents);

    mainTitles = [];
    mainContents = [];
    libraryTitles = [];
    libraryContents = [];
    calendarTitles = [];
    calendarContents = [];
}
function processError(err) {
    console.error("Execute error", err);
}

function updateArrays() {
    titles = [];
    contents = [];

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
    }, processError);

    if (showLibrary) {
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
        }, processError), 100);
    }

    updateCalendarEvents();

    setTimeout(function() {
        populateAnnouncements();
        cycleAnnouncements();
    }, 1000);
}

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
    });
}

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
    let queryDict = {};
    location.search.substr(1).split("&").forEach(function (item) {
        queryDict[item.split("=")[0]] = item.split("=")[1]
    });

    if (queryDict["showlibrary"] === "true") showLibrary = true;
    if (queryDict["showLibrary"] === "true") showLibrary = true;

    titleHeader = document.getElementById("announcementTitle");
    subParagraph = document.getElementById("announcementBody");
});