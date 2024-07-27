import * as fs from "fs";
import fetch from "node-fetch";
import FormData from "form-data";
import path from "path";
import dotenv from "dotenv";
import getObjectWithSameKeyValue from "./getMappingObject.js";

dotenv.config(); // Load environment variables from .env

// Define the fixed source file path
const SOURCE_FILE_PATH = path.join(process.cwd(), "source.json"); // Use the root directory

const currentDate = new Date();
const isoString = currentDate.toISOString();
const mapping_name = "gofema_mapping_test" + isoString;
const ingest_job_name = "gofema_ingest_test" + isoString;

const TOKEN = process.env.GOFEMA_TOKEN;
const TENANT_ID = process.env.GOFEMA_TENANT_ID;

async function uploadFile(filePath) {
  try {
    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));
    const uploadResponse = await fetch(
      "https://ig.mobiusdtaas.ai/mobius-content-service/v1.0/content/upload?filePathAccess=private&filePath=%2FPI%2FIngestions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          ...form.getHeaders(),
        },
        body: form,
      }
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error("Upload failed:", uploadResponse.status, errorText);
      throw new Error("Failed to upload file");
    }

    const uploadResult = await uploadResponse.json();
    const cdnUrl = uploadResult["cdnUrl"];
    const fullUrl = `https://cdn.mobiusdtaas.ai//${cdnUrl}`;

    console.log("cdn url: ", fullUrl);
    return fullUrl;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

async function createMapping(fullUrl, schemaId) {
  try {
    const mappingResponse = await fetch(
      "https://ig.mobiusdtaas.ai/pi-ingestion-service/api/mappingConfigs",
      {
        method: "POST",
        headers: {
          tenantId: TENANT_ID,
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({
          configName: mapping_name + schemaId,
          configDescription: mapping_name,
          entityId: schemaId,
          entityTenantId: TENANT_ID,
          mapping: {
            mappings: {
              ...getObjectWithSameKeyValue("source.json"),
            },
            sourceEntityId: fullUrl,
            destinationEntityId: schemaId,
          },
          tags: {
            BLUE: ["Schema"],
          },
        }),
      }
    );

    if (!mappingResponse.ok) throw new Error("Failed to create mapping");

    const mappingResult = await mappingResponse.json();
    console.log("Mapping ID:", mappingResult.id);
    return mappingResult.id;
  } catch (error) {
    console.error("Error creating mapping:", error);
    throw error;
  }
}

async function createJob(mappingId, schemaId) {
  try {
    const jobResponse = await fetch(
      "https://ig.mobiusdtaas.ai/pi-ingestion-service/api/jobs?source=JSON&sinks=TI",
      {
        method: "POST",
        headers: {
          tenantId: TENANT_ID,
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({
          fileType: "JSON",
          parallelism: 4,
          tenantId: TENANT_ID,
          universe: "universe",
          name: ingest_job_name + schemaId,
          description: ingest_job_name,
          jobType: "ONE_TIME",
          tags: {
            BLUE: ["Schema"],
          },
          publish: true,
          thumbnail: ["thumbnail1", "thumbnail"],
          mappingId: mappingId,
          source: {
            sourceType: "FILE",
            file: "filelink",
            schemaId: null,
          },
          dataReadAccess: "PUBLIC",
          dataWriteAccess: "PUBLIC",
          metadataReadAccess: "PUBLIC",
          metadataWriteAccess: "PUBLIC",
          execute: "PUBLIC",
          persist: true,
          active: true,
        }),
      }
    );

    const jobResult = await jobResponse.json();
    // console.log(jobResult);
    if (!jobResponse.ok) throw new Error("Failed to create job");
    console.log("Job created with ID:", jobResult?.id);
    return jobResult.id;
  } catch (error) {
    // console.error("MApping error creating job:", error);
    throw error;
  }
}

export async function ingestData(schemaId, storeName) {
  try {
    const fullUrl = await uploadFile(SOURCE_FILE_PATH);
    const mappingId = await createMapping(fullUrl, schemaId);
    const jobId = await createJob(mappingId, schemaId);

    // Utility function to update store.json with new data
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
        sourceCDN: fullUrl,
        mappingId,
        ingestJobId: jobId,
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
    console.error("Error in the ingestion process:", error);
    throw error; // Ensure errors are thrown to be handled by the caller
  }
}

// ingestData("66a3566772e881610857cd06");
