function loadClient() {
    gapi.client.setApiKey('AIzaSyCzjAj9QlD1P_eG_1HT7KqQjbfmfSDw-TU');
    return gapi.client.load("https://content.googleapis.com/discovery/v1/apis/sheets/v4/rest")
        .then(function () {
                execute();
            },
            function (err) {
                console.error("Error loading GAPI client for API", err);
            });
}

// Make sure the client is loaded before calling this method.
function updateArray() {

    return gapi.client.sheets.spreadsheets.values.get({
        "spreadsheetId": "1Vlo2zrJM6Hz05T4_ux96p4EhaQVX9p_WJ0xMw3Lsj6s",
        "range": "A1:B",
        "dateTimeRenderOption": "FORMATTED_STRING",
        "majorDimension": "ROWS",
        "valueRenderOption": "FORMATTED_VALUE"
    })
        .then(function (response) {
                // Handle the results here (response.result has the parsed body).
                return response["result"]["values"];
            },
            function (err) {
                console.error("Execute error", err);
            });
}

async function execute() {
    let titleArray;
    let title = document.getElementById("titleHeader");

    titleArray = await updateArray();

    title.innerText = titleArray[1][0];
}

gapi.load("client");