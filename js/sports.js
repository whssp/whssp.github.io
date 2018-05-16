let tweets = [];

let gameNames = [];
let homeScores = [];
let otherScores = [];

let gameIndex = 0;

let sportName;
let score1;
let score2;

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


function handleTweets(twts){
    if (twts.length > 0) tweets = twts;

    updateScores();
}

function removeTrailingSpaces(str) {
    while (str.charAt(str.length - 1) === " ") {
        str = str.substr(0, str.length - 1);
    }
    return str;
}

function updateScores() {
    if (tweets.length === 0) return;

    gameNames = [];
    homeScores = [];
    otherScores = [];

    let scoreRegex = new RegExp("<br>.+[0-9]+<br>.+[0-9]");
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

            let town1 = match1.substr(0, match1.indexOf(score1) - 1);
            let town2 = match2.substr(0, match2.indexOf(score2) - 1);

            let otherTown;
            if (town1 === "Wellesley") {
                otherTown = town2;
                homeScore = score1;
                otherScore = score2;
            } else {
                otherTown = town1;
                homeScore = score2;
                otherScore = score1;
            }

            gameName += " VS " + otherTown;

            gameNames.push(gameName);
            homeScores.push(homeScore);
            otherScores.push(otherScore);
        }
    }

    scrollScores();
}

function scrollScores() {
    sportName.innerHTML = gameNames[gameIndex];
    score1.innerHTML = homeScores[gameIndex];
    score2.innerHTML = otherScores[gameIndex];

    if (homeScores[gameIndex] > otherScores[gameIndex]) {
        score1.style.fontWeight = "bold";
        score1.style.webkitTextStrokeWidth = "2px";

        score2.style.fontWeight = "normal";
        score2.style.webkitTextStrokeWidth = "0";
    } else if (otherScores[gameIndex] > homeScores[gameIndex]) {
        score1.style.fontWeight = "normal";
        score1.style.webkitTextStrokeWidth = "0";

        score2.style.fontWeight = "bold";
        score2.style.webkitTextStrokeWidth = "2px";
    } else {
        score1.style.fontWeight = "normal";
        score1.style.webkitTextStrokeWidth = "0";

        score2.style.fontWeight = "normal";
        score2.style.webkitTextStrokeWidth = "0";
    }
    if (gameIndex >= gameNames.length - 1) gameIndex = 0;
    else gameIndex++;
}

window.addEventListener("load", function() {
    sportName = document.getElementById("sportname");
    score1 = document.getElementById("score1");
    score2 = document.getElementById("score2");

    setInterval(twitterFetcher.fetch(config), 30 * 60 * 1000);
    setInterval(scrollScores, 5 * 1000);
});