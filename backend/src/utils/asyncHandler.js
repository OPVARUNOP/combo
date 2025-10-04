/**
 * Async handler to wrap each route.
 * @param {Function} fn - The async function to wrap
 * @returns {Function} - The wrapped function
 */
const asyncHandler = (fn) => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
