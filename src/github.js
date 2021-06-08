const { Octokit } = require("@octokit/rest");
const { githubApiKey } = require("../config.js");

const octokit = new Octokit({
  auth: githubApiKey,
  userAgent: "sprintTracker v0.1.0",
});

module.exports = octokit;
