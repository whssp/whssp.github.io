var months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
var blockNames = ["Block 1", "Block 2", "Advisory", "Block 3", "Block 4", "Block 5", "Block 6"];

var blockColors = [
    ["Gray, Orange, Gray, Yellow, Green, Red, Blue"],
    ["Gray, Yellow, Gray, Orange, Tan, Red, Purple"],
    ["Gray", "Green", "Gray", "Orange", "Tan", "Purple", "Blue"],
    ["Gray", "Tan", "Gray", "Yellow", "Green", "Red", "Blue"],
    ["Gray", "Red", "Gray", "Orange", "Yellow", "Purple", "Blue"],
    ["Gray, Purple", "Gray", "Orange", "Green", "Tan", "Red"],
    ["Gray", "Blue" ,"Gray", "Yellow", "Green", "Tan", "Purple"]
];

var timespans = [
    [7, 30, 8, 29],
    [8, 34, 9, 33],
    [9, 38, 9, 46],
    [9, 51, 10, 50],
    [10, 55, 12, 22],
    [12, 27, 13, 26],
    [13, 31, 14, 30]
];

function updateTime() {
    var now = new Date();

    var hours = now.getHours();
    var hour = hours % 12;
    if (hour === 0) hour = 12;
    var minutes = now.getMinutes();
    var half = "AM";
    if (hours > 11) half = "PM";
    if (minutes.toString().length == 1) {
        minutes = "0" + minutes;
    }
    var time = hour + ":" + minutes + " " + half;

    var timeElement = document.getElementById("time");
    timeElement.innerHTML = time;
}

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
    var now = new Date();

    var minutes = now.getMinutes();
    var hours = now.getHours();
    var day = now.getDate();
    var month = now.getMonth();
    var year = now.getFullYear();
    var date = months[month] + " " + day + ", " + year;

    var dateElement = document.getElementById("date");
    dateElement.innerHTML = date;

    var today = new Date(year, month, day);
    var tomorrow = new Date(year, month, day + 1);

    var todayTimestamp = ISODateString(today);
    var tomorrowTimestamp = ISODateString(tomorrow);

    var req = new XMLHttpRequest();
    var reqURL = "https://www.googleapis.com/calendar/v3/calendars/7b7lqip1244c4k7d9pdl6hair746q2nd%40import.calendar.google.com/events?key=AIzaSyCzjAj9QlD1P_eG_1HT7KqQjbfmfSDw-TU&timeMin=" + todayTimestamp + "&timeMax=" + tomorrowTimestamp;
    req.open("GET", reqURL, true);
    req.send();

    req.onreadystatechange = processRequest;

    var dayRegex = new RegExp("Day\\s[1-7]");


    function processRequest() {
        if (req.readyState == 4 && req.status == 200) {
            var calendar = JSON.parse(req.responseText);
            var events = calendar.items;
            var dayNum = 0;
            for (var i = 0; i < events.length; i++) {
                var summary = events[i].summary;
                if (dayRegex.test(summary)) {
                    var dayNum = summary.match(/\d+/)[0] - 1;

                    var cycleday = document.getElementById("cycleday");
                    cycleday.innerHTML = summary;
                }
            }

            if (dayNum == 0) return;

            for (var i = 0; i < timespans.length; i++) {
                var timespan = timespans[i];
                if ((timespan[0] === hours && timespan[1] < minutes
                    || timespan[2] === hours && timespan[3] > minutes)
                    || hours > timespan[0] && hours < timespan[2]) {
                    var currentBlock = document.getElementById("currentblock");
                    var color = blockColors[dayNum][i];
                    var name = blockNames[i];
                    currentBlock.style.backgroundColor = color;

                    var currentBlockName = document.getElementById("currentblockname");
                    currentBlockName.innerHTML = "Currently: " + name;

                    var currentBlockColor = document.getElementById("currentblockcolor");
                    if (color == "Gray") {
                        currentBlockColor.innerHTML = "";
                    } else {
                        currentBlockColor.innerHTML = color;
                    }
                    var currentBlockTimespan = document.getElementById("currentblocktimespan");

                    var hourStart = timespan[0] % 12;
                    if (hourStart == 0) hourStart = 12;

                    var hourEnd = timespan[2] % 12;
                    if (hourEnd == 0) hourEnd = 12;

                    currentBlockTimespan.innerHTML = hourStart + ":" + timespan[1] + " - " + hourEnd + ":" + timespan[3];

                    var nextTimespan = timespans[i + 1];

                    var nextBlock = document.getElementById("nextblock");
                    var nextColor = blockColors[dayNum][i + 1];
                    var nextName = blockNames[i];
                    nextBlock.style.backgroundColor = nextColor;

                    var nextBlockName = document.getElementById("nextblockname");
                    nextBlockName.innerHTML = "Next: " + nextName;

                    var nextBlockColor = document.getElementById("nextblockcolor");
                    if (nextColor == "Gray") {
                        nextBlockColor.innerHTML = "";
                    } else {
                        nextBlockColor.innerHTML = nextColor;
                    }


                    var nextHourStart = nextTimespan[0] % 12;
                    if (nextHourStart == 0) nextHourStart = 12;

                    var nextHourEnd = nextTimespan[2] % 12;
                    if (nextHourEnd == 0) nextHourEnd = 12;

                    var nextBlockTimespan = document.getElementById("nextblocktimespan");
                    nextBlockTimespan.innerHTML = nextHourStart + ":" + nextTimespan[1] + " - " + nextHourEnd + ":" + nextTimespan[3];

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