import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import schema_creation_config from "./schemaCreationConfig.js";
import schemaData from "./schemaData.js";

// Convert __dirname for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_FILE_PATH = path.join(__dirname, "store.json");

export async function createSchema() {
  try {
    const response = await axios.post(
      `${schema_creation_config.baseURL}/schemas`,
      schemaData,
      {
        headers: schema_creation_config.headers,
      }
    );

    // Update the config with tenantID and schemaID from the response
    if (response.data && response.data.tenantID && response.data.schemaId) {
      // Read the existing store.json file
      // let config = {};
      // if (fs.existsSync(CONFIG_FILE_PATH)) {
      //   const fileContent = fs.readFileSync(CONFIG_FILE_PATH, "utf-8");
      //   config = JSON.parse(fileContent);
      // }

      // // Update the config object
      // config.tenantID = response.data.tenantID;
      // config.schemaID = response.data.schemaId;
      // config.createdAt = getDateTime();
      // console.log("Tenant ID stored:", config.tenantID);
      // console.log("Schema ID stored:", config.schemaID);
      // console.log("Schema created at:", config.createdAt);
      console.log(response.data.schemaId);

      // Write the updated config object back to the store.json file
      // fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config, null, 2));
      console.log("Config written to store.json");
    } else {
      console.error("Tenant ID or Schema ID not found in the response.");
    }
  } catch (error) {
    console.error("Error creating schema:", error);
    throw error; // Ensure the promise is rejected in case of error
  }
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

createSchema();
