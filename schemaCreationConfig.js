import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env

const schema_creation_config = {
  baseURL: "https://ig.gov-cloud.ai/pi-entity-service/v1.0",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.GOFEMA_TOKEN}`, // Use the token from .env
  },
};

export default schema_creation_config;
