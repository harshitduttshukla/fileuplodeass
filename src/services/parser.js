export function parseCSVToJson(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];
    console.log("Reading file:", filePath);
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        console.log("Row parsed:", data);
        rows.push(data);
      })
      .on('end', () => {
        console.log("Parsing complete, total rows:", rows.length);
        resolve(rows);
      })
      .on('error', (err) => {
        console.error("CSV parsing error:", err);
        reject(err);
      });
  });
}
