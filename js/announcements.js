let titleHeader;
let subParagraph;

let titles = [];
let contents = [];
let announcementIndex = 0;

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

function updateArrays() {
    return gapi.client.sheets.spreadsheets.values.get({
        "spreadsheetId": "1Vlo2zrJM6Hz05T4_ux96p4EhaQVX9p_WJ0xMw3Lsj6s",
        "range": "A1:B",
        "dateTimeRenderOption": "FORMATTED_STRING",
        "majorDimension": "ROWS",
        "valueRenderOption": "FORMATTED_VALUE"
    }).then(function (response) {
            titles = [];
            contents = [];
            for (let i = 1; i < response.result.values.length; i++) {
                let colA = response.result.values[i][0];
                let colB = response.result.values[i][1];

                let colANull = false;
                let colBNull = false;

                if (colA == null || colA === "") {
                    colANull = true;
                } else {
                    titles.push(colA);
                }

                if (colB == null || colB === "") {
                    colBNull = true;
                } else {
                    contents.push(colB);
                }

                if (colANull && colBNull) continue;
                if (colANull) titles.push("");
                else if (colBNull) contents.push("");
            }
            cycleAnnouncements();
            updateCalendarEvents();
        },
        function (err) {
            console.error("Execute error", err);
        });
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

                titles.push("Today's Events:");
                contents.push(summary + "<br>" + time);
            }
        }

        console.log(events);
    });
}

function cycleAnnouncements() {
    titleHeader.innerHTML = titles[announcementIndex];
    subParagraph.innerHTML = contents[announcementIndex];

    if (announcementIndex >= titles.length - 1) announcementIndex = 0;
    else announcementIndex++;
}

window.addEventListener("load", function () {
    titleHeader = document.getElementById("announcementTitle");
    subParagraph = document.getElementById("announcementBody");
});