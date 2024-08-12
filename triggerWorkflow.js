import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config(); // Load environment variables from .env

const TOKEN = process.env.WORKFLOW_TOKEN; // Fetch from .env
const TRIGGER_WORKFLOW_ID = process.env.TRIGGER_WORKFLOW_ID; // Fetch from .env

async function updateStore(processInstanceId, storeName) {

  try {
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
      processInstanceId, // Add process instance result
      processInstanceResultUpdatedAt: new Date().toISOString(),
    };

    // Write the updated data back to store.json
    fs.writeFileSync(storeFilePath, JSON.stringify(newData, null, 2), "utf-8");
    console.log("Process instance result updated in", storeName);
  } catch (error) {
console.log("read error==========================================",error)
  }
}

async function triggerWorkflow(storeData, storeName) {
  try {
    // console.log(DEBUG);  
    let insertionSchemaId = storeData.insertionSchemaId;
    const url = `https://ig.gov-cloud.ai/bob-camunda-quarkus/v1.0/camunda/execute/${TRIGGER_WORKFLOW_ID}?env=TEST`;
    const body = new FormData();
    // let urlEncoded = encodeURIComponent(insertionSchemaId);
    // body.append("schemaid", urlEncoded);
    body.append("schemaIdPost", insertionSchemaId);

    const response = await axios({
      method: "post",
      url: url,
      data: body,
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "multipart/form-data",
      },
    });

    // console.log(response.data);
    // Assuming processInstanceID is part of the response
    // return response.data.processInstanceId;
    let processInstanceId = response.data.processInstanceId;

    // Fetch the process instance result
    // const processInstanceResult = await fetchProcessInstanceResult(processInstanceId);

    // Update the store with the new data
    await updateStore(processInstanceId, storeName);
  } catch (error) {
    console.error("Error in API call:", error);
  }
}



export { triggerWorkflow };
