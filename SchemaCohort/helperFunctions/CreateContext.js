import axios from "axios";
import CONSTANTS from "../../CONSTANTS.js";
import { generateContextPayload } from "./GenerateContextPayload.js";
import path from "path";
import * as fs from "fs";

async function createContext(
  schemaId,
  schemaName,
  keyName = "disasterNumber",
  type,
  storeName
) {
  const url = CONSTANTS.URL_CONTEXT;
  const token = CONSTANTS.TOKEN_XPX;
  const universeId = CONSTANTS.UNIVERSE_ID_XPX;
  const repetitions = CONSTANTS.CONTEXT_RETRY;

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    accept: "application/json",
  };

  let attempt = 0;
  let returnData = {};

  while (attempt < repetitions) {
    try {
      const contextPayload = generateContextPayload(
        schemaName,
        schemaId,
        universeId,
        keyName
      );

      // API hit
      const response = await axios.post(url, contextPayload, { headers });

      // Store and return data
      if (type === "insertion") {
        returnData = {
          insertionContextId: response.data?.id,
          insertionContextName: schemaName,
          insertionContextStatusCode: response.status,
          insertionContextError: "",
        };
      }

      if (type === "ingestion") {
        returnData = {
          ingestionContextId: response.data?.id,
          ingestionContextName: schemaName,
          ingestionContextStatusCode: response.status,
          ingestionContextError: "",
        };
      }

      // Update the store with the response data
      await updateStore(storeName, returnData);

      console.log("Context created successfully.");
      break; // Exit the loop if successful
    } catch (error) {
      attempt += 1;

      // Store and return error data
      if (type === "insertion") {
        returnData = {
          insertionContextId: "",
          insertionContextName: "",
          insertionContextStatusCode: error?.response?.data?.errorCode,
          insertionContextError: error?.response?.data?.errorMessage,
        };
      }

      if (type === "ingestion") {
        returnData = {
          ingestionContextId: "",
          ingestionContextName: "",
          ingestionContextStatusCode: error?.response?.data?.errorCode,
          ingestionContextError: error?.response?.data?.errorMessage,
        };
      }

      // Update the store with the error data
      await updateStore(storeName, returnData);

      if (attempt >= repetitions) {
        console.log("Max retries reached. Exiting.");
      } else {
        console.log(`Retrying... Attempt ${attempt} of ${repetitions}`);
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
// createContext("schemaId", "schemaName", "keyName", "insertion", "store.json");

export default createContext;
