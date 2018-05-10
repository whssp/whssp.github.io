function start() {
    // Initializes the client with the API key and the Translate API.
    gapi.client.init({
        "apiKey": "YOUR_API_KEY",
        "discoveryDocs": ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
        "scope": "https://www.googleapis.com/auth/spreadsheets.readonly"
    }).then(function() {
        // Executes an API request, and returns a Promise.
        // The method name `language.translations.list` comes from the API discovery.
        return gapi.client.language.translations.list({
            q: "hello world",
            source: "en",
            target: "de",
        });
    }).then(function(response) {
        console.log(response.result.data.translations[0].translatedText);
    }, function(reason) {
        console.log("Error: " + reason.result.error.message);
    });
};

// Loads the JavaScript client library and invokes `start` afterwards.
function loadClient() {
    gapi.load('client', start);
}

loadClient();