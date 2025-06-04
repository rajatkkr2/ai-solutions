const CryptoJS = require("crypto-js");
require("dotenv").config();

const SECRET_KEY = process.env.CRYPTO_SECRET_KEY || "your-very-secret-key-here";

function encrypt(text) {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
}

function decrypt(ciphertext) {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

module.exports = { encrypt, decrypt };