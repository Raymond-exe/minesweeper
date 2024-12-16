
const mineCells = [];

function getCell(x, y) {
    const grid = document.getElementById('grid');
    for (const cell of grid.children) {
        // console.log(cell);
        if (cell.x === x && cell.y === y) {
            return cell;
        }
    }
    console.log(`Failed to get cell (${x}, ${y})`);
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
    const grid = document.getElementById('grid');
    for (const cell of grid.children) {
        // console.log(cell);
        if (cell.x === x && cell.y === y) {
            return cell;
        }
    }
    console.log(`Failed to get cell (${x}, ${y})`);
    return null;
}

// Function to clear all children and populate the grid
function createGrid(width, height, mineChance) {
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
                event.preventDefault(); // Prevent the default context menu
                cell.classList.add('flagged');
            });

            if (Math.random() < mineChance) {
                mineCells.push({ x: x, y: y });
            }
        }

        // Create a line break for each x to maintain the grid structure
        const lineBreak = document.createElement('br');
        grid.appendChild(lineBreak);
    }

    console.log(mineCells);
}

function cellClicked(cell) {
    if (cell.classList.contains('clicked')) {
        return;
    }
    cell.classList.add('clicked');
    const x = parseInt(cell.x);
    const y = parseInt(cell.y);
    const count = getStatus(x, y);
    let img = '';
    switch (count) {
        case -1:
            img = 'bomb'; break;
        case 0:
            img = 'empty'; break;
        default:
            img = `tile_${count}`; break;
    }
    cell.style.backgroundImage = `url('./assets/${img}.png')`;

    if (count === 0) {
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dy === dx === 0) {
                    continue;
                }
                try {
                    cellClicked(getCell(x + dx, y + dy));
                } catch (e) {} // hush
            }
        }
    }
}

// Example usage:
setTimeout(() => createGrid(10, 10, 0.1), 1);
