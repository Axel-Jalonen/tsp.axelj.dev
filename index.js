// INITIALIZATION
const c = document.getElementById("myCanvas");
var cssScaleX = c.width / c.offsetWidth; 
var cssScaleY = c.height / c.offsetHeight;
var ctx = c.getContext("2d");

// BEGIN: UI elements



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
        e.target.children[0].textContent = "_";
    } else {
        e.target.children[0].textContent = "\u25CF";
    }
}

document.querySelectorAll("[data-algorithm]").forEach(button => {
    button.addEventListener("click", (e) => {
        options.algorithm = e.target.getAttribute("data-algorithm");
        updateAlgorithmSelectedUI();
    });
});

document.querySelector("[data-optimize]").addEventListener("click", (e) => {
    updateToggleUI(options, "optimize", e);
    options.optimize = !options.optimize;
});

document.querySelector("[data-edges]").addEventListener("click", (e) => {
    updateToggleUI(options, "showEdges", e);
    options.showEdges = !options.showEdges;
});

c.addEventListener("click", (e) => {
    const x = e.clientX * cssScaleX;
    const y = e.clientY * cssScaleY;
    ctx.fillStyle = "black";
    ctx.fillRect(x - RECT_OFFSET, y - RECT_OFFSET, RECT_SIZE, RECT_SIZE);
    points.push([x, y]);
    // TODO: enter function
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
