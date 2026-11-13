export const api = async (url, { method = 'GET', body, form } = {}) => {
  const token = localStorage.getItem('token');
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';

  const res = await fetch(`/api${url}`, {
    method,
    headers,
    body: form ?? (body ? JSON.stringify(body) : undefined),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || '요청에 실패했습니다.');
  return data;
};

export const getUser = () => JSON.parse(localStorage.getItem('user') || 'null');

export const CATEGORIES = ['교복상의', '교복하의', '체육복', '생활복', '외투', '기타'];
export const CONDITION = { A: '거의 새것', B: '사용감 조금', C: '사용감 많음' };
export const STATUS = { SELLING: '거래 가능', RESERVED: '예약중', COMPLETED: '물려줌' };
export const TRADE_STATUS = { PENDING: '대기', ACCEPTED: '수락됨', REJECTED: '거절됨', COMPLETED: '완료' };

export const timeAgo = (date) => {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 3600) return `${Math.max(1, Math.floor(diff / 60))}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)}일 전`;
  return new Date(date).toLocaleDateString('ko-KR');
};

export const priceText = (item) => (item.trade_type === 'FREE' || !item.price ? '무료 나눔' : `${item.price.toLocaleString()}원`);
