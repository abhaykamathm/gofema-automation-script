import { promises as fs } from "fs";
import axios from "axios";
import FormData from "form-data";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env

const TOKEN = process.env.WORKFLOW_TOKEN; // Fetch from .env
const TRIGGER_WORKFLOW_ID = process.env.TRIGGER_WORKFLOW_ID; // Fetch from .env

async function triggerWorkflow(insertionSchemaId) {
  try {
    const url = `https://ig.mobiusdtaas.ai/bob-camunda-quarkus/v1.0/camunda/execute/${TRIGGER_WORKFLOW_ID}?env=TEST`;
    const body = new FormData();
    let urlEncoded = encodeURIComponent(insertionSchemaId);
    body.append("schemaIDP2", urlEncoded);

    const response = await axios({
      method: "post",
      url: url,
      data: body,
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "multipart/form-data",
      },
    });

    console.log(response.data);
  } catch (error) {
    console.error("Error in API call:", error);
  }
}

export { triggerWorkflow };
