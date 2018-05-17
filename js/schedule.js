let months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];

const normalBlockNames = ["Block 1", "Block 2", "Advisory", "Block 3", "Block 4", "Block 5", "Block 6"];

const halfDayBlockNames = ["Block 1", "Block 2", "Block 3", "Block 4", "Block 5", "Block 6", "Advisory"];

let blockNames = normalBlockNames;

const halfDayBlockColors = [
    ["Gray", "Orange", "Yellow", "Green", "Red", "Blue", "Gray"],
    ["Gray", "Yellow", "Orange", "Tan", "Red", "Purple", "Gray"],
    ["Gray", "Green", "Orange", "Tan", "Purple", "Blue", "Gray"],
    ["Gray", "Tan", "Yellow", "Green", "Red", "Blue", "Gray"],
    ["Gray", "Red", "Orange", "Yellow", "Purple", "Blue", "Gray"],
    ["Gray", "Purple", "Orange", "Green", "Tan", "Red", "Gray"],
    ["Gray", "Blue", "Yellow", "Green", "Tan", "Purple", "Gray"]
];
const normalBlockColors = [
    ["Gray", "Orange", "Gray", "Yellow", "Green", "Red", "Blue"],
    ["Gray", "Yellow", "Gray", "Orange", "Tan", "Red", "Purple"],
    ["Gray", "Green", "Gray", "Orange", "Tan", "Purple", "Blue"],
    ["Gray", "Tan", "Gray", "Yellow", "Green", "Red", "Blue"],
    ["Gray", "Red", "Gray", "Orange", "Yellow", "Purple", "Blue"],
    ["Gray", "Purple", "Gray", "Orange", "Green", "Tan", "Red",],
    ["Gray", "Blue" ,"Gray", "Yellow", "Green", "Tan", "Purple",]
];

let blockColors = normalBlockColors;

const halfDayTimespans = [
    [7, 30, 8, 0],
    [8, 5, 8, 35],
    [8, 40, 9, 10],
    [9, 15, 9, 45],
    [9, 50, 10, 20],
    [10, 25, 10, 55],
    [11, 0, 11, 30]
];

const normalTimespans = [
    [7, 30, 8, 29],
    [8, 34, 9, 33],
    [9, 38, 9, 46],
    [9, 51, 10, 50],
    [10, 55, 12, 22],
    [12, 27, 13, 26],
    [13, 31, 14, 30]
];

let timespans = normalTimespans;

let countingDown = false;
let nextClass = new Date();
let dayNum = -1;
let countdownIntervalHandle;

let timeElement;
let dateElement;
let cycleDay;

let currentBlock;
let currentBlockName;
let currentBlockColor;
let currentBlockTimespan;

let nextBlock;
let nextBlockName;
let nextBlockColor;
let nextBlockTimespan;

function within(index) {
    let now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let timespan = timespans[index];

    return (hours === timespan[0] && ((hours !== timespan[2] && minutes >= timespan[1])
        || (hours === timespan[2] && minutes < timespan[3])))
        || (hours > timespan[0] && hours < timespan[2])
        || (hours === timespan[2] && minutes < timespan[3]);
}

function before(index) {
    let now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let timespan = timespans[index];

    return (hours < timespan[0])
        || (hours === timespan[0] && minutes < timespan[1]);
}

function after(index) {
    let now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let timespan = timespans[index];

    return (hours > timespan[2])
        || (hours === timespan[2] && minutes >= timespan[3]);
}

