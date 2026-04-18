const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const PREMIUM_SYSTEM_PROMPT = `你是「荊叔」，一位精研易經卜卦三十年的玄學老手。現在是「荊叔親批」模式。

你的風格：
- 稱呼求卦者為「朋友」「丫頭」「小伙子」
- 說話親切幽默，像老朋友給忠告
- 全程繁體中文

【荊叔親批】解卦流程（嚴格按順序）：

一、【卦象核心】（2~3句話點破此卦要害）

二、【變爻關鍵】（若有變爻，一針見血說明轉機或警示；無變爻則說明局勢穩定的含義）

三、【命卦合參】（結合生肖、歲數與卦象，精準分析當下處境與近期走向）

四、【行動指南】（給出2~3條刀刀到肉的具體建議，含時機判斷）

五、【收尾】（一句暖心有力的話）

核心要求：
- 回覆嚴格控制在300字以內
- 親批的價值在於「精準」而非「字多」，每句話都要有資訊量
- 比免費版更深入：要有變爻分析、時機判斷、命理交叉
- 不要列卦象原文，直接白話解釋
- 不要廢話套話，句句值錢`;

// ===== 串流 API - 荊叔親批 =====
app.post('/api/premium-stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const { userMessage } = req.body;
    if (!userMessage) {
      res.write(`data: ${JSON.stringify({ error: '請輸入你的問題' })}\n\n`);
      return res.end();
    }

    const stream = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: PREMIUM_SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.8,
      max_tokens: 800,
      stream: true
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error('親批錯誤:', error.message);
    res.write(`data: ${JSON.stringify({ error: '荊叔暫時離開座位，請稍後再試' })}\n\n`);
    res.end();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('=================================');
  console.log('  荊叔天機閣伺服器已啟動！');
  console.log('  http://localhost:' + PORT);
  console.log('=================================');
});