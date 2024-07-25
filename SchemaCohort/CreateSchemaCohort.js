import createSchema from "./helperFunctions/CreateSchema.js";
import createCohort from "./helperFunctions/CreateCohort.js";
import * as fs from "fs";
import fetch from "node-fetch";
import FormData from "form-data";
import path from "path";
import dotenv from "dotenv";

async function createSchemaCohort() {
  // create 2 schemas
  const schemaResponse = await createSchema();

  if (
    schemaResponse.insertionStatusCode >= 400 ||
    schemaResponse.ingestionJobStatusCode >= 400
  ) {
    return schemaResponse.schemaError;
  }

  setTimeout(async () => {
    // create insertion cohort
    const insertionCohortResponse = await createCohort(
      schemaResponse.insertionSchemaId,
      schemaResponse.insertionSchemaName
    );

    // create insertion cohort
    const ingestionCohortResponse = await createCohort(
      schemaResponse.ingestionJobSchemaId,
      schemaResponse.ingestionJobSchemaName
    );

    if (
      insertionCohortResponse.statusCode >= 400 ||
      ingestionCohortResponse.statusCode >= 400
    ) {
      return `${insertionCohortResponse.cohortError}\n${ingestionCohortResponse.cohortError}`;
    }

    const returnData = {
      ...schemaResponse,
      insertionCohortId: insertionCohortResponse.cohortId,
      insertionCohortName: insertionCohortResponse.cohortName,
      insertionCohortStatusCode: insertionCohortResponse.statusCode,
      ingestionCohortId: ingestionCohortResponse.cohortId,
      ingestionCohortName: ingestionCohortResponse.cohortName,
      ingestionCohortStatusCode: ingestionCohortResponse.statusCode,
    };

    // Utility function to update store.json with new data
    async function updateStore() {
      const storeFilePath = path.join(process.cwd(), "store.json");

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
  }, 500);
}

export default createSchemaCohort;
