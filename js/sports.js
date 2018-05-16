let tweets = [];

let scores = [];
let scoreIndex = 0;

let sports;

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

    scores = [];

    let scoreRegex = new RegExp("<br>.+[0-9]+<br>.+[0-9]");
    let specificScoreRegex = new RegExp("<br>.+?[0-9]+");

    for (let i = 0; i < tweets.length; i++) {
        let scoreText = "";
        if (scoreRegex.test(tweets[i].tweet)) {
            let scoreString = tweets[i].tweet;
            gameName = scoreString.substr(0, scoreString.indexOf("<br>"));
            scoreText += removeTrailingSpaces(gameName);

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
            let ourScore;
            let otherScore;
            if (town1 === "Wellesley") {
                otherTown = town2;
                ourScore = score1;
                otherScore = score2;
            } else {
                otherTown = town1;
                ourScore = score2;
                otherScore = score1;
            }

            scoreText += " VS " + otherTown + " " + ourScore + "-" + otherScore + " ";

            scores.push(scoreText);
        }
    }

    scrollScores();
}

function scrollScores() {
    sports.innerHTML = scores[scoreIndex];

    if (scoreIndex >= scores.length - 1) scoreIndex = 0;
    else scoreIndex++;
}

window.addEventListener("load", function() {
    sports = document.getElementById("sports");
    setInterval(twitterFetcher.fetch(config), 30 * 60 * 1000);
    setInterval(scrollScores, 5 * 1000);
});