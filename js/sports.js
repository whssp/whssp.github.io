let tweets = [];

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

    updateMarquee();
}

function updateMarquee() {
    if (tweets.length === 0) return;
    let scrollText = "";
    let scoreRegex = new RegExp("<br>.+[0-9]+<br>.+[0-9]");
    let specificScoreRegex = new RegExp("<br>.+?[0-9]+");
    for (let i = 0; i < tweets.length; i++) {
        if (scoreRegex.test(tweets[i].tweet)) {
            let scoreString = tweets[i].tweet;
            gameName = scoreString.substr(0, scoreString.indexOf("<br>"));
            scrollText += gameName;

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

            scrollText += " VS " + otherTown + " " + ourScore + "-" + otherScore + " ";
        }
    }

    marqueeText1 = document.getElementById("text1");
    marqueeText2 = document.getElementById("text2");

    marqueeText1.innerHTML = scrollText;
    marqueeText2.innerHTML = scrollText;
}

window.addEventListener("load", function() {
    setInterval(twitterFetcher.fetch(config), 30 * 60 * 1000);
});