const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();
const crypto = require('crypto');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// ===== MongoDB 連線 =====
mongoose.connect(process.env.MONGODB_URI, { dbName: 'tianji' })
  .then(() => console.log('✅ MongoDB 連線成功'))
  .catch(err => console.log('❌ MongoDB 連線失敗:', err.message));

// 訂單 Schema
const orderSchema = new mongoose.Schema({
  tradeNo: { type: String, required: true, unique: true },
  hexagramData: { type: Object },
  paid: { type: Boolean, default: false },
  amount: { type: Number, default: 29 },
  createdAt: { type: Date, default: Date.now },
  paidAt: { type: Date }
});

const Order = mongoose.model('Order', orderSchema);

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

// ====== 綠界金流 ======
function generateCheckMacValue(params) {
  const sorted = Object.keys(params).sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );
  let raw = `HashKey=${process.env.ECPAY_HASH_KEY}`;
  sorted.forEach(key => { raw += `&${key}=${params[key]}`; });
  raw += `&HashIV=${process.env.ECPAY_HASH_IV}`;

  let encoded = encodeURIComponent(raw)
    .replace(/%20/g, '+')
    .replace(/\!/g, '%21')
    .replace(/\'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A');
  encoded = encoded.toLowerCase();

  return crypto.createHash('sha256').update(encoded).digest('hex').toUpperCase();
}

// 建立付款訂單
app.post('/api/create-payment', async (req, res) => {
  const { hexagramData } = req.body;
  const now = new Date();
  const tradeNo = 'TJ' + String(now.getTime()).slice(-14) +
    String(Math.floor(Math.random() * 999)).padStart(3, '0');
  const pad = n => String(n).padStart(2, '0');
  const tradeDate = `${now.getFullYear()}/${pad(now.getMonth()+1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  // 存進 MongoDB
  try {
    const order = new Order({
      tradeNo: tradeNo,
      hexagramData: hexagramData,
      paid: false
    });
    await order.save();
    console.log('📦 訂單已建立:', tradeNo);
  } catch (err) {
    console.error('訂單建立失敗:', err.message);
  }

  const params = {
    MerchantID: process.env.ECPAY_MERCHANT_ID,
    MerchantTradeNo: tradeNo,
    MerchantTradeDate: tradeDate,
    PaymentType: 'aio',
    TotalAmount: '29',
    TradeDesc: '荊叔天機閣親批服務',
    ItemName: '荊叔親批深度解卦',
    ReturnURL: 'https://jstianjige.com/api/ecpay-notify',
    ClientBackURL: 'https://jstianjige.com/payment-result.html?trade=' + tradeNo,
    ChoosePayment: 'ALL',
    IgnorePayment: 'CVS#BARCODE#WebATM',
    EncryptType: 1
  };

  params.CheckMacValue = generateCheckMacValue(params);

  let html = '<html><body><form id="f" method="post" action="https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5">';
  Object.entries(params).forEach(([k, v]) => {
    html += '<input type="hidden" name="' + k + '" value="' + v + '">';
  });
  html += '</form><script>document.getElementById("f").submit();</script></body></html>';

  res.send(html);
});

// 綠界付款通知（伺服器對伺服器）
app.post('/api/ecpay-notify', async (req, res) => {
  const data = req.body;
  const checkMac = data.CheckMacValue;
  const params = { ...data };
  delete params.CheckMacValue;

  if (checkMac === generateCheckMacValue(params) && data.RtnCode === '1') {
    try {
      await Order.findOneAndUpdate(
        { tradeNo: data.MerchantTradeNo },
        { paid: true, paidAt: new Date() }
      );
      console.log('✅ 付款成功:', data.MerchantTradeNo);
    } catch (err) {
      console.error('更新訂單失敗:', err.message);
    }
    res.send('1|OK');
  } else {
    console.log('❌ 付款驗證失敗');
    res.send('0|FAIL');
  }
});

// 查詢付款狀態
app.get('/api/check-payment/:tradeNo', async (req, res) => {
  try {
    const order = await Order.findOne({ tradeNo: req.params.tradeNo });
    if (order && order.paid) {
      res.json({ paid: true, hexagramData: order.hexagramData });
    } else {
      res.json({ paid: false });
    }
  } catch (err) {
    res.json({ paid: false });
  }
});

// ===== 管理後台 API =====
const ADMIN_PASSWORD = 'tianjiMAXloui666';

app.post('/api/admin/orders', async (req, res) => {
  const { password } = req.body;
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: '密碼錯誤' });
  }
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    const stats = {
      totalOrders: orders.length,
      paidOrders: orders.filter(o => o.paid).length,
      totalRevenue: orders.filter(o => o.paid).length * 29
    };
    res.json({ orders, stats });
  } catch (err) {
    res.status(500).json({ error: '查詢失敗' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('=================================');
  console.log('  荊叔天機閣伺服器已啟動！');
  console.log('  http://localhost:' + PORT);
  console.log('=================================');
});