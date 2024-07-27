import * as fs from "fs";

/**
 * Reads a JSON file and returns an object with keys and values both being the same as the original keys.
 * @param {string} filename - The name of the JSON file.
 * @returns {Object} - An object with keys and values derived from the JSON file.
 */
export default function getObjectWithSameKeyValue(filename) {
  try {
    // Read the JSON file
    const data = fs.readFileSync(filename, "utf8");

    // Parse the JSON data
    const jsonArray = JSON.parse(data);

    // Assuming the first object in the array contains all the keys
    const firstObject = jsonArray[0];

    // Create a new object with keys and values being the same
    const result = {};
    for (const key in firstObject) {
      if (firstObject.hasOwnProperty(key)) {
        result[key] = key;
      }
    }

    return result;
  } catch (err) {
    console.error(`Error reading or parsing file ${filename}:`, err);
    return null;
  }
}
