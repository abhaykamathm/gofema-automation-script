import { fetchProcessInstanceResult } from "./processInstanceResult.js";
import { variableInstanceResult } from "./variableInstanceResult.js";
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';
import dotenv from 'dotenv';

async function updateStore(result, key, storeName) {
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
        [key]: result,
        [`${key}updatedAt`]: new Date().toISOString(),
    };

    // Write the updated data back to store.json
    fs.writeFileSync(storeFilePath, JSON.stringify(newData, null, 2), "utf-8");
    console.log("Workflow Data updated in store.json");
}

async function checkWorkflowStatus(processInstanceResult, storeName) {
    let flag = true;
    let count = 0
    while (flag) {
        try {
            // if(storeData.processInstanceResult==undefined){
            //   await new Promise(resolve => setTimeout(resolve, 3000)); 

            // }
            let result = await fetchProcessInstanceResult(processInstanceResult);
            if (!result || !result[0]) {
                console.error("Error: result or result[0] is undefined.");
                await new Promise(resolve => setTimeout(resolve, 5000)); // Adding delay before retrying
                continue; // Retry fetching the result
            }

            console.log(result[0]?.state);
            if (result[0]?.state === "ACTIVE" && count<5) {
                console.log("Workflow Status is Active");
                let variableResult = await variableInstanceResult(processInstanceResult);
                console.log(variableResult[0].name);
                if (variableResult[0].name.indexOf("ERROR") > -1) {
                    console.log("Error in workflow");
                    await updateStore("Error", "workflowStatus", storeName);
                    flag = false;
                }
                count++
            } else {
                if (count<5) {
                    await updateStore("Completed", "workflowStatus", storeName);
                } else {
                    await updateStore("Error", "workflowStatus", storeName);
                }
                // console.log("Hitting undefined");
                flag = false;
            }
            console.log(result[0].state);

        } catch (error) {
            console.error("Error checking workflow status:", error);
            flag = false; // Prevent endless loop on error
        }
        await new Promise(resolve => setTimeout(resolve, 5000)); // Adding delay between checks
    }
}
export { checkWorkflowStatus };
