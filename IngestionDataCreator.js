import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import crypto from "crypto";
dotenv.config(); // load all .env variables
const apiToken = process.env.GOFEMA_TOKEN;

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${apiToken}`,
};

async function fetchDisastersData() {
  const response = await fetch(
    `https://www.fema.gov/api/open/v1/FemaWebDisasterDeclarations?$top=10`
  );
  if (!response.ok) {
    throw new Error(`API request failed with status ${response?.status}`);
  }
  const data = await response.json();
  return data.FemaWebDisasterDeclarations;
}

async function postDisastersData(schemaId, data) {
  const response = await fetch(
    `https://ig.mobiusdtaas.ai/tf-entity-ingestion/v1.0/schemas/${schemaId}/instances?upsert=true`,
    { method: "POST", headers: headers, body: JSON.stringify(data) }
  );
  if (!response.ok) {
    throw new Error(`API request failed with status ${response?.status}`);
  }
  const finalData = await response.json();
  return finalData.succeededCount;
}

async function fetchData(schemaId) {
  console.log("fetching data...");
  const response = await fetch(
    `https://ig.mobiusdtaas.ai/tf-entity-ingestion/v1.0/schemas/${schemaId}/instances/list`,
    { headers: headers }
  );
  if (!response.ok) {
    throw new Error(`API request failed with status ${response?.status}`);
  }
  const data = await response.json();
  return data.entities;
}

function getDateTime() {
  let currentDate = new Date();
  // IST is UTC + 5:30
  let offset = 5.5 * 60 * 60 * 1000; // offset in milliseconds
  let istDate = new Date(currentDate.getTime() + offset);
  // Convert date to string with milliseconds included
  let istISOString = istDate.toISOString();
  return istISOString;
}

function formatDataAndUpdatePrimaryKey(
  data,
  changePrimaryKey,
  changeBooleanValue
) {
  const keysToUpdate = [
    "ihProgramDeclared",
    "iaProgramDeclared",
    "paProgramDeclared",
    "hmProgramDeclared",
  ];
  for (const disaster of data) {
    if (changePrimaryKey && changeBooleanValue) {
      keysToUpdate.forEach((key) => {
        disaster[key] = disaster[key] ? 1 : 0;
      });
      disaster.timeStamp = `${getDateTime()}+${crypto.randomUUID()}`;
    }
    if (changePrimaryKey) {
      disaster.timeStamp = `${getDateTime()}+${crypto.randomUUID()}`;
    }
    if (changeBooleanValue) {
      keysToUpdate.forEach((key) => {
        disaster[key] = disaster[key] ? 1 : 0;
      });
    }
    if (!disaster.closeoutDate) {
      disaster.closeoutDate = null;
    }
  }
  console.log("formatted data");
  return data;
}

// Function to write data to a file
function writeDataToFile(data) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const sourceFilePath = path.join(__dirname, "source.json");
  fs.writeFile(
    sourceFilePath,
    JSON.stringify(data, null, 2),
    { flag: "w" },
    (err) => {
      if (err) {
        console.error("error writing to file", err);
      } else {
        console.log("data successfully written to source.json");
      }
    }
  );
}

async function simulateWorkflow(schemaId) {
  console.log("simulateWorkflow invoked");
  let disasterData = await fetchDisastersData();
  if (disasterData.length) console.log("fetched disaster data successfully");
  let result = formatDataAndUpdatePrimaryKey(disasterData, true, false);
  // let postResponse = await postDisastersData(schemaId, result);
  // if (postResponse)
  //   console.log(`posted ${postResponse} disaster data successfully`);
  // let postData = await fetchData(schemaId);
  let formattedData = formatDataAndUpdatePrimaryKey(result, false, true);
  writeDataToFile(formattedData);
}

let count = 1;
async function fetchDataAndWriteToFile(schemaId) {
  try {
    // let data = await fetchData(schemaId);
    let data = [];
    if (data.length !== 0) {
      console.log("fetched workflow inserted data");
      let formattedData = formatDataAndUpdatePrimaryKey(data, true, true);
      writeDataToFile(formattedData);
      // isInsertionSchemaEmpty: false
      return;
    } else {
      if (count <= 5) {
        ++count;
        await wait(500);
        fetchDataAndWriteToFile(schemaId);
      } else {
        console.log(schemaId);
        await simulateWorkflow(schemaId);
        // isInsertionSchemaEmpty: true
      }
    }
  } catch (error) {
    console.error("Error fetching data from API", error.message);
    // isInsertionSchemaEmpty: true
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default fetchDataAndWriteToFile;
