const { body, param, query, validationResult } = require('express-validator');

/** Return 422 with all validation errors if any exist */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
}

const gridConstraints = [
  body('grid')
    .isArray({ min: 1 })
    .withMessage('grid must be a non-empty array'),
  body('grid.*')
    .isArray({ min: 1 })
    .withMessage('each grid row must be an array'),
  body('start.row').isInt({ min: 0 }).withMessage('start.row must be a non-negative integer'),
  body('start.col').isInt({ min: 0 }).withMessage('start.col must be a non-negative integer'),
  body('end.row').isInt({ min: 0 }).withMessage('end.row must be a non-negative integer'),
  body('end.col').isInt({ min: 0 }).withMessage('end.col must be a non-negative integer'),
];

const algorithmConstraints = [
  body('algorithm')
    .isIn(['astar', 'dijkstra', 'bfs', 'dfs', 'greedy'])
    .withMessage('algorithm must be one of: astar, dijkstra, bfs, dfs, greedy'),
];

module.exports = { validate, gridConstraints, algorithmConstraints };
