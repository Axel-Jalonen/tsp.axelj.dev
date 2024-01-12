const c = document.getElementById("myCanvas");
const cssScaleX = c.width / c.offsetWidth;
const cssScaleY = c.height / c.offsetHeight;
var ctx = c.getContext("2d");

// TODO, make this work for non 16:9 screens
const statusElement = document.getElementById("status");
const clearElement = document.getElementById("clear");
const showEdges = document.getElementById("toggle-edges");

const RECT_SIZE = 30;
const RECT_OFFSET = RECT_SIZE / 2;
ctx.lineWidth = 10;

var points = [];
var totalDistance;

function clearCanvas() {
    points = [];
    totalDistance = 0;
    statusElement.innerHTML = "Click anywhere to start!";
    ctx.clearRect(0, 0, c.width, c.height);
}

function refreshCanvas() {
    totalDistance = 0;
    ctx.clearRect(0, 0, c.width, c.height);
    points.forEach((point) => {
        ctx.fillStyle = "black";
        ctx.fillRect(
            point[0] - RECT_OFFSET,
            point[1] - RECT_OFFSET,
            RECT_SIZE,
            RECT_SIZE
        );
    });
}

clearElement.addEventListener("click", clearCanvas);
showEdges.addEventListener("click", () => {
    // TODO: Manage this state better.
    refreshCanvas();
    if (showEdges.value === "1") {
        const entry = getRandPoint();
        solve(entry, points);
        showEdges.value = "0";
        return;
    }
    showEdges.value = "1";
});

c.addEventListener("click", (e) => {
    const x = e.clientX * cssScaleX;
    const y = e.clientY * cssScaleY;
    ctx.fillStyle = "black";
    ctx.fillRect(x - RECT_OFFSET, y - RECT_OFFSET, RECT_SIZE, RECT_SIZE);
    points.push([x, y]);
    const entry = getRandPoint();
    refreshCanvas();
    solve(entry, points);
});

function getRandPoint() {
    const index = Math.floor(Math.random() * points.length);
    return points[index];
}

function solve(currentPoint, pointsCpy) {
    // we have to do this because solve is run without the button begin pressed
    showEdges.value = "0";
    
    // We shouldn't use filter here
    pointsCpy = pointsCpy.filter(
        (point) =>
            !(point[0] === currentPoint[0] && point[1] === currentPoint[1])
    );
    if (pointsCpy.length === 0) {
        return;
    }
    var distance = Infinity;
    var bestPoint = null;

    pointsCpy.forEach((point) => {
        const distanceNew = Math.sqrt(
            Math.pow(currentPoint[0] - point[0], 2) +
                Math.pow(currentPoint[1] - point[1], 2)
        );
        if (
            distanceNew < distance &&
            !(point[0] === currentPoint[0] && point[1] === currentPoint[1])
        ) {
            distance = distanceNew;
            bestPoint = { coords: point, distance: distance };
        }
    });
    totalDistance += distance;
    if (totalDistance !== Infinity) {
        statusElement.innerHTML = `Total distance: ${totalDistance.toFixed(2)}`;
    }
    ctx.beginPath();
    ctx.moveTo(currentPoint[0], currentPoint[1]);
    ctx.lineTo(bestPoint.coords[0], bestPoint.coords[1]);
    ctx.stroke();
    ctx.closePath();

    // We shouldn't use filter here
    pointsCpy = pointsCpy.filter(
        (point) =>
            !(
                point[0] === bestPoint.coords[0] &&
                point[1] === bestPoint.coords[1]
            )
    );
    solve(bestPoint.coords, pointsCpy);
}
