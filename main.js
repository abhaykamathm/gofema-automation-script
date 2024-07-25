import createSchema from "./SchemaCohort/helperFunctions/CreateSchema.js";
import { ingestData } from "./ingest.js";
import createSchemaCohort from "./SchemaCohort/CreateSchemaCohort.js";
import { triggerWorkflow } from "./triggerWorkflow.js";
import { readStoreData, appendToReport } from "./utils/fileUtils.js";
import createCohort from "./SchemaCohort/helperFunctions/CreateCohort.js";
import createBQ from "./SchemaCohort/helperFunctions/CreateBQ.js";
import createContext from "./SchemaCohort/helperFunctions/CreateContext.js";

let storeData;

async function main() {
  try {
    // await createSchema();
    // const schemaId = "66a12c3672e881610857cb42"; // Replace with the actual schemaId or fetch it dynamically
    await createSchema();
    storeData = readStoreData();
    const {
      insertionSchemaId,
      insertionSchemaName,
      ingestionJobSchemaId,
      ingestionJobSchemaName,
    } = storeData;
    await wait(500);
    await createCohort(insertionSchemaId, insertionSchemaName, "insertion");
    await createCohort(
      ingestionJobSchemaId,
      ingestionJobSchemaName,
      "ingestion"
    );
    await createBQ(
      insertionSchemaId,
      insertionSchemaName,
      "disasterNumber",
      "insertion"
    );
    await createBQ(
      ingestionJobSchemaId,
      ingestionJobSchemaName,
      "disasterNumber",
      "ingestion"
    );
    await createContext(
      insertionSchemaId,
      insertionSchemaName,
      "disasterNumber",
      "insertion"
    );
    await createContext(
      ingestionJobSchemaId,
      ingestionJobSchemaName,
      "disasterNumber",
      "ingestion"
    );
    // let insertionSchemaId = storeData.insertionSchemaId;
    // await triggerWorkflow(insertionSchemaId);

    // await ingestData(schemaId);
    // storeData = readStoreData();
    storeData = readStoreData();
    appendToReport(storeData);
    console.log("Store data appended to report.json");
  } catch (error) {
    console.error("Error in main execution:", error);
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main();