function updateCountdown() {
    if (countingDown) {
        let now = new Date();
        let timeDiff = nextClass.getTime() - now.getTime();
        let minutes = Math.floor((timeDiff + 1000) / 60000);
        let seconds = Math.ceil(timeDiff / 1000) % 60;
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        if (timeDiff < 499) {
            countingDown = false;
            clearInterval(countdownIntervalHandle);
            updateTime();
            return;
        }
        currentBlockColor.innerHTML = minutes + ":" + seconds;
    }
}

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

    timeElement.innerHTML = time;


    if (countingDown) return;
    if (dayNum === -1) {
        currentBlock.style.backgroundColor = "Gray";
        currentBlockName.innerHTML = "";
        currentBlockColor.innerHTML = "";
        currentBlockTimespan.innerHTML = "";

        nextBlock.style.backgroundColor = "Gray";
        nextBlockName.innerHTML = "";
        nextBlockColor.innerHTML = "";
        nextBlockTimespan.innerHTML = "";

        return;
    }

    if (before(0)) {
        currentBlock.style.backgroundColor = "Gray";
        currentBlockName.innerHTML = "Currently: ";
        currentBlockColor.innerHTML = "No Classes";
        currentBlockTimespan.innerHTML = "";

        setNextBlock(0, dayNum);

        return;
    } else if (after(6)) {
        currentBlock.style.backgroundColor = "Gray";
        currentBlockName.innerHTML = "Currently: ";
        currentBlockColor.innerHTML = "No Classes";
        currentBlockTimespan.innerHTML = "2:30";

        nextBlock.style.backgroundColor = "Gray";
        nextBlockName.innerHTML = "";
        nextBlockColor.innerHTML = "";
        nextBlockTimespan.innerHTML = "";

        return;
    }
    for (let i = 0; i < timespans.length; i++) {
        if (within(i)) {
            setCurrentBlock(i, dayNum);

            if (i === timespans.length - 1) {
                nextBlock.style.backgroundColor = "Gray";
                nextBlockName.innerHTML = "Next: ";
                nextBlockColor.innerHTML = "No Classes";
                nextBlockTimespan.innerHTML = "2:30"
            } else {
                setNextBlock(i + 1, dayNum);
            }

            break;
        } else if (after(i) && before(i + 1) && !countingDown) {
            currentBlock.style.backgroundColor = "Gray";
            currentBlockName.innerHTML = "Time to Class: ";
            nextClass = new Date();
            nextClass.setHours(timespans[i + 1][0]);
            nextClass.setMinutes(timespans[i + 1][1]);
            nextClass.setSeconds(0);
            nextClass.setMilliseconds(0);
            countdownIntervalHandle = setInterval(updateCountdown, 100);
            updateCountdown();

            currentBlockTimespan.innerHTML = "";
            countingDown = true;

            setNextBlock(i + 1, dayNum);

            break;
        }
    }
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

function setNextBlock(index, dayNum) {
    let nextTimespan = timespans[index];


    let nextColor = blockColors[dayNum][index];
    let nextName = blockNames[index];
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

function setCurrentBlock(index, dayNum) {

    let timespan = timespans[index];

    let color = blockColors[dayNum][index];
    let name = blockNames[index];
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
}

function updateDate() {
    let now = new Date();

    let minutes = now.getMinutes();
    let hours = now.getHours();
    let day = now.getDate();
    let month = now.getMonth();
    let year = now.getFullYear();
    let date = months[month] + " " + day + ", " + year;

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
            for (let i = 0; i < events.length; i++) {
                let summary = events[i].summary;
                if (dayRegex.test(summary)) {
                    dayNum = summary.match(/\d+/)[0] - 1;
                    if (summary.indexOf("Half") !== -1) {
                        timespans = halfDayTimespans;
                        blockColors = halfDayBlockColors;
                        blockNames = halfDayBlockNames;
                    } else {
                        timespans = normalTimespans;
                        blockColors = normalBlockColors;
                        blockColors = normalBlockColors;
                    }
                    cycleday.innerHTML = summary;
                }
            }
        }
    }
}

window.addEventListener("load",function() {
    timeElement = document.getElementById("time");
    dateElement = document.getElementById("date");
    cycleday = document.getElementById("cycleday");

    currentBlock = document.getElementById("currentblock");
    currentBlockName = document.getElementById("currentblockname");
    currentBlockColor = document.getElementById("currentblockcolor");
    currentBlockTimespan = document.getElementById("currentblocktimespan");

    nextBlock = document.getElementById("nextblock");
    nextBlockName = document.getElementById("nextblockname");
    nextBlockColor = document.getElementById("nextblockcolor");
    nextBlockTimespan = document.getElementById("nextblocktimespan");

    updateDate();
    updateTime();
    setInterval(updateDate, 60 * 1000);
    setInterval(updateTime, 1000);
});