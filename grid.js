// grid.js
const gridContainer = document.getElementById('grid-container');
const gridSize = 10;
const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));

function updateCellDisplay(row, col) {
  const cell = document.querySelector(`.grid-cell[data-row="${row}"][data-col="${col}"]`);
  cell.innerHTML = "";

  if (grid[row][col] === 1) {
    const xMark = document.createElement('span');
    xMark.classList.add('x-mark');
    xMark.textContent = 'x';
    cell.appendChild(xMark);
  } else if (grid[row][col] === 2) {
    const queen = document.createElement('span');
    queen.classList.add('queen');
    queen.textContent = '♛';
    cell.appendChild(queen);
  }
}

function getRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
  }
  
  function createGrid() {
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const cell = document.createElement('div');
        cell.classList.add('grid-cell');
        cell.dataset.row = row;
        cell.dataset.col = col;
  
        // Assign random color
        const randomColor = getRandomColor();
        cell.style.backgroundColor = randomColor;
  
  
        cell.addEventListener('click', () => {
          grid[row][col] = (grid[row][col] + 1) % 3;
          updateCellDisplay(row, col);
        });
  
        gridContainer.appendChild(cell);
        updateCellDisplay(row, col);
      }
    }
  }
  

const darkenButton = document.getElementById('darken-button');

function darkenNonQueens() {
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const cell = document.querySelector(`.grid-cell[data-row="${row}"][data-col="${col}"]`);
      if (grid[row][col] !== 2) { // If NOT a queen
        // Get the current background color
        const currentColor = window.getComputedStyle(cell).backgroundColor;

        // Convert RGB to HSL (more convenient for brightness manipulation)
        const [h, s, l] = rgbToHsl(currentColor);

        // Calculate the darkened brightness (1/8th of current)
        const darkenedL = l * 0.25;

        // Convert back to RGB
        const darkenedColor = hslToRgb(h, s, darkenedL);

        cell.style.backgroundColor = darkenedColor; // Set the darkened color
      }
    }
  }
}

// Helper functions for color conversion (from https://stackoverflow.com/questions/3940782/how-to-convert-rgb-to-hsl-in-javascript)
function rgbToHsl(rgb) {
  let [r, g, b] = rgb.match(/\d+/g).map(Number); // Extract RGB values

  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [h, s, l];
}

function hslToRgb(h, s, l) {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue = h < 0 ? h + 1 : h > 1 ? h - 1 : h; // Corrected hue calculation
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, hue + 1/3);
    g = hue2rgb(p, q, hue);
    b = hue2rgb(p, q, hue - 1/3);
  }

  return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
}

function hue2rgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1/6) return p + (q - p) * 6 * t;
  if (t < 1/2) return q;
  if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
  return p;
}


darkenButton.addEventListener('click', darkenNonQueens);


createGrid(); // Call the function to create the grid
