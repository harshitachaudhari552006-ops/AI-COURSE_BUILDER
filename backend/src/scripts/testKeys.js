import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const testKeys = async () => {
    console.log('--- TESTING AI KEYS ---');
    
    // Test Gemini
    if (process.env.GEMINI_API_KEY) {
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent("Say hello");
            console.log('✅ Gemini (Content) Key: WORKS');
        } catch (e) {
            console.log('❌ Gemini (Content) Key:', e.message);
        }
    } else {
        console.log('⚠️ Gemini (Content) Key: MISSING');
    }

    if (process.env.CHAT_GEMINI_API_KEY) {
        try {
            const genAI = new GoogleGenerativeAI(process.env.CHAT_GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent("Say hello");
            console.log('✅ Gemini (Chat) Key: WORKS');
        } catch (e) {
            console.log('❌ Gemini (Chat) Key:', e.message);
        }
    } else {
        console.log('⚠️ Gemini (Chat) Key: MISSING');
    }

    // Test OpenAI
    if (process.env.OPENAI_API_KEY) {
        try {
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: "Say hello" }],
            });
            console.log('✅ OpenAI (Content) Key: WORKS');
        } catch (e) {
            console.log('❌ OpenAI (Content) Key:', e.message);
        }
    } else {
        console.log('⚠️ OpenAI (Content) Key: MISSING');
    }

    if (process.env.CHAT_OPENAI_API_KEY) {
        try {
            const openai = new OpenAI({ apiKey: process.env.CHAT_OPENAI_API_KEY });
            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: "Say hello" }],
            });
            console.log('✅ OpenAI (Chat) Key: WORKS');
        } catch (e) {
            console.log('❌ OpenAI (Chat) Key:', e.message);
        }
    } else {
        console.log('⚠️ OpenAI (Chat) Key: MISSING');
    }
};

testKeys();
