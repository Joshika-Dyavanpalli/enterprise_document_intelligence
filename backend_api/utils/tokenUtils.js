const crypto = require("crypto");

function generateRefreshToken() {
  return crypto.randomBytes(64).toString("hex");
}

function hashRefreshToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

module.exports = {
  generateRefreshToken,
  hashRefreshToken,
};
