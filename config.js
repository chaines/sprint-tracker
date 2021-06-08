require("dotenv").config();
const path = require("path");

module.exports = {
  configSheetId: process.env.GOOGLE_SHEET_CONFIG,
  googleTokenPath: path.join(__dirname, process.env.GOOGLE_TOKEN_PATH),
  githubApiKey: process.env.GITHUB_API_KEY,
};
