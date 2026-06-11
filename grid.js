/**
 * Grid utilities shared across pathfinding algorithms.
 *
 * Grid representation:
 *   0 = open cell
 *   1 = wall
 *   Cells also carry an optional `weight` (default 1) for weighted algorithms.
 *
 * A "node" is identified by its [row, col] pair and encoded internally as
 * `row * cols + col` for fast Map/Set lookups.
 */

const DIRECTIONS_4 = [
  [-1, 0], // up
  [1, 0],  // down
  [0, -1], // left
  [0, 1],  // right
];

const DIRECTIONS_8 = [
  ...DIRECTIONS_4,
  [-1, -1],
  [-1, 1],
  [1, -1],
  [1, 1],
];

/**
 * Encode (row, col) into a single integer key for Map/Set usage.
 */
function encode(row, col, cols) {
  return row * cols + col;
}

/**
 * Decode an integer key back into { row, col }.
 */
function decode(key, cols) {
  return { row: Math.floor(key / cols), col: key % cols };
}

/**
 * Validate that a cell exists, is in bounds, and is not a wall.
 */
function isWalkable(grid, row, col) {
  const rows = grid.length;
  const cols = grid[0].length;
  if (row < 0 || row >= rows || col < 0 || col >= cols) return false;
  return grid[row][col] !== 1;
}

/**
 * Get the movement cost of entering a cell. Defaults to 1 for unweighted
 * cells; supports a numeric "weight" grid where cell value 2-9 represents
 * higher traversal cost (e.g., terrain difficulty).
 */
function getCost(grid, row, col, diagonal = false, fromRow, fromCol) {
  const cellValue = grid[row][col];
  let baseCost = cellValue >= 2 ? cellValue : 1;

  if (diagonal && fromRow !== undefined && fromCol !== undefined) {
    const isDiagonalMove = fromRow !== row && fromCol !== col;
    if (isDiagonalMove) baseCost *= Math.SQRT2;
  }
  return baseCost;
}

/**
 * Get all walkable neighbors of a cell.
 * @param {number[][]} grid
 * @param {number} row
 * @param {number} col
 * @param {boolean} allowDiagonal
 * @returns {{row: number, col: number}[]}
 */
function getNeighbors(grid, row, col, allowDiagonal = false) {
  const dirs = allowDiagonal ? DIRECTIONS_8 : DIRECTIONS_4;
  const neighbors = [];

  for (const [dr, dc] of dirs) {
    const nr = row + dr;
    const nc = col + dc;
    if (!isWalkable(grid, nr, nc)) continue;

    // Prevent cutting through diagonal wall corners
    if (allowDiagonal && dr !== 0 && dc !== 0) {
      if (!isWalkable(grid, row + dr, col) && !isWalkable(grid, row, col + dc)) {
        continue;
      }
    }
    neighbors.push({ row: nr, col: nc });
  }
  return neighbors;
}

/**
 * Reconstruct a path from a cameFrom map (encoded keys) ending at `endKey`.
 * Returns an array of { row, col } from start to end (inclusive).
 */
function reconstructPath(cameFrom, endKey, cols) {
  const path = [];
  let current = endKey;

  while (current !== undefined) {
    path.unshift(decode(current, cols));
    current = cameFrom.get(current);
  }
  return path;
}

/**
 * Manhattan distance heuristic (for 4-directional movement).
 */
function manhattan(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

/**
 * Euclidean distance heuristic (for 8-directional / any-angle movement).
 */
function euclidean(a, b) {
  return Math.sqrt((a.row - b.row) ** 2 + (a.col - b.col) ** 2);
}

/**
 * Chebyshev distance heuristic (optimal for 8-directional uniform-cost grids).
 */
function chebyshev(a, b) {
  return Math.max(Math.abs(a.row - b.row), Math.abs(a.col - b.col));
}

/**
 * Validate grid structure and start/end points.
 * Throws descriptive errors for invalid input.
 */
function validateGridInput(grid, start, end) {
  if (!Array.isArray(grid) || grid.length === 0 || !Array.isArray(grid[0])) {
    throw new Error('Grid must be a non-empty 2D array');
  }
  const rows = grid.length;
  const cols = grid[0].length;

  for (const row of grid) {
    if (row.length !== cols) {
      throw new Error('Grid rows must all have the same length');
    }
  }

  for (const point of [start, end]) {
    if (
      typeof point?.row !== 'number' ||
      typeof point?.col !== 'number' ||
      point.row < 0 ||
      point.row >= rows ||
      point.col < 0 ||
      point.col >= cols
    ) {
      throw new Error(`Point ${JSON.stringify(point)} is out of grid bounds`);
    }
  }

  if (!isWalkable(grid, start.row, start.col)) {
    throw new Error('Start position is a wall');
  }
  if (!isWalkable(grid, end.row, end.col)) {
    throw new Error('End position is a wall');
  }
}

module.exports = {
  encode,
  decode,
  isWalkable,
  getCost,
  getNeighbors,
  reconstructPath,
  manhattan,
  euclidean,
  chebyshev,
  validateGridInput,
  DIRECTIONS_4,
  DIRECTIONS_8,
};
