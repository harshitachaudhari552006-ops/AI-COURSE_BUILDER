import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import AIContent from '../models/AIContent.js';
import AIQuestion from '../models/AIQuestion.js';

// Initialize AI clients
let contentGeminiClient = null;
let contentOpenAIClient = null;
let chatGeminiClient = null;
let chatOpenAIClient = null;

const isGeminiKey = (key) => key?.startsWith('AIzaSy');
const isOpenAIKey = (key) => key?.startsWith('sk-');

// MANUAL OVERRIDE (Only use if .env is not loading correctly)
const OVERRIDE_GEMINI_KEY = ""; 

const getOpenAIModel = () =>
  (process.env.OPENAI_MODEL || '').trim() || 'gpt-4o-mini';

const getChatOpenAIModel = () =>
  (process.env.CHAT_OPENAI_MODEL || '').trim() || getOpenAIModel();

const summarizeProviderError = (e) => {
  const status = e?.status ?? e?.response?.status;
  const code = e?.code;
  const message = e?.message || String(e);
  const bodyMessage =
    e?.response?.data?.error?.message ||
    e?.response?.data?.message ||
    e?.error?.message;

  return {
    status,
    code,
    message,
    bodyMessage,
  };
};

// Get AI provider based on preference and availability
const getAIProvider = (feature = 'content') => {
  initializeClients();
  const preferred = process.env.PREFERRED_AI_PROVIDER || 'GEMINI';

  if (feature === 'chat') {
    if (preferred === 'OPENAI' && chatOpenAIClient) return 'OPENAI';
    if (chatGeminiClient) return 'GEMINI';
    if (chatOpenAIClient) return 'OPENAI';
  }
  
  if (preferred === 'OPENAI' && contentOpenAIClient) return 'OPENAI';
  if (contentGeminiClient) return 'GEMINI';
  if (contentOpenAIClient) return 'OPENAI';
  
  return null;
};

// Lazy initialization to ensure process.env is ready
function initializeClients() {
  if (contentGeminiClient || contentOpenAIClient || chatGeminiClient || chatOpenAIClient) return;

  const mainGeminiKey = OVERRIDE_GEMINI_KEY || process.env.GEMINI_API_KEY?.trim();
  const mainOpenAIKey = process.env.OPENAI_API_KEY?.trim();
  const chatGeminiKey = OVERRIDE_GEMINI_KEY || process.env.CHAT_GEMINI_API_KEY?.trim();
  const chatOpenAIKey = process.env.CHAT_OPENAI_API_KEY?.trim();
  const geminiModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

  // Content Clients
  if (mainGeminiKey) {
    if (isGeminiKey(mainGeminiKey)) {
      contentGeminiClient = new GoogleGenerativeAI(mainGeminiKey);
      console.log('✅ Content Gemini initialized');
    } else if (isOpenAIKey(mainGeminiKey)) {
      contentOpenAIClient = new OpenAI({ apiKey: mainGeminiKey });
      console.log('✅ Content OpenAI initialized (from Gemini key)');
    }
  }
  if (mainOpenAIKey && !contentOpenAIClient) {
    contentOpenAIClient = new OpenAI({ apiKey: mainOpenAIKey });
    console.log('✅ Content OpenAI initialized');
  }

  // Chat Clients
  if (chatGeminiKey) {
    if (isGeminiKey(chatGeminiKey)) {
      chatGeminiClient = new GoogleGenerativeAI(chatGeminiKey);
      console.log('✅ Chat Gemini initialized');
    } else if (isOpenAIKey(chatGeminiKey)) {
      chatOpenAIClient = new OpenAI({ apiKey: chatGeminiKey });
      console.log('✅ Chat OpenAI initialized (from Gemini key)');
    }
  }
  if (chatOpenAIKey && !chatOpenAIClient) {
    chatOpenAIClient = new OpenAI({ apiKey: chatOpenAIKey });
    console.log('✅ Chat OpenAI initialized');
  }

  if (!chatGeminiClient && !chatOpenAIClient && !contentGeminiClient && !contentOpenAIClient) {
    console.warn('⚠️ No AI API keys found in environment variables.');
  }
}

