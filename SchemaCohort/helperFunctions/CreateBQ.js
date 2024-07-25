import axios from "axios";
import CONSTANTS from "../../CONSTANTS.js";
import { generateBQPayload } from "./GenerateBQPayload.js";
import path from "path";
import * as fs from "fs";

async function createBQ(
  schemaId,
  schemaName,
  keyName = "disasterNumber",
  type,
  storeName
) {
  const url = CONSTANTS.URL_BQ;
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
    const bqPayload = generateBQPayload(
      schemaId,
      schemaName,
      universeId,
      keyName
    );

    // api hit
    const response = await axios.post(url, bqPayload, {
      headers,
    });
    // console.log(response.data);

    if (type === "insertion") {
      returnData = {
        insertionBqId: response.data?.id,
        insertionBqName: schemaName,
        insertionStatusCode: response.status,
        insertionBqError: "",
      };
    }
    if (type === "ingestion") {
      returnData = {
        ingestionBqId: response.data?.id,
        ingestionBqName: schemaName,
        ingestionStatusCode: response.status,
        ingestionBqError: "",
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
    console.log(error);
    let errorMessage = "";
    returnData.bqId = "";
    returnData.statusCode = 500;
    returnData.bqError = errorMessage?.errorObject?.errorMessage;
    // console.log(returnData);
    return returnData;
  }
}

// createBQ(
//   "66a25e31ba0b922a60abc3c0",
//   "openfema_Normal_2024-07-25T18:26:35.108",
//   "Powait"
// );
export default createBQ;
