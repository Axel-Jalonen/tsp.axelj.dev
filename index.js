const c = document.getElementById("myCanvas");
c.width = window.innerWidth;
c.height = window.innerHeight;
var ctx = c.getContext("2d");
const shouldQuitElement = document.getElementById("point-entry-mode-toggle");
const statusElement = document.getElementById("status");

ctx.fillStyle = "black";
const RECT_WIDTH = 10
const OFFSET = (RECT_WIDTH / 2)

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

function recordPoints() {
    const array = [];
    statusElement.textContent = "Recording points";
    var notShouldQuit = shouldQuitElement.checked;
    function pushNewPoints(e) {
        const x = (e.clientX);
        const y = (e.clientY);
        statusElement.textContent = `${x} * ${y}`;
        array.push(new Point(x, y));
        drawPoint(new Point(x, y));
    }
    c.addEventListener("click", pushNewPoints)
    if (!notShouldQuit) {
        c.removeEventListener("click", pushNewPoints); 
        return array;
    }
}

function getRandPoint(array) {
    const randIndex = Math.floor(Math.random() * array.length);
    return array[randIndex];
}

function removePoint(Point, array) {
    const index = array.indexOf(Point);
    if (index > -1) {
        array.splice(index, 1);
    }
    return array
}

function drawPoint(point) {
    const x = point.x;
    const y = point.y;
    ctx.fillStyle = "black";
    ctx.fillRect(x - OFFSET, y - OFFSET, RECT_WIDTH, RECT_WIDTH);
}

function drawAllPoints(array) {
    statusElement.textContent = "Drawing points";
    array.forEach(drawPoint);
}

function render() {
    statusElement.textContent = "Rendering " + Math.round(Math.random()*100);
    var positions = [];
    if (shouldQuitElement.checked) {
        positions = recordPoints();
        if (positions.length > 0) {
            // const randPoint = getRandPoint(positions);
            drawAllPoints(positions);
        }
    }
    window.requestAnimationFrame(render);
}
window.requestAnimationFrame(render);