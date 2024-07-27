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
import { checkWorkflowStatus } from "./checkWorkflowStatus.js";
import CONSTANTS from "./CONSTANTS.js";
import fetchDataAndWriteToFile from "./IngestionDataCreator.js";
// import generateReport from "./generateReport.js";

let storeData;

async function main(fileIndex) {
  try {
    const storeName = `store${fileIndex}.json`;

    // STEP 1 : Create the store file with an empty object
    await createEmptyStoreFile(storeName);

    // STEP 2 : Create the Insertion and Ingestion schemas
    await createSchema(storeName);

    // STEP 3 : Collect schema deatils for further steps
    storeData = await readStoreData(storeName);
    const {
      insertionSchemaId,
      insertionSchemaName,
      ingestionJobSchemaId,
      ingestionJobSchemaName,
    } = storeData;

    // STEP 4 : Create the Cohorts
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

    // STEP 5 : Create the BQs
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

    // STEP 6 : Create the Contexts
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

    // STEP 7 : Read store again for triggering Work Flow
    storeData = await readStoreData(storeName);

    // STEP 8 : Trigger the Work Flow
    if (storeData.insertionSchemaId) {
      await triggerWorkflow(storeData, storeName);
    } else {
      await wait(1000);
    }
    storeData = await readStoreData(storeName);
    if (storeData.processInstanceId) {
      await checkWorkflowStatus(storeData.processInstanceId, storeName);
    }

    // STEP 9 : Read store
    storeData = await readStoreData(storeName);
    console.log("End of updating the wfStatus");

    storeData = await readStoreData(storeName);
    await fetchDataAndWriteToFile(storeData.insertionSchemaId);
    await wait(5000);
    storeData = await readStoreData(storeName);
    await ingestData(storeData.ingestionJobSchemaId, storeName);
    // storeData = readStoreData();
  } catch (error) {
    console.error("Error in main execution:", error);
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  for (let i = 0; i < CONSTANTS.LOOPS; i++) {
    main(i);
  }
}

run();