// Robust generation helper that handles model rotation and key rotation
const robustGenerateContent = async (feature, prompt, fallbackContent) => {
  const provider = getAIProvider(feature);
  const primaryGemini = feature === 'chat' ? chatGeminiClient : contentGeminiClient;
  const backupGemini = feature === 'chat' ? contentGeminiClient : chatGeminiClient;
  const openai = feature === 'chat' ? chatOpenAIClient : contentOpenAIClient;
  
  const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro', 'gemini-pro'];

  const preferred = process.env.PREFERRED_AI_PROVIDER || 'GEMINI';

  // Strategy A: Try OpenAI if it's preferred
  if (preferred === 'OPENAI' && openai) {
    try {
      const response = await openai.chat.completions.create({
        model: getOpenAIModel(),
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
      });
      return response.choices[0].message.content;
    } catch (e) {
      console.warn(`[RESCUE] Preferred OpenAI failed`);
    }
  }

  // Strategy B: Try Gemini Primary
  if (primaryGemini) {
    for (const modelName of models) {
      try {
        const config = { model: modelName };
        if (modelName.includes('1.5') || modelName.includes('2.0')) {
          config.tools = [{ googleSearchRetrieval: {} }];
        }
        const model = primaryGemini.getGenerativeModel(config);
        const result = await model.generateContent(prompt);
        if (result.response) return result.response.text();
      } catch (e) {
        console.warn(`[RESCUE] Primary key failed with ${modelName}: ${e.message}`);
      }
    }
  }

  // Strategy C: Try OpenAI if it wasn't already tried as preferred
  if (preferred !== 'OPENAI' && openai) {
    try {
      const response = await openai.chat.completions.create({
        model: getOpenAIModel(),
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
      });
      return response.choices[0].message.content;
    } catch (e) {
      console.warn(`[RESCUE] Fallback OpenAI failed`);
    }
  }

  // Try Gemini Backup
  if (backupGemini && backupGemini !== primaryGemini) {
    for (const modelName of models) {
      try {
        const model = backupGemini.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        if (result.response) return result.response.text();
      } catch (e) {
        console.warn(`[RESCUE] Backup key failed with ${modelName}`);
      }
    }
  }

  console.error("🚨 ALL AI PROVIDERS BLOCKED. Returning local rescue content.");
  return fallbackContent;
};

// HELPER: Format history for Gemini
function formatGeminiHistory(history) {
  // Gemini requires history to alternate user/model and start with user
  return history
    .map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }],
    }))
    .filter((h, idx, arr) => {
      // Skip first message if it's from the model (Gemini requirement)
      if (idx === 0 && h.role === 'model') return false;
      return true;
    });
}

// Generate extra notes using AI
export const generateExtraNotes = async (moduleId, topic, officialNotes) => {
  try {
    const fallback = `Extra Notes for "${topic}": 
1. Introduction: ${topic} is a fundamental concept in engineering.
2. Key Concepts: Includes efficiency, scalability, and design patterns.
3. Conclusion: Mastery of ${topic} is essential for modern engineers.`;

    const content = await robustGenerateContent('content', `Provide comprehensive extra notes for: "${topic}". Context: ${officialNotes || 'None'}`, fallback);

    // Save or update AI content
    let aiContent = await AIContent.findOne({ module: moduleId, topic });
    if (!aiContent) {
      aiContent = new AIContent({ module: moduleId, topic, extraNotes: content, aiProvider: 'RESCUE' });
    } else {
      aiContent.extraNotes = content;
      aiContent.aiProvider = 'RESCUE';
      aiContent.lastUpdated = new Date();
    }
    await aiContent.save();

    return content;
  } catch (error) {
    console.error('Error generating extra notes:', error);
    throw new Error('Failed to generate AI content');
  }
};

// Generate numericals
export const generateNumericals = async (moduleId, topic, count = 5) => {
  try {
    const fallbackJSON = JSON.stringify([
      { question: `Conceptual problem on ${topic}`, solution: "Apply basic boundary conditions and integrate.", difficulty: "MEDIUM" },
      { question: `Numerical calculation for ${topic} parameters`, solution: "Using the formula P = IV, we find the result.", difficulty: "HARD" }
    ]);

    const prompt = `Generate ${count} engineering numerical problems with complete solutions for "${topic}". Format as strictly valid JSON array.`;
    const responseText = await robustGenerateContent('content', prompt, fallbackJSON);
    
    let numericals;
    try {
      numericals = JSON.parse(responseText.replace(/```json\n?|\n?```/g, ''));
    } catch (e) {
      numericals = JSON.parse(fallbackJSON);
    }

    let aiContent = await AIContent.findOne({ module: moduleId, topic });
    if (!aiContent) {
      aiContent = new AIContent({ module: moduleId, topic, numericals, aiProvider: 'RESCUE' });
    } else {
      aiContent.numericals = numericals;
      aiContent.aiProvider = 'RESCUE';
      aiContent.lastUpdated = new Date();
    }
    await aiContent.save();
    return numericals;
  } catch (error) {
    console.error('Error generating numericals:', error);
    throw new Error('Failed to generate numericals');
  }
};

