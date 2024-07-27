import { readFile, writeFile } from "fs/promises";

async function generateReport() {
  try {
    // Read the JSON data from report.json
    const data = await readFile("report.json", "utf8");

    // Parse the JSON data
    const reportData = JSON.parse(data);

    // Check if the data is not empty
    if (reportData.length === 0) {
      console.error("No data available in report.json");
      return;
    }

    // Get the keys from the first object to use as headers
    const headers = Object.keys(reportData[0]);

    // Create an array to store the report lines
    const reportLines = [];

    // Add the header line
    reportLines.push(headers.join("\t"));

    // Add the data lines
    reportData.forEach((item) => {
      const row = headers.map((header) => item[header]);
      reportLines.push(row.join("\t"));
    });

    // Write the report lines to report.txt
    await writeFile("report.txt", reportLines.join("\n"), "utf8");
    console.log("Report generated successfully.");
  } catch (err) {
    console.error("Error:", err);
  }
}

export default generateReport;

// generateReport();
