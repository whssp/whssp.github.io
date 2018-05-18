let titleHeader;
let subParagraph;

let titles = [];
let contents = [];
let announcementIndex = 0;

let apiKey = "AIzaSyCzjAj9QlD1P_eG_1HT7KqQjbfmfSDw-TU";

function loadClient() {
    gapi.client.setApiKey(apiKey).then(function(err) {
        console.error("Error loadind GAPI client for API", err);
    });

    updateArrays();
    setInterval(cycleAnnouncements(), 5 * 1000);
}

function updateArrays() {
    return gapi.client.sheets.spreadsheets.values.get({
        "spreadsheetId": "1Vlo2zrJM6Hz05T4_ux96p4EhaQVX9p_WJ0xMw3Lsj6s",
        "range": "A1:B",
        "dateTimeRenderOption": "FORMATTED_STRING",
        "majorDimension": "ROWS",
        "valueRenderOption": "FORMATTED_VALUE"
    }).then(function (response) {
            titles = response[0];
            contents = response[1];
        },
        function (err) {
            console.error("Execute error", err);
        });
}

async function execute() {
    let titleArray;
    let title = document.getElementById("titleHeader");
    let subtitle = document.getElementById("subParagraph");

    titleArray = await updateArrays();

}

function cycleAnnouncements() {

}

window.addEventListener("load", function() {
   titleHeader = document.getElementById("titleHeader");
   subParagraph = document.getElementById("subParagraph");
});