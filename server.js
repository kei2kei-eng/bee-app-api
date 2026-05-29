const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;
const AI_HUB_KEY = process.env.AI_HUB_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', model: 'deepseek-vision' });
});

app.post('/api/ai/solve', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image required' });
    }

    const imageData = image.includes(',') ? image.split(',')[1] : image;

    const response = await axios.post(
      'https://hnd1.aihub.zeabur.ai/v1/messages',
      {
        model: 'deepseek-vision',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: imageData
                }
              },
              {
                type: 'text',
                text: `分析这张图片，返回 JSON 格式：
{
  "question": "图片中显示的是什么？",
  "steps": ["步骤1", "步骤2"],
  "answer": "最终答案",
  "knowledge": "关键知识点"
}
只返回 JSON，不要其他文本。`
              }
            ]
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${AI_HUB_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const aiMessage = response.data.content[0].text;
    let result;
    try {
      result = JSON.parse(aiMessage);
    } catch (e) {
      result = {
        question: '图片分析',
        steps: ['分析中...'],
        answer: aiMessage,
        knowledge: 'AI 分析完成'
      };
    }

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.response?.data?.error?.message || error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log(`🤖 Using DeepSeek Vision model`);
});
