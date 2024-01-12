// INITIALIZATION
const c = document.getElementById("myCanvas");
var cssScaleX = c.width / c.offsetWidth; 
var cssScaleY = c.height / c.offsetHeight;
var ctx = c.getContext("2d");

// BEGIN: UI elements

// TODO: make this work for non 16:9 screens
const statusElement = document.getElementById("status");
const clearElement = document.getElementById("clear");
const toggleEdgesElement = document.getElementById("toggle-edges");
const optimizeElement = document.getElementById("optimize");
const algorithmToggleNnElement = document.getElementById("algorithm-toggle-nn");
const algorithmToggleBnbElement = document.getElementById(
    "algorithm-toggle-bnb"
);
const algorithmStatusElement =
    document.getElementById("algorithm-status").children[0];

// END: UI elements

// BEGIN: Global variables

const RECT_SIZE = 30;
const RECT_OFFSET = RECT_SIZE / 2;
ctx.lineWidth = 10;

var points = [];
var totalDistance;

var globalState = {
    algorithm: "nn",
    optimize: false,
};

// END: Global variables

// BEGIN: Event listeners
document.addEventListener("resize", () => { cssScaleX = c.width / c.offsetWidth; cssScaleY = c.height / c.offsetHeight; });
c.addEventListener("click", (e) => {
    const x = e.clientX * cssScaleX;
    const y = e.clientY * cssScaleY;
    ctx.fillStyle = "black";
    ctx.fillRect(x - RECT_OFFSET, y - RECT_OFFSET, RECT_SIZE, RECT_SIZE);
    points.push([x, y]);
    refreshCanvas();
    enterWithRandom();
    if (globalState.optimize) {
        optimizeNn();
    }
});

clearElement.addEventListener("click", clearCanvas);

toggleEdgesElement.addEventListener("click", () => {
    // TODO: Manage this state better.

    refreshCanvas();
    // TEMPORARY
    if (globalState.algorithm === "bnb") {
        reDrawStatus("Coming soon.");
        return;
    }

    if (points.length > 0) {
        reDrawStatus("Total distance: edges_hidden");
    } else {
        reDrawStatus();
    }

    if (toggleEdgesElement.value === "1") {
        enterWithRandom();
        if (globalState.optimize) {
            optimizeNn();
        }
        toggleEdgesElement.value = "0";
        return;
    }

    toggleEdgesElement.value = "1";
});

optimizeElement.addEventListener("click", () => {
    if (optimizeElement.value === "1") {
        globalState.optimize = false;
        optimizeElement.value = "0";
        optimizeElement.children[0].textContent = "_";
        refreshCanvas();
        enterWithRandom();
        return;
    }
    optimizeElement.value = "1";
    optimizeElement.children[0].textContent = "\u25CF";
    globalState.optimize = true;
    optimizeNn();
});

algorithmToggleBnbElement.addEventListener("click", () => {
    algorithmToggleBnbElement.value = "0";
    algorithmToggleNnElement.value = "1";
    algorithmToggleNnElement.children[0].textContent = "_";
    algorithmToggleBnbElement.children[0].textContent = "\u25CF";
    globalState.algorithm = "bnb";
    enterWithRandom();
});

algorithmToggleNnElement.addEventListener("click", () => {
    algorithmToggleNnElement.value = "0";
    algorithmToggleBnbElement.value = "1";
    algorithmToggleNnElement.children[0].textContent = "\u25CF";
    algorithmToggleBnbElement.children[0].textContent = "_";
    globalState.algorithm = "nn";
    enterWithRandom();
});

// END: Event listeners

// BEGIN: Helper functions

function reDrawStatus(message) {
    if (message) {
        statusElement.innerHTML = message;
    } else {
        statusElement.innerHTML = "Click anywhere to start!";
    }
}

function clearCanvas() {
    points = [];
    totalDistance = 0;
    reDrawStatus();
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

function optimizeNn() {
    let bestDistance = Infinity;
    let bestPoint;
    points.forEach((point) => {
        entry(point, points);
        if (totalDistance < bestDistance) {
            bestDistance = totalDistance;
            bestPoint = point;
        }
        refreshCanvas();
    });
    entry(bestPoint, points);
}

function getRandPoint() {
    const index = Math.floor(Math.random() * points.length);
    return points[index];
}

function enterWithRandom() {
    const entryPoint = getRandPoint();
    entry(entryPoint, points);
}

// END: Helper functions

function entry(currentPoint, pointsCpy) {
    // we have to do this because entry is run without the button begin pressed
    toggleEdgesElement.value = "0";

    if (globalState.algorithm === "bnb") {
        algorithmStatusElement.textContent =
            "Branch and Bound (exact) (NOT IMPLEMENTED)";
        reDrawStatus("Coming soon.");
        refreshCanvas();
        return;
    } else if (globalState.algorithm === "nn") {
        algorithmStatusElement.textContent =
            "nearest_neighbors (heuristic, greedy)";
        reDrawStatus();
        nearestNeighbors(currentPoint, pointsCpy);
    }
}

// ALGORITHMS

function branchAndBound(currentPoint, pointsCpy) {
    // TODO
}

function nearestNeighbors(currentPoint, pointsCpy) {
    if (pointsCpy.length === 0) {
        return;
    }

    var distance = Infinity;
    var bestPoint;

    pointsCpy.forEach((point) => {
        if (!(point[0] === currentPoint[0] && point[1] === currentPoint[1])) {
            const distanceNew = Math.sqrt(
                Math.pow(currentPoint[0] - point[0], 2) +
                    Math.pow(currentPoint[1] - point[1], 2)
            );
            if (distanceNew < distance) {
                distance = distanceNew;
                bestPoint = point;
            }
        }
    });

    totalDistance += distance;
    if (totalDistance !== Infinity) {
        reDrawStatus(`Total distance: ${totalDistance.toFixed(2)}`);
    }

    ctx.beginPath();
    ctx.moveTo(currentPoint[0], currentPoint[1]);
    ctx.lineTo(bestPoint[0], bestPoint[1]);
    ctx.stroke();
    ctx.closePath();

    // We shouldn't use filter here
    pointsCpy = pointsCpy.filter(
        (point) =>
            !(point[0] === bestPoint[0] && point[1] === bestPoint[1]) &&
            !(point[0] === currentPoint[0] && point[1] === currentPoint[1])
    );

    nearestNeighbors(bestPoint, pointsCpy);
}
