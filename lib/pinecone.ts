import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from "dotenv";
dotenv.config();

if (!process.env.PINECONE_API_KEY) {
  throw new Error("PINECONE_API_KEY is not defined");
}

export const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});
export const INDEX_NAME = "greptile"
