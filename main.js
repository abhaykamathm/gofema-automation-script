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
// import generateReport from "./generateReport.js";

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
    // -------------------------------------------------
    // Cohort Creation
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
    // -------------------------------------
    // BQ Creation
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
    // ----------------------------
    // Context Creation
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

    storeData = await readStoreData(storeName);

    // let insertionSchemaId = storeData.insertionSchemaId;
    // console.log(`Store data before updation of triggerWF: ${JSON.stringify(storeData, null, 2)}`);
    if (storeData.insertionSchemaId) {
      await triggerWorkflow(storeData, storeName);
    } else {
      await wait(1000);
    }
    storeData = await readStoreData(storeName);
    // console.log(`Store data after updation of triggerWF: ${JSON.stringify(storeData, null, 2)}`);
    // console.log("End of updating the wf");
    if (storeData.processInstanceId) {
      await checkWorkflowStatus(storeData.processInstanceId, storeName);
    }
    storeData = await readStoreData(storeName);
    // console.log(`Store data after updation of WFStatus: ${JSON.stringify(storeData, null, 2)}`);
    console.log("End of updating the wfStatus");
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
  // await createReportFile();
  for (let i = 0; i < CONSTANTS.LOOPS; i++) {
    main(i);
  }
}

run();
