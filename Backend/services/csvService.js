// services/csvService.js
exports.generateCSV = (data) => {
  const header = "Question,Answer,Feedback,Flagged,CreatedAt\n";
  const rows = data.map(f => 
    `"${f.question}","${f.answer}","${f.feedback}","${f.flagged || false}","${f.createdAt}"`
  ).join("\n");
  return header + rows;
};
