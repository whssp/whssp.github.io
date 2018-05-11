let months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
let blockNames = ["Block 1", "Block 2", "Advisory", "Block 3", "Block 4", "Block 5", "Block 6"];

let blockColors = [
    ["Gray", "Orange", "Gray", "Yellow", "Green", "Red", "Blue"],
    ["Gray", "Yellow", "Gray", "Orange", "Tan", "Red", "Purple"],
    ["Gray", "Green", "Gray", "Orange", "Tan", "Purple", "Blue"],
    ["Gray", "Tan", "Gray", "Yellow", "Green", "Red", "Blue"],
    ["Gray", "Red", "Gray", "Orange", "Yellow", "Purple", "Blue"],
    ["Gray", "Purple", "Gray", "Orange", "Green", "Tan", "Red",],
    ["Gray", "Blue" ,"Gray", "Yellow", "Green", "Tan", "Purple",]
];

let timespans = [
    [7, 30, 8, 29],
    [8, 34, 9, 33],
    [9, 38, 9, 46],
    [9, 51, 10, 50],
    [10, 55, 12, 22],
    [12, 27, 13, 26],
    [13, 31, 14, 30]
];

function updateTime() {
    let now = new Date();

    let hours = now.getHours();
    let hour = hours % 12;
    if (hour === 0) hour = 12;
    let minutes = now.getMinutes();
    let half = "AM";
    if (hours > 11) half = "PM";
    if (minutes.toString().length === 1) {
        minutes = "0" + minutes;
    }
    let time = hour + ":" + minutes + " " + half;

    let timeElement = document.getElementById("time");
    timeElement.innerHTML = time;
}

/**
 * @return {string}
 */
function ISODateString(d){
    function pad(n){return n<10 ? "0"+n : n}
    return d.getUTCFullYear() + "-"
        + pad(d.getUTCMonth() + 1) + "-"
        + pad(d.getUTCDate()) + "T"
        + pad(d.getUTCHours()) + ":"
        + pad(d.getUTCMinutes()) + ":"
        + pad(d.getUTCSeconds()) + "Z"
}

function updateDate() {
    let now = new Date();

    let minutes = now.getMinutes();
    let hours = now.getHours();
    let day = now.getDate();
    let month = now.getMonth();
    let year = now.getFullYear();
    let date = months[month] + " " + day + ", " + year;

    let dateElement = document.getElementById("date");
    dateElement.innerHTML = date;

    let today = new Date(year, month, day);
    let tomorrow = new Date(year, month, day + 1);

    let todayTimestamp = ISODateString(today);
    let tomorrowTimestamp = ISODateString(tomorrow);

    let req = new XMLHttpRequest();
    let reqURL = "https://www.googleapis.com/calendar/v3/calendars/7b7lqip1244c4k7d9pdl6hair746q2nd%40import.calendar.google.com/events?key=AIzaSyCzjAj9QlD1P_eG_1HT7KqQjbfmfSDw-TU&timeMin=" + todayTimestamp + "&timeMax=" + tomorrowTimestamp;
    req.open("GET", reqURL, true);
    req.send();

    req.onreadystatechange = processRequest;

    let dayRegex = new RegExp("Day\\s[1-7]");


    function processRequest() {
        if (req.readyState === 4 && req.status === 200) {
            let calendar = JSON.parse(req.responseText);
            let events = calendar.items;
            let dayNum = 0;
            for (let i = 0; i < events.length; i++) {
                let summary = events[i].summary;
                if (dayRegex.test(summary)) {
                    dayNum = summary.match(/\d+/)[0] - 1;

                    let cycleday = document.getElementById("cycleday");
                    cycleday.innerHTML = summary;
                }
            }

            if (dayNum === 0) return;

            let currentBlock = document.getElementById("currentblock");
            let currentBlockName = document.getElementById("currentblockname");
            let currentBlockColor = document.getElementById("currentblockcolor");
            let currentBlockTimespan = document.getElementById("currentblocktimespan");

            let nextBlock = document.getElementById("nextblock");
            let nextBlockName = document.getElementById("nextblockname");
            let nextBlockColor = document.getElementById("nextblockcolor");
            let nextBlockTimespan = document.getElementById("nextblocktimespan");
            if (hours < timespans[0][0] || (hours === timespans[0][0] && minutes < timespans[0][1])) {
                currentBlock.style.backgroundColor = "Gray";
                currentBlockName.innerHTML = "Currently: ";
                currentBlockColor.innerHTML = "No Classes";
                currentBlockTimespan.innerHTML = "";

                let nextColor = blockColors[dayNum][0];
                nextBlock.style.backgroundColor = nextColor;
                nextBlockName.innerHTML = "Next: " + blockNames[0];
                if (nextColor === "Gray") {
                    nextBlockColor.innerHTML = "";
                } else {
                    nextBlockColor.innerHTML = nextColor;
                }

                let nextHourStart = timespans[1][0] % 12;
                if (nextHourStart === 0) nextHourStart = 12;

                let nextHourEnd = timespans[1][2] % 12;
                if (nextHourEnd === 0) nextHourEnd = 12;


                nextBlockTimespan.innerHTML = nextHourStart + ":" + timespans[1][1] + " - " + nextHourEnd + ":" + timespans[1][3];
                return;
            }
            for (let i = 0; i < timespans.length; i++) {
                let timespan = timespans[i];
                if ((timespan[0] === hours && timespan[1] < minutes
                    || timespan[2] === hours && timespan[3] > minutes)
                    || hours > timespan[0] && hours < timespan[2]) {
                    let color = blockColors[dayNum][i];
                    let name = blockNames[i];
                    currentBlock.style.backgroundColor = color;

                    currentBlockName.innerHTML = "Currently: " + name;

                    if (color === "Gray") {
                        currentBlockColor.innerHTML = "";
                    } else {
                        currentBlockColor.innerHTML = color;
                    }

                    let hourStart = timespan[0] % 12;
                    if (hourStart === 0) hourStart = 12;

                    let hourEnd = timespan[2] % 12;
                    if (hourEnd === 0) hourEnd = 12;

                    currentBlockTimespan.innerHTML = hourStart + ":" + timespan[1] + " - " + hourEnd + ":" + timespan[3];

                    if (i === timespans.length - 1) {
                        nextBlockName.innerHTML = "Next: ";
                        nextBlockColor.innerHTML = "No Classes";
                        nextBlockTimespan.innerHTML = "2:30"
                    } else {
                        let nextTimespan = timespans[i + 1];


                        let nextColor = blockColors[dayNum][i + 1];
                        let nextName = blockNames[i + 1];
                        nextBlock.style.backgroundColor = nextColor;


                        nextBlockName.innerHTML = "Next: " + nextName;

                        if (nextColor === "Gray") {
                            nextBlockColor.innerHTML = "";
                        } else {
                            nextBlockColor.innerHTML = nextColor;
                        }

                        let nextHourStart = nextTimespan[0] % 12;
                        if (nextHourStart === 0) nextHourStart = 12;

                        let nextHourEnd = nextTimespan[2] % 12;
                        if (nextHourEnd === 0) nextHourEnd = 12;


                        nextBlockTimespan.innerHTML = nextHourStart + ":" + nextTimespan[1] + " - " + nextHourEnd + ":" + nextTimespan[3];
                    }

                    break;
                }
            }
        }
    }
}

window.addEventListener("load",function() {
    updateDate();
    updateTime();
    setInterval(updateDate, 60 * 1000);
    setInterval(updateTime, 1000);
});