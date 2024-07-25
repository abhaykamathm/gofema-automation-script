import * as fs from "fs";
import fetch from "node-fetch";
import FormData from "form-data";
import path from "path";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env

// Define the fixed source file path
const SOURCE_FILE_PATH = path.join(process.cwd(), "source.json"); // Use the root directory

const currentDate = new Date();
const isoString = currentDate.toISOString();
const mapping_name = "reveee_epg_mapping_test" + isoString;
const ingest_job_name = "reveee_epg_ingest_test" + isoString;

const TOKEN = process.env.TOKEN;
const TENANT_ID = "3ce05d1d-cfe2-47d5-bcc0-9c98a2b4f941";

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
          configName: mapping_name,
          configDescription: mapping_name,
          entityId: schemaId,
          entityTenantId: TENANT_ID,
          mapping: {
            mappings: {
              programme_id: "programme_id",
              programme_start: "programme_start",
              programme_stop: "programme_stop",
              channel_id: "channel_id",
              channel_name: "channel_name",
              url: "url",
              programme_title: "programme_title",
              programme_lang: "programme_lang",
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
    return mappingResult.id;
  } catch (error) {
    console.error("Error creating mapping:", error);
    throw error;
  }
}

async function createJob(mappingId) {
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
          name: ingest_job_name,
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

    if (!jobResponse.ok) throw new Error("Failed to create job");

    const jobResult = await jobResponse.json();
    console.log("Job created with ID:", jobResult.id);
    return jobResult.id;
  } catch (error) {
    console.error("Error creating job:", error);
    throw error;
  }
}

// Utility function to update store.json with new data
async function updateStore(cdnUrl, mappingId, jobId) {
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
    cdnUrl,
    mappingId,
    ingestJobId: jobId,
    updatedAt: new Date().toISOString(),
  };

  // Write the updated data back to store.json
  fs.writeFileSync(storeFilePath, JSON.stringify(newData, null, 2), "utf-8");
  console.log("Data updated in store.json");
}

export async function ingestData(schemaId) {
  try {
    const fullUrl = await uploadFile(SOURCE_FILE_PATH);
    const mappingId = await createMapping(fullUrl, schemaId);
    const jobId = await createJob(mappingId);

    // Update the store.json with new data
    await updateStore(fullUrl, mappingId, jobId);
  } catch (error) {
    console.error("Error in the ingestion process:", error);
    throw error; // Ensure errors are thrown to be handled by the caller
  }
}
