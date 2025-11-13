const bcrypt = require("bcryptjs");
const ApiError = require("../../utils/apiError");

/**
 * Hash a password
 * @param {string} password - Plain text password
 * @returns {string} - Hashed password
 */

exports.hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

/**
 * Compare plain password with hashed password
 * @param {string} plainPassword - Plain text password
 * @param {string} hashedPassword - Hashed password
 * @returns {boolean} - Password match status
 */
exports.comparePassword = async (plainPassword, hashedPassword) => {
  const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
  if (!isMatch) {
    throw ApiError.unauthorized("Invalid email or password");
  }
  return true;
};
