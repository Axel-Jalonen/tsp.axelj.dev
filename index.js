// INITIALIZATION
const c = document.getElementById("myCanvas");
var cssScaleX = c.width / c.offsetWidth;
var cssScaleY = c.height / c.offsetHeight;
var ctx = c.getContext("2d");

// BEGIN: UI elements

const algorithmStatusElement = document.getElementById("algorithm-status");
const statusElement = document.getElementById("status");

// END: UI elements

// BEGIN: Global variables

const RECT_SIZE = 30;
const RECT_OFFSET = RECT_SIZE / 2;
ctx.lineWidth = 10;

var options = {
    algorithm: "nn",
    optimize: false,
    showEdges: true,
};

var points = [];
var totalDistance = 0;

// END: Global variables

// BEGIN: Event listeners

function updateAlgorithmSelectedUI() {
    const bnbButton = document.getElementById("bnb-button");
    const nnButton = document.getElementById("nn-button");

    if (options.algorithm === "bnb") {
        bnbButton.children[0].textContent = "\u25CF"; // Selected
        nnButton.children[0].textContent = "_"; // Not selected
    } else {
        bnbButton.children[0].textContent = "_"; // Not selected
        nnButton.children[0].textContent = "\u25CF"; // Selected
    }
}

function updateToggleUI(obj, prop, e) {
    if (obj[prop]) {
        e.target.children[0].textContent = "\u25CF";
    } else {
        e.target.children[0].textContent = "_";
    }
}

document.querySelectorAll("[data-algorithm]").forEach((button) => {
    button.addEventListener("click", (e) => {
        options.algorithm = e.target.getAttribute("data-algorithm");
        updateAlgorithmSelectedUI();
        enterWithRandom();
    });
});

document.querySelector("[data-optimize]").addEventListener("click", (e) => {
    options.optimize = !options.optimize;
    updateToggleUI(options, "optimize", e);
    refreshCanvas();
    optimizeNn();
});

document.querySelector("[data-edges]").addEventListener("click", (e) => {
    options.showEdges = !options.showEdges;
    updateToggleUI(options, "showEdges", e);
    refreshCanvas();
    enterWithRandom();
});

document.getElementById("clear-button").addEventListener("click", clearCanvas);

c.addEventListener("click", (e) => {
    const x = e.clientX * cssScaleX;
    const y = e.clientY * cssScaleY;
    ctx.fillStyle = "black";
    ctx.fillRect(x - RECT_OFFSET, y - RECT_OFFSET, RECT_SIZE, RECT_SIZE);
    points.push([x, y]);
    if (options.optimize && options.algorithm === "nn") {
        optimizeNn();
    }
    refreshCanvas(); 
    enterWithRandom();
});

// END: Event listeners

// BEGIN: Helper functions

function drawStatus(message) {
    if (message) {
        statusElement.innerHTML = message;
    } else {
        statusElement.innerHTML = "Click anywhere to start!";
    }
}

function drawAlgorithm(message) {
    if (message) {
        algorithmStatusElement.innerHTML = message;
    } else {
        algorithmStatusElement.innerHTML = "Click anywhere to start!";
    }
}

function clearCanvas() {
    points = [];
    totalDistance = 0;
    drawStatus();
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
    entry(getRandPoint(), points);
}

// END: Helper functions

function entry(currentPoint, pointsCpy) {
    if (options.algorithm === "bnb") {
        drawAlgorithm("Branch and Bound (exact) (NOT IMPLEMENTED)");
        drawStatus("Coming soon.");
        refreshCanvas();
        return;
    } else if (options.algorithm === "nn") {
        drawAlgorithm("Nearest Neighbors (heuristic, greedy)");
        drawStatus();
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
        drawStatus(`Total distance: ${totalDistance.toFixed(2)}`);
    }

    if (options.showEdges) {
        ctx.beginPath();
        ctx.moveTo(currentPoint[0], currentPoint[1]);
        ctx.lineTo(bestPoint[0], bestPoint[1]);
        ctx.stroke();
        ctx.closePath();
    }

    // We shouldn't use filter here
    pointsCpy = pointsCpy.filter(
        (point) =>
            !(point[0] === bestPoint[0] && point[1] === bestPoint[1]) &&
            !(point[0] === currentPoint[0] && point[1] === currentPoint[1])
    );

    nearestNeighbors(bestPoint, pointsCpy);
}
