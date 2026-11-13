import express from 'express';
import multer from 'multer';
import db from '../db.js';
import { authenticateToken } from '../middlewares/auth.js';
import { classifyClothing } from '../ai/resnet.js';

const router = express.Router();

const FALLBACK_MODELS = ['gemini-flash-latest', 'gemini-2.5-flash-lite'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const callModel = async (model, prompt, config) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
    body: JSON.stringify({
      contents: [{ parts: typeof prompt === 'string' ? [{ text: prompt }] : prompt }],
      ...(config && { generationConfig: config }),
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.error?.message || 'Gemini 호출 실패');
    err.retryable = res.status === 503 || res.status === 429;
    throw err;
  }
  return data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
};

const askGemini = async (prompt, config) => {
  const main = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const models = [main, ...FALLBACK_MODELS.filter((m) => m !== main)];
  let lastError;
  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        return await callModel(model, prompt, config);
      } catch (error) {
        lastError = error;
        if (!error.retryable) throw error;
        console.warn(`Gemini ${model} 혼잡 (시도 ${attempt + 1}) - 재시도`);
        await sleep(1000 * (attempt + 1));
      }
    }
  }
  throw lastError;
};

const memoryUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const CATEGORIES = ['교복상의', '교복하의', '체육복', '생활복', '외투', '기타'];

router.post('/analyze', authenticateToken, memoryUpload.single('image'), async (req, res) => {
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ message: 'server/.env 에 GEMINI_API_KEY 를 넣어 주세요.' });
  }
  if (!req.file || !req.file.mimetype.startsWith('image/')) {
    return res.status(400).json({ message: '사진 파일을 선택해 주세요.' });
  }
  try {
    const resnet = await classifyClothing(req.file.buffer, req.file.mimetype);
    const resnetText = resnet.map((r) => `${r.label}${r.ko ? `(${r.ko})` : ''} ${r.score}%`).join(', ');

    const prompt = `너는 중고 교복·옷을 분석하는 의류 관리 전문가야.
ResNet-101 이미지 분류 모델이 이 사진을 이렇게 분류했어 (ImageNet 라벨, 확률): ${resnetText}
이 분류 결과를 참고하되 사진을 직접 보고 아래를 판단해줘. 모두 고등학생이 이해하기 쉬운 한국어로.
- clothing: 옷 이름 (예: 반팔 티셔츠, 교복 재킷)
- category: ${CATEGORIES.join(' / ')} 중 하나
- fabric: 추정 소재 (예: 면, 폴리에스터, 울)
- texture: 질감 (예: 부드러움, 매끈함, 도톰함)
- score: 상태 점수 1~10 정수 (10 = 새것). 얼룩, 보풀, 색바램, 구김, 해짐, 단추·지퍼 상태를 본다.
- grade: score 8 이상 "A", 5~7 "B", 4 이하 "C"
- reason: 점수 이유 1~2문장
- wash, dry, store: 이 옷에 맞는 세탁·건조·보관 방법 각각 1~2문장
사진에 옷이 없으면 score 0, grade "C", reason 에 "옷이 보이지 않아요" 라고 써.`;

    const str = { type: 'STRING' };
    const text = await askGemini(
      [{ text: prompt }, { inline_data: { mime_type: req.file.mimetype, data: req.file.buffer.toString('base64') } }],
      {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            clothing: str, category: { type: 'STRING', enum: CATEGORIES }, fabric: str, texture: str,
            score: { type: 'INTEGER' }, grade: { type: 'STRING', enum: ['A', 'B', 'C'] }, reason: str,
            wash: str, dry: str, store: str,
          },
          required: ['clothing', 'category', 'fabric', 'texture', 'score', 'grade', 'reason', 'wash', 'dry', 'store'],
        },
      },
    );
    res.json({ resnet, ...JSON.parse(text) });
  } catch (error) {
    console.error('AI 분석 에러:', error);
    res.status(500).json({ message: `AI 분석 실패: ${error.message}` });
  }
});

router.post('/:postId', async (req, res) => {
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ message: 'server/.env 에 GEMINI_API_KEY 를 넣어 주세요.' });
  }
  try {
    const [rows] = await db.query('SELECT category, size, fabric, texture, item_condition FROM posts WHERE id = ?', [req.params.postId]);
    if (rows.length === 0) return res.status(404).json({ message: '글을 찾을 수 없습니다.' });
    const p = rows[0];

    const cloth = `종류: ${p.category}, 소재: ${p.fabric || '모름'}, 질감: ${p.texture || '모름'}, 상태: ${p.item_condition}`;
    const question = req.body.question?.trim();
    const prompt = question
      ? `너는 의류 관리 전문가야. 아래 옷에 대한 질문에 고등학생이 이해하기 쉽게 한국어로 5줄 이내로 답해줘.\n옷 정보: ${cloth}\n질문: ${question}`
      : `너는 의류 관리 전문가야. 아래 옷을 오래 입을 수 있도록 세탁, 건조, 보관 방법을 각각 1~2줄로 한국어로 알려줘. 마크다운 기호 없이 "세탁:", "건조:", "보관:"으로 시작해줘.\n옷 정보: ${cloth}`;

    const answer = await askGemini(prompt);
    res.json({ answer });
  } catch (error) {
    console.error('AI 에러:', error);
    res.status(500).json({ message: `AI 응답 실패: ${error.message}` });
  }
});

export default router;
