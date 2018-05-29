let months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];

// Lookup tables for the names of the blocks, ordered differently on half-days.
const normalBlockNames = ["Block 1", "Block 2", "Advisory", "Block 3", "Block 4", "Block 5", "Block 6"];

const halfDayBlockNames = ["Block 1", "Block 2", "Block 3", "Block 4", "Block 5", "Block 6", "Advisory"];

let blockNames = normalBlockNames;

// Lookup tables for block colors, also ordered differently on half-days (advisory is last).
const halfDayBlockColors = [
    ["Gray", "Orange", "Yellow", "Green", "Red", "Blue", "Gray"],
    ["Gray", "Yellow", "Orange", "Tan", "Red", "Purple", "Gray"],
    ["Gray", "Green", "Orange", "Tan", "Purple", "Blue", "Gray"],
    ["Gray", "Tan", "Yellow", "Green", "Red", "Blue", "Gray"],
    ["Gray", "Red", "Orange", "Yellow", "Purple", "Blue", "Gray"],
    ["Gray", "Purple", "Orange", "Green", "Tan", "Red", "Gray"],
    ["Gray", "Blue", "Yellow", "Green", "Tan", "Purple", "Gray"]
];

const normalBlockColors = [
    ["Gray", "Orange", "Gray", "Yellow", "Green", "Red", "Blue"],
    ["Gray", "Yellow", "Gray", "Orange", "Tan", "Red", "Purple"],
    ["Gray", "Green", "Gray", "Orange", "Tan", "Purple", "Blue"],
    ["Gray", "Tan", "Gray", "Yellow", "Green", "Red", "Blue"],
    ["Gray", "Red", "Gray", "Orange", "Yellow", "Purple", "Blue"],
    ["Gray", "Purple", "Gray", "Orange", "Green", "Tan", "Red",],
    ["Gray", "Blue" ,"Gray", "Yellow", "Green", "Tan", "Purple",]
];

let blockColors = normalBlockColors;

// Lookup tables for block timespans, 24-hour time, format is [start hour, start minute, end hour, end minute].
const halfDayTimespans = [
    [7, 30, 8, 0],
    [8, 5, 8, 35],
    [8, 40, 9, 10],
    [9, 15, 9, 45],
    [9, 50, 10, 20],
    [10, 25, 10, 55],
    [11, 0, 11, 30]
];

const normalTimespans = [
    [7, 30, 8, 29],
    [8, 34, 9, 33],
    [9, 38, 9, 46],
    [9, 51, 10, 50],
    [10, 55, 12, 22],
    [12, 27, 13, 26],
    [13, 31, 14, 30]
];

let timespans = normalTimespans;

// Date object for current time. Used across a few different functions and declared here to save memory.
let now;

// The current day of the cycle, with -1 being an error case.
let dayNum = -1;

// Various things for the countdown clock.
let countingDown = false;
let nextClass = new Date();
let countdownIntervalHandle;

// HTML Elements
let timeElement;
let dateElement;
let cycleDay;

let currentBlock;
let currentBlockName;
let currentBlockColor;
let currentBlockTimespan;

let nextBlock;
let nextBlockName;
let nextBlockColor;
let nextBlockTimespan;

// Returns true if current time is >= start of the indexed timespan and < end of it.
function within(index) {
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let timespan = timespans[index];

    // Don't try to understand this expression; just understand that it works.
    return (hours === timespan[0] && ((hours !== timespan[2] && minutes >= timespan[1])
        || (hours === timespan[2] && minutes < timespan[3])))
        || (hours > timespan[0] && hours < timespan[2])
        || (hours === timespan[2] && minutes < timespan[3]);
}

// Returns true if time < start of the indexed timespan.
function before(index) {
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let timespan = timespans[index];

    return (hours < timespan[0])
        || (hours === timespan[0] && minutes < timespan[1]);
}

// Returns true if time >= end of the indexed timespan.
function after(index) {
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let timespan = timespans[index];

    return (hours > timespan[2])
        || (hours === timespan[2] && minutes >= timespan[3]);
}

// Updates the timer to the next block, only hooked up while counting down.
function updateCountdown() {
    if (countingDown) {
        now = new Date();
        let timeDiff = nextClass.getTime() - now.getTime();
        // If we're being honest here, I don't know why this results in the countdown that is seemingly most accurate to the system clock, but it does.
        let minutes = Math.floor((timeDiff + 1000) / 60000);
        let seconds = Math.ceil(timeDiff / 1000) % 60;
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        if (timeDiff < 499) {
            countingDown = false;
            clearInterval(countdownIntervalHandle);
            updateTime();
            return;
        }
        currentBlockColor.innerHTML = minutes + ":" + seconds;
    }
}

