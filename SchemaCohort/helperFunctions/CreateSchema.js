import axios from "axios";
import { generateSchemaPayload } from "./GenerateSchemaPayload.js";
import CONSTANTS from "../../CONSTANTS.js";
import path from "path";
import * as fs from "fs";

async function createSchema(storeName) {
  console.log('entered create schema');
  const url = CONSTANTS.URL_SCHEMA;
  const token = CONSTANTS.TOKEN_XPX;
  const universeId = CONSTANTS.UNIVERSE_ID_XPX;

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    accept: "application/json",
  };

  // create timestamp
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60000; // Offset in milliseconds
  const timestamp = new Date(date - offset).toISOString().slice(0, -1);

  let returnData = {
    insertionSchemaId: "",
    insertionSchemaName: "",
    insertionStatusCode: 0,
    ingestionJobSchemaId: "",
    ingestionJobSchemaName: "",
    ingestionJobStatusCode: 0,
    schemaError: "",
  };

  try {
    // schema payload creation
    const schemaPayloadNormal = generateSchemaPayload(
      `openfema_Normal_${timestamp}`,
      universeId
    );
    const schemaPayloadIngestion = generateSchemaPayload(
      `openfema_Ingestion_${timestamp}`
    );
    // api hit
    const responseNormal = await axios.post(url, schemaPayloadNormal, {
      headers,
    });
    const responseIngestion = await axios.post(url, schemaPayloadIngestion, {
      headers,
    });

    // store, return data
    returnData.insertionSchemaId = responseNormal.data?.schemaId;
    returnData.insertionSchemaName = responseNormal.data?.entitySchema?.name;
    returnData.insertionStatusCode = responseNormal.status;
    returnData.ingestionJobSchemaId = responseIngestion.data?.schemaId;
    returnData.ingestionJobSchemaName =
      responseIngestion.data?.entitySchema?.name;
    returnData.ingestionJobStatusCode = responseIngestion.status;
    // console.log(returnData);
    // return returnData;

    // Utility function to update store.json with new data
    async function updateStore() {
      const storeFilePath = path.join(process.cwd(), storeName);

      let existingData = {};

      // Read the existing store.json content
      if (fs.existsSync(storeFilePath)) {
        const storeContent = fs.readFileSync(storeFilePath, "utf-8");
        existingData = JSON.parse(storeContent);
      }

      console.log(returnData);
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
    let errorMessage = error.response ? error.response.data : error.message;
    console.error("Schema Error:", error);
    returnData.insertionSchemaId = "";
    returnData.insertionSchemaName = "";
    returnData.insertionStatusCode = error?.response?.data?.errorCode;
    returnData.ingestionJobSchemaId = "";
    returnData.ingestionJobSchemaName = "";
    returnData.ingestionJobStatusCode = error?.response?.data?.errorCode;
    returnData.schemaError = error?.response?.data?.errorMessage;

    return returnData;
  }
}

// createSchema();
export default createSchema;
