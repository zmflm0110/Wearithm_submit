import path from 'path';
import { fileURLToPath } from 'url';
import { pipeline, env, RawImage } from '@huggingface/transformers';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
env.cacheDir = path.join(__dirname, '..', 'models');

const MODEL = 'Xenova/resnet-101';
let classifierPromise = null;

const getClassifier = () => {
  if (!classifierPromise) {
    console.log(`ResNet-101 모델 불러오는 중... (${MODEL})`);
    classifierPromise = pipeline('image-classification', MODEL, { dtype: 'fp32' })
      .then((c) => { console.log('ResNet-101 준비 완료'); return c; })
      .catch((e) => { classifierPromise = null; throw e; });
  }
  return classifierPromise;
};

const CLOTHING_LABELS = {
  'jersey, T-shirt, tee shirt': '티셔츠',
  sweatshirt: '맨투맨/후드티',
  cardigan: '가디건',
  'suit, suit of clothes': '정장/교복 재킷',
  'trench coat': '트렌치코트',
  'fur coat': '털 코트',
  'lab coat, laboratory coat': '가운',
  'jean, blue jean, denim': '청바지',
  'miniskirt, mini': '치마',
  overskirt: '치마',
  'hoopskirt, crinoline': '치마',
  'bulletproof vest': '조끼',
  'Windsor tie': '넥타이',
  'bow tie, bow-tie, bowtie': '나비넥타이',
  'pajama, pyjama, pj\'s, jammies': '잠옷',
  'military uniform': '제복',
  'academic gown, academic robe, judge\'s robe': '가운',
  'abaya': '긴 옷',
  'kimono': '기모노',
  'poncho': '판초',
  'cloak': '망토',
  'apron': '앞치마',
  'swimming trunks, bathing trunks': '반바지',
  'stole': '숄',
  'wool, woolen, woollen': '울 소재',
  'velvet': '벨벳 소재',
  'chain mail, ring mail, mail, chain armor, chain armour, ring armor, ring armour': '니트 짜임',
  'brassiere, bra, bandeau': '속옷',
  gown: '원피스/가운',
  'maillot, tank suit': '민소매/수영복',
  sock: '양말',
  vestment: '예복',
};

export const classifyClothing = async (buffer, mimeType) => {
  const classifier = await getClassifier();
  const image = await RawImage.fromBlob(new Blob([buffer], { type: mimeType }));
  const results = await classifier(image, { top_k: 5 });
  return results.map((r) => ({
    label: r.label,
    ko: CLOTHING_LABELS[r.label] || null,
    score: Math.round(r.score * 1000) / 10,
  }));
};

export const warmUpResnet = () => getClassifier().catch((e) => console.error('ResNet-101 불러오기 실패:', e.message));
