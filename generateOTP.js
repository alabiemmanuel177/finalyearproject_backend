const crypto = require("crypto");

function generateOTP(length = 6) {
  return crypto.randomBytes(length).toString("hex").slice(0, length);
}

module.exports = generateOTP;
