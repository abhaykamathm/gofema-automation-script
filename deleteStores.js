import { unlink } from "fs/promises";
import path from "path";

const deleteFiles = async (n) => {
  try {
    for (let i = 0; i < n; i++) {
      const filePath = path.join(process.cwd(), `store${i}.json`);
      await unlink(filePath);
      console.log(`Deleted: ${filePath}`);
    }
    console.log("All specified files deleted successfully!");
  } catch (error) {
    console.error("Error deleting files:", error);
  }
};

// Example usage: delete files store0.json to store4.json
const n = 2000; // Set this to the desired value of n
deleteFiles(n);
