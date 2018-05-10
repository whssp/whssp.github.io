var months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"]

function updateTime() {
    var now = new Date();

    var hours = now.getHours();
    var minutes = now.getMinutes();
    var time = hours + ":" + minutes;

    var timeElement = document.getElementById("time");
    timeElement.innerHTML = time;
}
function updateDate() {
    var now = new Date();

    var day = now.getDate();
    var month = now.getMonth();
    var year = now.getFullYear();
    var date = months[month] + " " + day + ", " + year;

    var dateElement = document.getElementById("date");
    dateElement.innerHTML = date;
}

window.addEventListener("load",function() {
    updateDate();
    updateTime();
    setInterval(updateDate, 60 * 1000);
    setInterval(updateTime, 1000);
});