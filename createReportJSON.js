import { readFile, writeFile } from "fs/promises";
import path from "path";

// Function to read JSON file and parse its content
const readJSONFile = async (filePath) => {
  try {
    const data = await readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    throw new Error(`Error reading file ${filePath}: ${error.message}`);
  }
};

// Function to write data to JSON file
const writeJSONFile = async (filePath, data) => {
  try {
    await writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    throw new Error(`Error writing file ${filePath}: ${error.message}`);
  }
};

// Main function to merge contents of store0.json to store4.json into report.json
const mergeStoresToReport = async () => {
  try {
    const reportPath = path.join(process.cwd(), "report.json");
    const mergedData = [];

    for (let i = 0; i < 3; i++) {
      const filePath = path.join(process.cwd(), `store${i}.json`);
      const data = await readJSONFile(filePath);
      mergedData.push(data); // Assuming each store file contains an array of objects
    }

    await writeJSONFile(reportPath, mergedData);
    console.log("Report.json created successfully!");
  } catch (error) {
    console.error("Error while merging stores:", error);
  }
};

mergeStoresToReport();
