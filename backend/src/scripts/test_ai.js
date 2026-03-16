import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

console.log("Key Loaded (partial):", (process.env.GEMINI_API_KEY || "NOT FOUND").substring(0, 5) + "...");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("Hello, how are you?");
    const response = await result.response;
    console.log("Success:", response.text());
  } catch (error) {
    console.error("Error Details:", error);
    if (error.response) console.error("Response:", error.response);
  }
}

test();
