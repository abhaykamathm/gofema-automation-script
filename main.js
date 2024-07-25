import createSchema from "./SchemaCohort/helperFunctions/CreateSchema.js";
import { ingestData } from "./ingest.js";
import createSchemaCohort from "./SchemaCohort/CreateSchemaCohort.js";
import { triggerWorkflow } from "./triggerWorkflow.js";
import {
  readStoreData,
  appendToReport,
  createEmptyStoreFile,
  createReportFile,
} from "./utils/fileUtils.js";
import createCohort from "./SchemaCohort/helperFunctions/CreateCohort.js";
import createBQ from "./SchemaCohort/helperFunctions/CreateBQ.js";
import createContext from "./SchemaCohort/helperFunctions/CreateContext.js";
import generateReport from "./generateReport.js";

let storeData;

async function main(fileIndex) {
  try {
    const storeName = `store${fileIndex}.json`;

    // Create the store file with an empty object
    await createEmptyStoreFile(storeName);
    await createSchema(storeName);
    storeData = await readStoreData(storeName);
    const {
      insertionSchemaId,
      insertionSchemaName,
      ingestionJobSchemaId,
      ingestionJobSchemaName,
    } = storeData;
    await wait(500);
    await createCohort(
      insertionSchemaId,
      insertionSchemaName,
      "insertion",
      storeName
    );
    await createCohort(
      ingestionJobSchemaId,
      ingestionJobSchemaName,
      "ingestion",
      storeName
    );
    await createBQ(
      insertionSchemaId,
      insertionSchemaName,
      "disasterNumber",
      "insertion",
      storeName
    );
    await createBQ(
      ingestionJobSchemaId,
      ingestionJobSchemaName,
      "disasterNumber",
      "ingestion",
      storeName
    );
    await createContext(
      insertionSchemaId,
      insertionSchemaName,
      "disasterNumber",
      "insertion",
      storeName
    );
    await createContext(
      ingestionJobSchemaId,
      ingestionJobSchemaName,
      "disasterNumber",
      "ingestion",
      storeName
    );
    // let insertionSchemaId = storeData.insertionSchemaId;
    // await triggerWorkflow(insertionSchemaId);

    // await ingestData(schemaId);
    // storeData = readStoreData();
  } catch (error) {
    console.error("Error in main execution:", error);
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  await createReportFile();
  for (let i = 0; i < 5; i++) {
    main(i);
  }
}

run();
