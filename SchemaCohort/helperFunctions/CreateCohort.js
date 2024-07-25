import axios from "axios";
import { generateCohortPayload } from "./GenerateCohortPayload.js";
import CONSTANTS from "../../CONSTANTS.js";
import path from "path";
import * as fs from "fs";

async function createCohort(schemaId, schemaName, type, storeName) {
  const url = CONSTANTS.URL_COHORT;
  const token = CONSTANTS.TOKEN_XPX;
  const universeId = CONSTANTS.UNIVERSE_ID_XPX;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    accept: "application/json",
  };

  let returnData = {};

  try {
    // cohort payload creation
    const cohortPayload = generateCohortPayload(
      schemaName,
      schemaId,
      universeId
    );
    // api hit
    const response = await axios.post(url, cohortPayload, {
      headers,
    });
    // console.log("cohort", response.data);

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

    // console.log(returnData);
    // return returnData;

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
        ingestionCohortId: "",
        ingestionCohortName: "",
        ingestionStatusCode: "500",
        ingestionCohortError: error?.response?.data?.errorMessage,
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

// createCohort(
//   "66a24bf1f94e743dac786c95",
//   "openfema_Normal_2024-07-25T18:26:35.108"
// );
export default createCohort;