// Update the current time and color block, also triggers the countdown if inbetween blocks.
function updateTime() {
    now = new Date();

    let hours = now.getHours();
    let hour = hours % 12;
    if (hour === 0) hour = 12;
    let minutes = now.getMinutes();
    let half = "AM";
    if (hours > 11) half = "PM";
    if (minutes.toString().length === 1) {
        minutes = "0" + minutes;
    }
    let time = hour + ":" + minutes + " " + half;

    timeElement.innerHTML = time;


    if (countingDown) return;
    // dayNum should only be -1 if it was not yet set / not found on the current calendar day.
    if (dayNum === -1) {
        currentBlock.style.backgroundColor = "Gray";
        currentBlockName.innerHTML = "";
        currentBlockColor.innerHTML = "";
        currentBlockTimespan.innerHTML = "";

        nextBlock.style.backgroundColor = "Gray";
        nextBlockName.innerHTML = "";
        nextBlockColor.innerHTML = "";
        nextBlockTimespan.innerHTML = "";

        return;
    }

    // Case for when we're before the first block.
    if (before(0)) {
        currentBlock.style.backgroundColor = "Gray";
        currentBlockName.innerHTML = "Currently: ";
        currentBlockColor.innerHTML = "No Classes";
        currentBlockTimespan.innerHTML = "";

        setNextBlock(0, dayNum);

        return;
        // Case for when we're after the last block.
    } else if (after(6)) {
        currentBlock.style.backgroundColor = "Gray";
        currentBlockName.innerHTML = "Currently: ";
        currentBlockColor.innerHTML = "No Classes";
        currentBlockTimespan.innerHTML = "2:30";

        nextBlock.style.backgroundColor = "Gray";
        nextBlockName.innerHTML = "";
        nextBlockColor.innerHTML = "";
        nextBlockTimespan.innerHTML = "";

        return;
    }
    for (let i = 0; i < timespans.length; i++) {
        // Check if we're currently in the block at index i.
        if (within(i)) {
            setCurrentBlock(i, dayNum);

            if (i === timespans.length - 1) {
                nextBlock.style.backgroundColor = "Gray";
                nextBlockName.innerHTML = "Next: ";
                nextBlockColor.innerHTML = "No Classes";
                nextBlockTimespan.innerHTML = "2:30"
            } else {
                setNextBlock(i + 1, dayNum);
            }

            break;
            // Check if we're between the blocks at index i and i + 1.
        } else if (after(i) && before(i + 1) && !countingDown) {
            currentBlock.style.backgroundColor = "Gray";
            currentBlockName.innerHTML = "Time to Class: ";

            // Start and hook up the countdown to the next block.
            nextClass = new Date();
            nextClass.setHours(timespans[i + 1][0]);
            nextClass.setMinutes(timespans[i + 1][1]);
            nextClass.setSeconds(0);
            nextClass.setMilliseconds(0);
            // Update countdown to next block every 100 ms.
            countdownIntervalHandle = setInterval(updateCountdown, 100);
            updateCountdown();

            currentBlockTimespan.innerHTML = "";
            countingDown = true;

            setNextBlock(i + 1, dayNum);

            break;
        }
    }
}

// Copy-pasted from stack-overflow, formats time how the google api wants it.
function ISODateString(d){
    function pad(n){return n<10 ? "0"+n : n}
    return d.getUTCFullYear() + "-"
        + pad(d.getUTCMonth() + 1) + "-"
        + pad(d.getUTCDate()) + "T"
        + pad(d.getUTCHours()) + ":"
        + pad(d.getUTCMinutes()) + ":"
        + pad(d.getUTCSeconds()) + "Z"
}

// Convert 24 hour time to 12 hour time.
function to12Hour(hour) {
    hour %= 12;
    if (hour === 0) hour = 12;

    return hour;
}

