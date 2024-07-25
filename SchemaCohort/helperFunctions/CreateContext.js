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

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    accept: "application/json",
  };

  let returnData = {};

  try {
    var contextPayload = generateContextPayload(
      schemaName,
      schemaId,
      universeId,
      keyName
    );

    // api hit
    const response = await axios.post(url, contextPayload, {
      headers,
    });

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
    async function updateStore() {
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
        ...returnData,
      };

      // Write the updated data back to store.json
      fs.writeFileSync(
        storeFilePath,
        JSON.stringify(newData, null, 2),
        "utf-8"
      );
      console.log("Data updated in store.json");
    }
    await updateStore();
  } catch (error) {
    async function updateStore() {
      const storeFilePath = path.join(process.cwd(), storeName);

      let existingData = {};

      // Read the existing store.json content
      if (fs.existsSync(storeFilePath)) {
        const storeContent = fs.readFileSync(storeFilePath, "utf-8");
        existingData = JSON.parse(storeContent);
      }

      let returnData = {
        ingestionContextId: "",
        ingestionContextName: "",
        ingestionStatusCode: error?.response?.data?.errorCode,
        ingestionContextError: error?.response?.data?.errorMessage,
      };
      // Update with new data
      const newData = {
        ...existingData,
        ...returnData,
      };

      // Write the updated data back to store.json
      fs.writeFileSync(
        storeFilePath,
        JSON.stringify(newData, null, 2),
        "utf-8"
      );
      console.log("Data updated in store.json");
    }
    await updateStore();
  }
}
export default createContext;
