/**
 * Wraps an async controller function to handle errors automatically
 * @param {Function} fn - The async controller function to wrap
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
