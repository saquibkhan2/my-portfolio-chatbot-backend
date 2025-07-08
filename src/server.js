require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ChatPerplexity } = require("@langchain/community/chat_models");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

// Define the chat model outside the route handler to avoid re-initialization on every request
const model = new ChatPerplexity({
    apiKey: PERPLEXITY_API_KEY,
    model: "llama-3-8b-instruct", // Using a common Llama model as a starting point
});

const portfolioContext = `You are an AI assistant for Saquib Khan's portfolio. Saquib is a Final-year B.Tech CSE student from Vellore Institute of Technology with hands-on experience in AI/ML, cloud architecture, and software engineering. He is proficient in Python, C++, TensorFlow, PyTorch, and AWS. His projects include Real-Time Weapon Detection for CCTV, Secure Federated Learning, Algorithmic Trading System with ML & Automation, and a data extraction solution from backend API endpoints. He has certifications from Google Developers/SmartInternz (AI & Machine Learning Externship), Amazon Web Services (AWS) - Forage (Solutions Architecture Virtual Experience Program), and J.P. Morgan - Forage (Software Engineering Virtual Experience). Answer questions based on this context and general knowledge.`;

const prompt = ChatPromptTemplate.fromMessages([
    ["system", portfolioContext],
    ["user", "{input}"],
]);

const chain = prompt.pipe(model).pipe(new StringOutputParser());

app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).json({ error: 'Message is required' });
    }

    if (!PERPLEXITY_API_KEY) {
        console.error('PERPLEXITY_API_KEY is not set in .env file');
        return res.status(500).json({ error: 'Server configuration error: API key missing.' });
    }

    try {
        const aiResponse = await chain.invoke({ input: userMessage });
        res.json({ reply: aiResponse });

    } catch (error) {
        console.error('Backend error:', error);
        // Attempt to parse error message from LangChain error object
        let errorMessage = 'Internal server error';
        if (error.message) {
            errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null) {
            errorMessage = JSON.stringify(error);
        }
        res.status(500).json({ error: errorMessage });
    }
});

app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});