// Sets the next block section with the indexed data.
function setNextBlock(index, dayNum) {
    let nextTimespan = timespans[index];


    let nextColor = blockColors[dayNum][index];
    let nextName = blockNames[index];
    nextBlock.style.backgroundColor = nextColor;


    nextBlockName.innerHTML = "Next: " + nextName;

    if (nextColor === "Gray") {
        nextBlockColor.innerHTML = "";
    } else {
        nextBlockColor.innerHTML = nextColor;
    }

    // Use black text when color is yellow for better contrast.
    if (nextColor === "Yellow") {
        nextBlock.style.color = "Black";
    } else {
        nextBlock.style.color = "White";
    }

    let nextHourStart = to12Hour(nextTimespan[0]);
    let nextHourEnd = to12Hour(nextTimespan[2]);

    nextBlockTimespan.innerHTML = nextHourStart + ":" + nextTimespan[1] + " - " + nextHourEnd + ":" + nextTimespan[3];
}

// Sets the current block section with the indexed data.
function setCurrentBlock(index, dayNum) {

    let timespan = timespans[index];

    let color = blockColors[dayNum][index];
    let name = blockNames[index];
    currentBlock.style.backgroundColor = color;

    currentBlockName.innerHTML = "Currently: " + name;

    if (color === "Gray") {
        currentBlockColor.innerHTML = "";
    } else {
        currentBlockColor.innerHTML = color;
    }

    // Use black text when the color is yellow for better contrast.
    if (color === "Yellow") {
        currentBlock.style.color = "Black";
    } else {
        currentBlock.style.color = "White";
    }

    let hourStart = to12Hour(timespan[0]);
    let hourEnd = to12Hour(timespan[2]);

    currentBlockTimespan.innerHTML = hourStart + ":" + timespan[1] + " - " + hourEnd + ":" + timespan[3];
}

/*
Update the day number and date.
The day number is found by searching for something matching the pattern "Day [number]" in the google calendar on the current day.
If the world "Half" precedes "Day" then we consider it to be a half day.
 */
function updateDate() {
    let minutes = now.getMinutes();
    let hours = now.getHours();
    let day = now.getDate();
    let month = now.getMonth();
    let year = now.getFullYear();
    let date = months[month] + " " + day + ", " + year;

    dateElement.innerHTML = date;

    let today = new Date(year, month, day);
    let tomorrow = new Date(year, month, day + 1);

    let todayTimestamp = ISODateString(today);
    let tomorrowTimestamp = ISODateString(tomorrow);

    // Call into the google calendar api.
    let req = new XMLHttpRequest();
    let reqURL = "https://www.googleapis.com/calendar/v3/calendars/7b7lqip1244c4k7d9pdl6hair746q2nd%40import.calendar.google.com/events?key=AIzaSyCzjAj9QlD1P_eG_1HT7KqQjbfmfSDw-TU&timeMin=" + todayTimestamp + "&timeMax=" + tomorrowTimestamp;
    req.open("GET", reqURL, true);
    req.send();

    req.onreadystatechange = processRequest;

    // Matches anything containing "Day [Number]" including "Half Day [Number]".
    let dayRegex = new RegExp("Day\\s[1-7]");

    // Callback to process returned calendar data, to avoid hanging javascript execution.
    function processRequest() {
        if (req.readyState === 4 && req.status === 200) {
            let calendar = JSON.parse(req.responseText);
            let events = calendar.items;
            for (let i = 0; i < events.length; i++) {
                let summary = events[i]["summary"];
                if (dayRegex.test(summary)) {
                    dayNum = summary.match(/\d+/)[0] - 1;
                    if (summary.indexOf("Half") !== -1) {
                        timespans = halfDayTimespans;
                        blockColors = halfDayBlockColors;
                        blockNames = halfDayBlockNames;
                    } else {
                        timespans = normalTimespans;
                        blockColors = normalBlockColors;
                        blockColors = normalBlockColors;
                    }
                    cycleday.innerHTML = summary;
                }
            }
        }
    }
}

// We need to wait for the dom to be ready before calling into it.
window.addEventListener("load",function() {
    timeElement = document.getElementById("time");
    dateElement = document.getElementById("date");
    cycleday = document.getElementById("cycleDay");

    currentBlock = document.getElementById("currentBlock");
    currentBlockName = document.getElementById("currentBlockName");
    currentBlockColor = document.getElementById("currentBlockColor");
    currentBlockTimespan = document.getElementById("currentBlockTimespan");

    nextBlock = document.getElementById("nextBlock");
    nextBlockName = document.getElementById("nextBlockName");
    nextBlockColor = document.getElementById("nextBlockColor");
    nextBlockTimespan = document.getElementById("nextBlockTimespan");

    now = new Date();

    updateDate();
    updateTime();
    // Update the date once a minute.
    setInterval(updateDate, 60 * 1000);
    // Update the time once a second.
    setInterval(updateTime, 1000);
});