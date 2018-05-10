var months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"]
var colors = [
    ["orange", "advisory", "yellow", "green", "red", "blue"],
    ["yellow", "advisory", "orange", "tan", "red", "purple"],
    ["green", "advisory", "orange", "tan", "purple", "blue"],
    ["tan", "advisory", "yellow", "green", "red", "blue"],
    ["red", "advisory", "orange", "yellow", "purple", "blue"],
    ["purple", "advisory", "orange", "green", "tan", "red"],
    ["blue", "advisory", "yellow", "green", "tan", "purple"],
]

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

    function processRequest() {
        if (req.readyState == 4 && req.status == 200) {
            var calendar = JSON.parse(req.responseText);
            var events = calendar.items;
            for (var i = 0; i < events.length; i++) {
                var summary = events[i].summary;
                var regex = new RegExp("Day\\s[1-7]");
                if (regex.test(summary)) {
                    var cycleday = document.getElementById("cycleday");
                    cycleday.innerHTML = summary;
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