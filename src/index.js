const {
  getCohortSheets,
  getConfigForSprint,
  getCohortMetaData,
  fillData,
} = require("./sheets/config.js");

const github = require("./github");

(async () => {
  const cohortSheets = await getCohortSheets();
  for (let cohort of cohortSheets) {
    const header = ["Github Handle"];
    const students = [];
    const cohortMeta = await getCohortMetaData(cohort.sheet);
    for (let sprint of cohortMeta.sprints) {
      const sprintMeta = await getConfigForSprint(sprint);
      console.log(sprintMeta);
      header.push(sprint);
      const repo = cohort.cohort + "-" + sprint;
      for (let [i, student] of cohortMeta.students.entries()) {
        console.log(student);
        students[i] = students[i] || [student.name];
        try {
          let totalCompleted = 0;
          let commits = await github.repos.listCommits({
            owner: student.handle,
            repo,
            per_page: 100,
          });
          for (const commit of commits.data) {
            const message = commit.commit.message.trim();
            if (sprintMeta.commits[message]) {
              totalCompleted += sprintMeta.commits[message];
            }
            //console.log(commit.commit.message);
          }
          students[i].push("=" + totalCompleted + "/" + sprintMeta.total);
          console.log(
            `${
              Math.floor((totalCompleted * 10000) / sprintMeta.total) / 100
            }% of the sprint completed`
          );
        } catch (e) {
          if (!e.status) throw e;
          students[i].push("=0/0");
          console.log(e.request.url);
        }
      }
    }
    let result =
      header.join(", ") +
      "\n" +
      students.reduce((str, row) => str + "\n" + row.join(", "));
    students.unshift(header);
    const res = await fillData(students, cohort.sheet);
    console.log(res);
  }
})();
