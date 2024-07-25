import fs from "fs";
import path from "path";

// Convert __dirname for ES module
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STORE_FILE_PATH = path.join(__dirname, "../store.json");
const REPORT_FILE_PATH = path.join(__dirname, "../report.json");

export function readStoreData() {
  if (fs.existsSync(STORE_FILE_PATH)) {
    const storeContent = fs.readFileSync(STORE_FILE_PATH, "utf-8");
    return JSON.parse(storeContent);
  }
  return {}; // Return an empty object if store.json does not exist
}

export function appendToReport(storeData) {
  let reportData = [];
  if (fs.existsSync(REPORT_FILE_PATH)) {
    const reportContent = fs.readFileSync(REPORT_FILE_PATH, "utf-8");
    reportData = JSON.parse(reportContent);
  }
  reportData.push(storeData);
  fs.writeFileSync(REPORT_FILE_PATH, JSON.stringify(reportData, null, 2));
}
