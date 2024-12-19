
const MIN_WIDTH = 1;
const MAX_WIDTH = 32;
const MIN_HEIGHT = 1;
const MAX_HEIGHT = 32;
const MIN_DIFFICULTY = 1;
const MAX_DIFFICULTY = 9;

const DEFAULT_DIFFICULTY = 1;

let mineCells = [];

let gridWidth = 16;
let gridHeight = 16;
let difficulty = 1;
let gameOver = false;
let timeElapsed = 0;
let timerElements = false;

setTimeout(() => {
    setDifficultyLevel(DEFAULT_DIFFICULTY);
    toggleSettings();
    restart();
}, 1);

function setDifficultyLevel(level) {
    switch(level) {
        case 1:
            gridWidth = 8;
            gridHeight = 8;
            difficulty = 2;
            break;
        case 2:
            gridWidth = 12;
            gridHeight = 12;
            difficulty = 3;
            break;
        case 3:
            gridWidth = 16;
            gridHeight = 16;
            difficulty = 3;
            break;
    }
    restart();
}

function changeWidth(dx) {
    gridWidth += dx;
    if (gridWidth < MIN_WIDTH) {
        gridWidth = MIN_WIDTH;
    }
    if (gridWidth > MAX_WIDTH) {
        gridWidth = MAX_WIDTH;
    }

    restart();
}

function changeHeight(dy) {
    gridHeight += dy;
    if (gridHeight < MIN_HEIGHT) {
        gridHeight = MIN_HEIGHT;
    }
    if (gridHeight > MAX_HEIGHT) {
        gridHeight = MAX_HEIGHT;
    }

    restart();
}

function changeDifficulty(num) {
    difficulty += num;
    difficulty = Math.min(MAX_DIFFICULTY, Math.max(difficulty, MIN_DIFFICULTY));

    restart();
}

function isGridComplete() {
    const grid = document.getElementById('grid');
    for (const cell of grid.children) {
        const isMine = (mineCells.indexOf({ x: cell.x, y: cell.y }) >= 0);
        const isClicked = cell.classList.contains('clicked');
        console.log(`(${cell.x}, ${cell.y})`);
        if (isMine) {
            console.log(`${cell.x}, ${cell.y} is a mine`);
            if (isClicked) {
                return false;
            }
        } else {
            if (!isClicked) {
                return false;
            }
        }
    }

    return true;
}

function toggleSettings() {
    const settingsDiv = document.getElementById('settings');
    const difficultyDiv = document.getElementById('difficulty');
    if (settingsDiv.style.display) {
        settingsDiv.style.display = '';
        difficultyDiv.style.display = 'none';
    } else {
        settingsDiv.style.display = 'none';
        difficultyDiv.style.display = '';
    }
    console.log(settingsDiv.style.display);
}


function restart() {
    const widthLabel = document.getElementById('grid-width-counter');
    const heightLabel = document.getElementById('grid-height-counter');
    const difficultyLabel = document.getElementById('difficulty-label');

    if (widthLabel) {
        widthLabel.innerHTML = gridWidth;
    }
    if (heightLabel) {
        heightLabel.innerHTML = gridHeight;
    }
    if (difficultyLabel) {
        difficultyLabel.innerHTML = difficulty;
    }
    startGame(gridWidth, gridHeight, difficulty / 20.0);
}

// Function to clear all children and populate the grid
function startGame(width, height, mineChance) {
    updateTimer(0);
    gameOver = false;
    timeElapsed = 0;
    mineCells = [];

    // Get the grid element by its ID
    const grid = document.getElementById('grid');
    grid.columns = width;
    grid.rows = height;

    if (!grid) {
        console.error('Element with ID \'grid\' not found.');
        return;
    }

    // Clear all existing children
    grid.innerHTML = '';

    // Populate with new divs
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const cell = document.createElement('button');
            cell.classList.add('cell');

            // Optional: Add an identifier or data attributes
            cell.x = x;
            cell.y = y;

            // Append the cell to the grid
            grid.appendChild(cell);

            // left-click callback
            cell.onclick = (event) => cellClicked(cell);

            // right-click callback
            cell.addEventListener('contextmenu', (event) => {
                if (gameOver) {
                    return;
                }
                event.preventDefault(); // Prevent the default context menu
                if (cell.classList.contains('flagged')) {
                    cell.classList.remove('flagged');
                } else {
                    cell.classList.add('flagged');
                }
            });

            if (Math.random() < mineChance) {
                mineCells.push({ x: x, y: y });
            }
        }

        // Create a line break for each x to maintain the grid structure
        const lineBreak = document.createElement('br');
        grid.appendChild(lineBreak);
    }
}

function getCell(x, y) {
    const grid = document.getElementById('grid');
    for (const cell of grid.children) {
        if (cell.x === x && cell.y === y) {
            return cell;
        }
    }
    // console.log(`Failed to get cell (${x}, ${y})`);
    return null;
}

// returns number of nearby mines, or -1 if coords contain a mine
function getStatus(x, y) {
    let mineCount = 0;
    for (const cell of mineCells) {
        if (x === cell.x && y === cell.y) {
            return -1;
        }

        if (Math.abs(x - cell.x) <= 1 && Math.abs(y - cell.y) <= 1) {
            mineCount++;
        }
    }

    return mineCount;
}

function mineClicked() {
    gameOver = true;
    for (const mine of mineCells) {
        const cell = getCell(mine.x, mine.y);
        let img = '';
        if (cell.classList.contains('clicked')) {
            img = 'bomb_red';
        } else if (cell.classList.contains('flagged')) {
            img = 'bomb_x';
        } else {
            img = 'bomb';
        }

        if (img) {
            cell.style.backgroundImage = `url('./assets/${img}.png')`;
        }
    }
}

function cellClicked(cell) {
    if (gameOver || cell.classList.contains('clicked')) {
        return;
    }
    cell.classList.add('clicked');
    const x = parseInt(cell.x);
    const y = parseInt(cell.y);
    const count = getStatus(x, y);
    let img = '';
    switch (count) {
        case -1:
            img = 'bomb_red';
            mineClicked();
            break;
        case 0:
            img = 'empty';
            break;
        default:
            img = `tile_${count}`;
            break;
    }

    if (img) {
        cell.style.backgroundImage = `url('./assets/${img}.png')`;
    }

    if (count === 0) {
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dy === dx === 0) {
                    continue;
                }
                try {
                    setTimeout(() => cellClicked(getCell(x + dx, y + dy)), 25); // cool ripple effect
                } catch (e) {} // hush thyself
            }
        }
    }

    if (isGridComplete()) {
        gameOver = true;
    }
}

function updateTimer(number) {
    if (!timerElements) {
        timerElements = {
            thousands: document.getElementById('timer_thousands'),
            hundreds: document.getElementById('timer_hundreds'),
            tens: document.getElementById('timer_tens'),
            ones: document.getElementById('timer_ones'),
        }
    }

    const thousands = Math.floor(number / 1000) % 10;
    const hundreds = Math.floor(number / 100) % 10;
    const tens = Math.floor(number / 10) % 10;
    const ones = number % 10;

    timerElements.thousands.src = `./assets/timer_${thousands}.png`;
    timerElements.hundreds.src = `./assets/timer_${hundreds}.png`
    timerElements.tens.src = `./assets/timer_${tens}.png`;
    timerElements.ones.src = `./assets/timer_${ones}.png`;
}

setInterval(() => {
    if (!gameOver) {
        updateTimer(timeElapsed++);
    }
}, 1000);
