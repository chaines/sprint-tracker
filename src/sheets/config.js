const { google } = require("googleapis");
const { googleTokenPath, configSheetId } = require("../../config");
const READONLY_SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets.readonly",
];

const readOnlyAuth = new google.auth.GoogleAuth({
  keyFile: googleTokenPath,
  scopes: READONLY_SCOPES,
});
const writeAuth = new google.auth.GoogleAuth({
  keyFile: googleTokenPath,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth: readOnlyAuth });
const writeSheets = google.sheets({ version: "v4", auth: writeAuth });

const getCohortSheets = async () => {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: configSheetId,
    range: "cohort_config!A2:B",
  });
  return res.data.values.map((row) => ({ cohort: row[0], sheet: row[1] }));
};

const getConfigForSprint = async (sprint) => {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: configSheetId,
    range: sprint + "!A2:B",
  });
  let total =
    res.data.values?.reduce((p, c) => p + (Number(c[1]) || 10), 0) || 0;
  let commits =
    res.data.values?.reduce((p, c) => {
      p[c[0]] = Number(c[1]) || 10;
      return p;
    }, {}) || {};
  if (total === 0) {
    total = 1;
    commits["complete"] = 1;
  }
  return { total, commits };
};

const getCohortMetaData = async (sheetId) => {
  const res = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: sheetId,
    ranges: ["config_students!A2:C", "config_sprints!B1:B30"],
  });
  const students = res.data.valueRanges[0].values
    .map((row) => ({
      name: row[0],
      handle: row[1],
      email: row[2],
    }))
    .filter((student) => student.name);
  const sprints = res.data.valueRanges[1].values
    .map((row) => row[0])
    .filter((row) => row);
  return { students, sprints };
};

const fillData = async (data, sheetId) => {
  const res = await writeSheets.spreadsheets.values.batchUpdate({
    spreadsheetId: sheetId,
    resource: {
      valueInputOption: "USER_ENTERED",
      data: [
        {
          range: "RAW_DATA!A1",
          majorDimension: "ROWS",
          values: data,
        },
      ],
    },
  });
  return res;
};

module.exports.getCohortSheets = getCohortSheets;
module.exports.getConfigForSprint = getConfigForSprint;
module.exports.getCohortMetaData = getCohortMetaData;
module.exports.fillData = fillData;
