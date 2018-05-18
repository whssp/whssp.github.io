let titleHeader;
let subParagraph;

let titles = [];
let contents = [];
let announcementIndex = 0;

let apiKey = "AIzaSyCzjAj9QlD1P_eG_1HT7KqQjbfmfSDw-TU";

function loadClient() {
    gapi.client.setApiKey(apiKey);
    return gapi.client.load("https://content.googleapis.com/discovery/v1/apis/sheets/v4/rest")
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
    },
        function (err) {
            console.error("Execute error", err);
        });
}

function cycleAnnouncements() {
    titleHeader.innerHTML = titles[announcementIndex];
    subParagraph.innerHTML = contents[announcementIndex];

    if (announcementIndex >= titles.length - 1) announcementIndex = 0;
    else announcementIndex++;
}

window.addEventListener("load", function() {
   titleHeader = document.getElementById("announcementTitle");
   subParagraph = document.getElementById("announcementBody");
});