// Generate exam points
export const generateExamPoints = async (moduleId, topic) => {
  try {
    const fallback = `1. Core definition of ${topic}
2. Governing equations and laws
3. Typical exam questions on ${topic} applications`;

    const content = await robustGenerateContent('content', `List 5-10 key exam points for ${topic}. Bear in mind this is for engineering.`, fallback);

    const points = content.split('\n').filter(line => line.trim().length > 0).slice(0, 10);

    let aiContent = await AIContent.findOne({ module: moduleId, topic });
    if (!aiContent) {
      aiContent = new AIContent({ module: moduleId, topic, examPoints: points, aiProvider: 'RESCUE' });
    } else {
      aiContent.examPoints = points;
      aiContent.aiProvider = 'RESCUE';
      aiContent.lastUpdated = new Date();
    }
    await aiContent.save();

    return points;
  } catch (error) {
    console.error('Error generating exam points:', error);
    throw new Error('Failed to generate exam points');
  }
};

// Generate YouTube links (using AI to suggest relevant topics)
export const generateYouTubeLinks = async (moduleId, topic) => {
  try {
    const fallbackJSON = JSON.stringify([
      { title: `${topic} Engineering Basics`, description: "A fundamental guide to understanding the basics of this topic." },
      { title: `Advanced ${topic} Explained`, description: "Technical deep-dive into complex engineering applications." }
    ]);
    
    const prompt = `Suggest YouTube video topics for engineering students on: "${topic}". Return JSON array with title and description.`;
    const responseText = await robustGenerateContent('content', prompt, fallbackJSON);
    
    let suggestions;
    try {
      suggestions = JSON.parse(responseText.replace(/```json\n?|\n?```/g, ''));
    } catch (e) {
      suggestions = JSON.parse(fallbackJSON);
    }

    const links = suggestions.map(s => ({
      title: s.title,
      description: s.description,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(s.title)}`
    }));

    let aiContent = await AIContent.findOne({ module: moduleId, topic });
    if (!aiContent) {
      aiContent = new AIContent({ module: moduleId, topic, youtubeLinks: links, aiProvider: 'RESCUE' });
    } else {
      aiContent.youtubeLinks = links;
      aiContent.aiProvider = 'RESCUE';
      aiContent.lastUpdated = new Date();
    }
    await aiContent.save();

    return links;
  } catch (error) {
    console.error('Error generating YouTube links:', error);
    throw new Error('Failed to generate YouTube links');
  }
};

// Generate AI predicted questions
export const generatePredictedQuestions = async (subjectId, moduleId, topic, count = 10) => {
  try {
    const fallbackJSON = JSON.stringify([
      { question: `Define the core principles of ${topic}.`, answer: "The principles involve energy conservation and modularity.", type: "SHORT_ANSWER", marks: 5, difficulty: "EASY" },
      { question: `Explain the impact of ${topic} on system stability.`, answer: "Stability is improved by damping and feedback loops.", type: "LONG_ANSWER", marks: 10, difficulty: "MEDIUM" }
    ]);

    const prompt = `Generate ${count} exam-style engineering questions for "${topic}". Format as strictly valid JSON array.`;
    const responseText = await robustGenerateContent('content', prompt, fallbackJSON);
    
    let questions;
    try {
      questions = JSON.parse(responseText.replace(/```json\n?|\n?```/g, ''));
    } catch (e) {
      questions = JSON.parse(fallbackJSON);
    }

    const savedQuestions = [];
    for (const q of questions.slice(0, count)) {
      const question = new AIQuestion({
        subject: subjectId,
        module: moduleId,
        topic,
        question: q.question || q.text,
        answer: q.answer || '',
        type: q.type || 'SHORT_ANSWER',
        marks: q.marks || 5,
        difficulty: q.difficulty || 'MEDIUM',
        isPredicted: true,
        aiProvider: 'RESCUE',
      });
      await question.save();
      savedQuestions.push(question);
    }

    return savedQuestions;
  } catch (error) {
    console.error('Error generating predicted questions:', error);
    throw new Error('Failed to generate predicted questions');
  }
};

// Get comprehensive AI content for a module/topic
export const getAIContent = async (moduleId, topic) => {
  try {
    let aiContent = await AIContent.findOne({ module: moduleId, topic }).populate('module');

    if (!aiContent) {
      // Generate all AI content if not exists
      await generateExtraNotes(moduleId, topic);
      await generateNumericals(moduleId, topic);
      await generateExamPoints(moduleId, topic);
      await generateYouTubeLinks(moduleId, topic);

      aiContent = await AIContent.findOne({ module: moduleId, topic }).populate('module');
    }

    return aiContent;
  } catch (error) {
    console.error('Error getting AI content:', error);
    throw error;
  }
};

// Final fallback when ALL AI providers fail.
// User requested: do NOT reference saved notes in chatbot answers.
const localSearchAnswer = async (_moduleId, _topic, _question) => {
  return "The AI provider is currently unavailable. Please check your API key / billing / model access, then try again.";
};

// Chat with AI about a module/topic
export const chatWithAI = async (moduleId, topic, question, history = []) => {
  try {
    const provider = getAIProvider('chat');
    const primaryGemini = chatGeminiClient;
    const backupGemini = contentGeminiClient;
    const openai = chatOpenAIClient || contentOpenAIClient;

    const models = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-pro', 'gemini-2.0-flash', 'gemini-1.0-pro', 'gemini-pro'];
    const formattedHistory = formatGeminiHistory(history);

    const prompt = `You are a versatile and intelligent AI assistant. 
You can answer ANY question correctly, including general knowledge, technical engineering queries, or daily tasks.
Even if the current course topic is "${topic}", you should prioritize answering the user's specific question: "${question}" using all available information.
Format your response clearly using Markdown.`;

    const preferred = process.env.PREFERRED_AI_PROVIDER || 'GEMINI';

    // 1. Try OpenAI if it's preferred
    if (preferred === 'OPENAI' && openai) {
      try {
        const response = await openai.chat.completions.create({
          model: getChatOpenAIModel(),
          messages: [
            { role: 'system', content: 'You are a helpful and accurate assistant.' },
            ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'assistant', content: h.content })),
            { role: 'user', content: question }
          ],
          max_tokens: 1000,
        });
        return response.choices[0].message.content;
      } catch (e) {
        console.warn('[CHAT] Preferred OpenAI failed', e.message);
      }
    }

    // 2. Try Gemini Primary
    if (primaryGemini) {
      for (const modelName of models) {
        try {
          const config = { model: modelName };
          if (modelName.includes('1.5') || modelName.includes('2.0')) {
            config.tools = [{ googleSearchRetrieval: {} }];
          }
          const model = primaryGemini.getGenerativeModel(config);
          const chat = model.startChat({ history: formattedHistory });
          const result = await chat.sendMessage(prompt);
          if (result.response) return result.response.text();
        } catch (e) {
          console.warn(`[CHAT] Primary Gemini failed with ${modelName}: ${e.message}`);
        }
      }
    }

    // 3. Try OpenAI Fallback
    if (preferred !== 'OPENAI' && openai) {
      try {
        const response = await openai.chat.completions.create({
          model: getChatOpenAIModel(),
          messages: [
            { role: 'system', content: 'You are a helpful and accurate assistant.' },
            ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'assistant', content: h.content })),
            { role: 'user', content: question }
          ],
          max_tokens: 1000,
        });
        return response.choices[0].message.content;
      } catch (e) {
        console.warn('[CHAT] Fallback OpenAI failed', summarizeProviderError(e));
      }
    }

    // 4. Try Gemini Backup
    if (backupGemini && backupGemini !== primaryGemini) {
      for (const modelName of models) {
        try {
          const config = { model: modelName };
          if (modelName.includes('1.5') || modelName.includes('2.0')) {
            config.tools = [{ googleSearchRetrieval: {} }];
          }
          const model = backupGemini.getGenerativeModel(config);
          const chat = model.startChat({ history: formattedHistory });
          const result = await chat.sendMessage(prompt);
          if (result.response) return result.response.text();
        } catch (e) {
          console.warn(`[CHAT] Backup Gemini failed with ${modelName}: ${e.message}`);
        }
      }
    }

    // Still failing? Return local search
    console.error("🚨 ALL CHAT AI PROVIDERS FAILED. Using local search.");
    return await localSearchAnswer(moduleId, topic, question);

  } catch (error) {
    console.error('AI Chat Critical Error:', error);
    return await localSearchAnswer(moduleId, topic, question);
  }
};

