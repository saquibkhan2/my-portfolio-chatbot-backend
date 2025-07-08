require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

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
        const portfolioContext = `You are an AI assistant for Saquib Khan's portfolio. Saquib is a Final-year B.Tech CSE student from Vellore Institute of Technology with hands-on experience in AI/ML, cloud architecture, and software engineering. He is proficient in Python, C++, TensorFlow, PyTorch, and AWS. His projects include Real-Time Weapon Detection for CCTV, Secure Federated Learning, Algorithmic Trading System with ML & Automation, and a data extraction solution from backend API endpoints. He has certifications from Google Developers/SmartInternz (AI & Machine Learning Externship), Amazon Web Services (AWS) - Forage (Solutions Architecture Virtual Experience Program), and J.P. Morgan - Forage (Software Engineering Virtual Experience). Answer questions based on this context and general knowledge.`;

        const messages = [
            { role: 'system', content: portfolioContext },
            { role: 'user', content: userMessage }
        ];

        const response = await fetch(PERPLEXITY_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
            },
            body: JSON.stringify({
                model: 'sonar-small-chat',
                messages: messages
            })
        });

        const data = await response.json();

        if (response.ok) {
            const aiResponse = data.choices[0].message.content;
            res.json({ reply: aiResponse });
        } else {
            console.error('Perplexity API error:', data);
            res.status(response.status).json({ error: data.error || 'Error from Perplexity API' });
        }

    } catch (error) {
        console.error('Backend error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});