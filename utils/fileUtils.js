// utils/fileUtils.js
import { readFile, writeFile, appendFile } from "fs/promises";

export async function createEmptyStoreFile(fileName) {
  const emptyObject = {};
  await writeFile(fileName, JSON.stringify(emptyObject, null, 2), "utf8");
}

export async function createReportFile() {
  const emptyArray = [];
  await writeFile("report.json", JSON.stringify(emptyArray, null, 2), "utf8");
}

export async function readStoreData(fileName) {
  const data = await readFile(fileName, "utf8");
  return JSON.parse(data);
}

export async function appendToReport(storeData, fileName) {
  const reportData = await readFile(fileName, "utf8").catch(() => "[]");
  const parsedReportData = JSON.parse(reportData);
  parsedReportData.push(storeData);
  await writeFile(
    "report.json",
    JSON.stringify(parsedReportData, null, 2),
    "utf8"
  );
}
