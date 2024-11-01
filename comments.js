const duration = "3";
const recommendation =
  "Practice designing and applying the Agile techniques and principles discussed in this course.";


function processComment(name, comment1, comment2) {
  // ------------------------------------------------------------

  let firstname = name.split(" ")[0];
  let com1 = "";
  let com2 = "";
  if (comment1.trim() != "")
    com1 = `${firstname} made the following comments about the course: ${comment1.replace(
      "\n",
      "<br />"
    )}<br />`;
  if (comment2.trim() != "")
    com2 = `When I asked what to do after the course, ${firstname} told me: ${comment2.replace(
      "\n",
      "<br />"
    )}<br />`;

  return `${name}<br /> 
General comments:<br />
${firstname} did well in this course and I am happy with ${firstname}'s progress.<br />
${com1}<br />Punctuality & Engagement:<br />
${firstname} was always punctual during the ${duration} days of the course and was engaged during the lectures.<br /><br />
Recommendations for further learning:<br />
${recommendation}<br /> ${com2}<br />--------------------------------<br />`;
}

function deleteComments(fs) {
  fs.writeFile("comments.txt", "", { encoding: "utf8" }, (err) => {
    if (err) {
      throw err;
    }
  });
}

function saveComments(req, fs) {
  let data = req.body;
  let comments = processComment(
    data.txtName,
    data.txtComment1,
    data.txtComment2
  );
  fs.appendFile("comments.txt", comments, { encoding: "utf8" }, (err) => {
    if (err) {
      throw err;
    }
  });
}

module.exports = {
  processComment,
  deleteComments,
  saveComments,
};
