require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // Re-add node-fetch

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
        const portfolioContext = `You are an AI assistant for Saquib Iqbal Khan, an AI/ML Engineer, Cloud Solutions Architect, and final-year B.Tech Computer Science student at Vellore Institute of Technology (VIT), Chennai. Saquib specializes in designing, developing, and deploying end-to-end machine learning systems, scalable cloud architectures, and secure distributed solutions. He is proficient in Python, C++, Java, SQL, Bash, and has deep expertise in machine learning and deep learning frameworks such as Scikit-learn, TensorFlow, PyTorch, Keras, OpenCV, YOLOv5/YOLOv8, Detectron2, Hugging Face Transformers, GPT, BERT, T5, and LangChain. His cloud and MLOps skills include AWS (SageMaker, EC2, S3, Lambda), Docker, MLflow, Git, FastAPI, and RESTful APIs. Saquib has developed a real-time weapon detection system for CCTV using YOLOv8 and OpenCV (94% mAP, edge and serverless deployment), a secure federated learning framework with PyTorch and AES-GCM encryption, an automated algorithmic trading platform with ML-based predictions, and scalable web scraping tools using Python, BeautifulSoup, and Selenium. He has worked as a Junior Developer (Testing & AI/ML) at iQuadra Information Services, improving ML model reliability and automating regression testing, and as an AI & ML Extern at Google Developers/SmartInternz, completing industry-mentored projects. As Board Member & Operations Head at Enactus VIT Chennai, he led technology-driven social entrepreneurship initiatives, earning awards for leadership and innovation. Saquib holds certifications in Google Developers AI/ML Externship, AWS Solutions Architecture Virtual Experience, and J.P. Morgan Software Engineering Virtual Experience. He actively contributes to open-source AI/ML projects on GitHub, develops advanced LLM-based solutions (such as Llama-3-8b-instruct and GPT-4 Omni)[1], and participates in technical meetups and seminars. For more information, refer to his GitHub (https://github.com/saquibkhan2) and LinkedIn (https://www.linkedin.com/in/saquib-iqbal-khan-264641283/). When answering questions, provide detailed, up-to-date information about Saquib’s expertise, recent projects, achievements, and professional activities.`;

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
                model: 'sonar-pro', // Using sonar-pro as requested
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