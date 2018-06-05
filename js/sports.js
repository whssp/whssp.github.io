/*
!!!! IMPORTANT !!!!
We cannot call into twitter's api from the browser, so we use the third party script at:
https://github.com/jasonmayes/Twitter-Post-Fetcher
This will almost certainly break when twitter update their website design.
 */

// Array of the text of the fetched tweets.
let tweets = [];

// The name of the game and scores extracted from the tweets.
let gameNames = [];
let homeScores = [];
let otherScores = [];

// Index of the game currently being displayed on the bar.
let gameIndex = 0;

// Document elements for displaying score information.
let sportName;
let score1;
let score2;

// Config object as described in https://github.com/jasonmayes/Twitter-Post-Fetcher/blob/master/js/exampleUsage.js
let config = {
    "profile": {"screenName": "wellesleysports"},
    "domId": "",
    "maxTweets": 10,
    "enableLinks": false,
    "showUser": false,
    "showTime": false,
    "dateFunction": "",
    "showRetweet": false,
    "customCallback": handleTweets,
    "showInteraction": false,
    "dataOnly": true
};

// Callback that populates tweet array.
function handleTweets(twts){
    if (twts.length > 0) tweets = twts;

    updateScores();
}

// Remove spaces at the end of a string.
function removeTrailingSpaces(str) {
    while (str.charAt(str.length - 1) === " ") {
        str = str.substr(0, str.length - 1);
    }
    return str;
}

// Counts the number of words in a string.
function wordCount(str) {
    let count = 0;
    for (let i = 0; i < str.length; i++) {
        if (str.charAt(i) === " ") count++;
    }
    // First space means two words.
    return count++;
}
// Extracts information from tweet array and populates game data arrays.
function updateScores() {
    if (tweets.length === 0) return;

    // Clear the game data arrays.
    gameNames = [];
    homeScores = [];
    otherScores = [];

    /*
    This regex matches the following format:
    [Game Name]
    [Town 1] [Score]
    [Town 2] [Score]
     */
    let scoreRegex = new RegExp("<br>.+[0-9]+<br>.+[0-9]");
    // This regex should match "[Linebreak (\n)] [Town] [Score]
    let specificScoreRegex = new RegExp("<br>.+?[0-9]+");

    for (let i = 0; i < tweets.length; i++) {
        let gameName = "";
        let homeScore = "";
        let otherScore = "";
        if (scoreRegex.test(tweets[i].tweet)) {
            let scoreString = tweets[i].tweet;
            gameName = scoreString.substr(0, scoreString.indexOf("<br>"));
            gameName = removeTrailingSpaces(gameName);

            scoreString = scoreString.substr(scoreString.indexOf("<br>"));

            let match1 = scoreString.match(specificScoreRegex)[0];
            scoreString = scoreString.substr(match1.length);
            let match2 = scoreString.match(specificScoreRegex)[0];
            match1 = match1.substr(4);
            match2 = match2.substr(4);

            let score1 = match1.substr(match1.lastIndexOf(" ") + 1);
            let score2 = match2.substr(match2.lastIndexOf(" ") + 1);

            let town1 = removeTrailingSpaces(match1.substr(0, match1.indexOf(score1) - 1));
            let town2 = removeTrailingSpaces(match2.substr(0, match2.indexOf(score2) - 1));
            if (wordCount(town1) > 2 || wordCount(town2) > 2) continue;
            // Determine which score is ours and which is the other town.
            let otherTown;
            if (town1 === "Wellesley") {
                otherTown = town2;
                homeScore = parseInt(score1);
                otherScore = parseInt(score2);
            } else {
                otherTown = town1;
                homeScore = parseInt(score2);
                otherScore = parseInt(score1);
            }

            gameName += " VS " + otherTown;

            gameNames.push(gameName);
            homeScores.push(homeScore);
            otherScores.push(otherScore);
        }
    }

    scrollScores();
}

// Changes the sports display to the next score in the game data arrays.
function scrollScores() {
    sportName.innerHTML = gameNames[gameIndex];
    score1.innerHTML = homeScores[gameIndex];
    score2.innerHTML = otherScores[gameIndex];

    // The winning score is bolded and outlined.
    if (homeScores[gameIndex] > otherScores[gameIndex]) {
        score1.className = "greenStroke";

        score2.className = "redStroke";
    } else if (otherScores[gameIndex] > homeScores[gameIndex]) {
        score1.className = "redStroke";

        score2.className = "greenStroke";
    } else {
        score1.className = "";

        score2.className = "";
    }

    // Wrap around to beginning of array if at the end.
    if (gameIndex >= gameNames.length - 1) gameIndex = 0;
    else gameIndex++;
}

// Only call into the dom once it's loaded.
window.addEventListener("load", function() {
    sportName = document.getElementById("sportName");
    score1 = document.getElementById("score1");
    score2 = document.getElementById("score2");

    // Update the tweets every 30 minutes.
    setInterval(twitterFetcher.fetch(config), 30 * 60 * 1000);
    // Change the displayed score every 5 seconds.
    setInterval(scrollScores, 5 * 1000);
});