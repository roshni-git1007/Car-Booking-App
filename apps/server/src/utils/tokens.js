const jwt = require("jsonwebtoken");
const { env } = require("../config/env");

function signAccessToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    { sub: user._id.toString() },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
