const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");
require("dotenv").config();

const READONLY_SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets.readonly",
];

const FULL_SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

const auth = new google.auth.GoogleAuth({
  keyFile: "/home/chaines51/projects/sprint-tracker/token.json",
  scopes: READONLY_SCOPES,
});

const sheets = google.sheets({ version: "v4", auth });

sheets.spreadsheets.values
  .get({
    spreadsheetId: process.env.GOOGLE_SHEET_CONFIG,
    range: "cohort_config!A2:B",
  })
  .then((data) => data.data)
  .then((data) => data.values.map((row) => ({ cohort: row[0], sheet: row[1] })))
  .then(console.log);
