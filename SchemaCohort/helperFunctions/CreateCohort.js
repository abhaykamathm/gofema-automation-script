import axios from "axios";
import { generateCohortPayload } from "./GenerateCohortPayload.js";
import CONSTANTS from "../../CONSTANTS.js";
import path from "path";
import * as fs from "fs";

async function createCohort(schemaId, schemaName, type, storeName) {
  const url = CONSTANTS.URL_COHORT;
  const token = CONSTANTS.TOKEN_XPX;
  const universeId = CONSTANTS.UNIVERSE_ID_XPX;
  const repetition = CONSTANTS.COHORT_RETRY;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    accept: "application/json",
  };

  let attempt = 0;
  let returnData = {};

  while (attempt < repetition) {
    try {
      // cohort payload creation
      const cohortPayload = generateCohortPayload(
        schemaName,
        schemaId,
        universeId
      );

      // api hit
      const response = await axios.post(url, cohortPayload, { headers });

      // store, return data
      if (type === "insertion") {
        returnData = {
          insertionCohortId: response.data?.id,
          insertionCohortName: schemaName,
          insertionStatusCode: response.status,
          insertionCohortError: "",
        };
      }

      if (type === "ingestion") {
        returnData = {
          ingestionCohortId: response.data?.id,
          ingestionCohortName: schemaName,
          ingestionStatusCode: response.status,
          ingestionCohortError: "",
        };
      }

      // Update the store with the response data
      await updateStore(storeName, returnData);

      console.log("Cohort created successfully.");
      break; // Exit the loop if successful
    } catch (error) {
      attempt += 1;

      // Update the store with error information
      returnData = {
        ingestionCohortId: "",
        ingestionCohortName: "",
        ingestionStatusCode: error?.response?.data?.errorCode,
        ingestionCohortError: error?.response?.data?.errorMessage,
      };
      await updateStore(storeName, returnData);

      if (attempt >= repetition) {
        console.log("Max retries reached. Exiting.");
      } else {
        console.log(`Retrying... Attempt ${attempt} of ${repetition}`);
      }
    }
  }
}

// Helper function to update the store
async function updateStore(storeName, data) {
  const storeFilePath = path.join(process.cwd(), storeName);

  let existingData = {};

  // Read the existing store.json content
  if (fs.existsSync(storeFilePath)) {
    const storeContent = fs.readFileSync(storeFilePath, "utf-8");
    existingData = JSON.parse(storeContent);
  }

  // Update with new data
  const newData = {
    ...existingData,
    ...data,
  };

  // Write the updated data back to store.json
  fs.writeFileSync(storeFilePath, JSON.stringify(newData, null, 2), "utf-8");
  console.log("Data updated in store.json");
}

// Usage:
// createCohort("66a24bf1f94e743dac786c95", "openfema_Normal_2024-07-25T18:26:35.108", "insertion", "store.json", 5);

export default createCohort;
