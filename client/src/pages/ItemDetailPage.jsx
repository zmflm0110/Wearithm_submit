import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { api, CONDITION, TRADE_STATUS, timeAgo, priceText } from '../api';
import { StatusBadge, Button, Input } from '../components/ui';

const ItemDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useOutletContext();
  const [item, setItem] = useState(null);
  const [message, setMessage] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const load = () => api(`/posts/${id}`).then(setItem).catch((e) => alert(e.message));
  useEffect(() => { load(); }, [id]);

  if (!item) return null;

  const isMine = user && user.id === item.seller_id;
  const myTrade = user && item.trades.find((t) => t.requester_id === user.id && ['PENDING', 'ACCEPTED'].includes(t.status));

  const handleRequest = async () => {
    if (!user) { alert('로그인이 필요합니다.'); return navigate('/login', { state: { redirectTo: `/items/${id}` } }); }
    try {
      await api('/trades', { method: 'POST', body: { post_id: item.id, message } });
      setMessage('');
      load();
    } catch (e) { alert(e.message); }
  };

  const handleTrade = async (tradeId, action) => {
    if (action === 'complete' && !confirm('물려주기를 완료할까요? 완료하면 글을 수정·삭제할 수 없어요.')) return;
    try {
      await api(`/trades/${tradeId}`, { method: 'PATCH', body: { action } });
      load();
    } catch (e) { alert(e.message); }
  };

  const handleDelete = async () => {
    if (!confirm('이 글을 삭제할까요?')) return;
    try {
      await api(`/posts/${id}`, { method: 'DELETE' });
      navigate('/');
    } catch (e) { alert(e.message); }
  };

  const askAI = async (q = '') => {
    setLoading(true);
    setAnswer('');
    try {
      const data = await api(`/care/${id}`, { method: 'POST', body: { question: q } });
      setAnswer(data.answer);
    } catch (e) { setAnswer(e.message); }
    setLoading(false);
  };

  const sellerName = item.seller_nickname || '탈퇴한 사용자';

  return (
    <>
      <Photo src={item.image_url || '/favicon.svg'} alt={item.title} />

      <Body>
        <Seller>
          <Avatar>{sellerName[0]}</Avatar>
          <div>
            <b>{sellerName}</b>
            <small>📍 {item.location}</small>
          </div>
        </Seller>

        <Badges><StatusBadge status={item.status} /></Badges>
        <Title>{item.title}</Title>
        <Meta>{item.category} · {timeAgo(item.created_at)}</Meta>
        <Price $free={item.trade_type === 'FREE'}>{priceText(item)}</Price>
        <Desc>{item.description}</Desc>

        <Specs>
          <div><dt>사이즈</dt><dd>{item.size}</dd></div>
          <div><dt>상태</dt><dd>{item.item_condition} · {CONDITION[item.item_condition]}</dd></div>
          <div><dt>소재</dt><dd>{item.fabric || '-'}</dd></div>
          <div><dt>질감</dt><dd>{item.texture || '-'}</dd></div>
        </Specs>

        <Section>
          <h4>🧺 AI 관리법</h4>
          <p>이 옷의 종류·소재·질감을 보고 오래 입는 방법을 알려줘요.</p>
          <Button $variant="ghost" onClick={() => askAI()} disabled={loading}>세탁·건조·보관법 보기</Button>
          <Row as="form" onSubmit={(e) => { e.preventDefault(); if (question.trim()) askAI(question); }}>
            <Input placeholder="예: 보풀이 생기면 어떻게 해요?" value={question} onChange={(e) => setQuestion(e.target.value)} />
            <Button type="submit" disabled={loading}>질문</Button>
          </Row>
          {(loading || answer) && <Answer>{loading ? '생각 중…' : answer}</Answer>}
        </Section>

        {!isMine && item.status !== 'COMPLETED' && (
          <Section>
            <h4>이 옷 받고 싶어요</h4>
            {myTrade ? (
              <>
                <p>요청 상태: <b>{TRADE_STATUS[myTrade.status]}</b> {myTrade.status === 'ACCEPTED' && '· 거래 장소에서 만나요!'}</p>
                <Button $variant="ghost" onClick={() => handleTrade(myTrade.id, 'cancel')}>요청 취소</Button>
              </>
            ) : (
              <Row>
                <Input placeholder="한마디 (선택)" value={message} onChange={(e) => setMessage(e.target.value)} />
                <Button onClick={handleRequest}>받고 싶어요</Button>
              </Row>
            )}
          </Section>
        )}

        {isMine && (
          <Section>
            <h4>받고 싶어요 요청 ({item.trades.length})</h4>
            {item.trades.length === 0 && <p>아직 요청이 없어요.</p>}
            <Requests>
              {item.trades.map((t) => (
                <li key={t.id}>
                  <div>
                    <b>{t.requester_nickname}</b> <Tag $s={t.status}>{TRADE_STATUS[t.status]}</Tag>
                    {t.message && <small>“{t.message}”</small>}
                  </div>
                  {t.status === 'PENDING' && item.status === 'SELLING' && (
                    <>
                      <Mini onClick={() => handleTrade(t.id, 'accept')}>수락</Mini>
                      <Mini $ghost onClick={() => handleTrade(t.id, 'reject')}>거절</Mini>
                    </>
                  )}
                  {t.status === 'ACCEPTED' && (
                    <>
                      <Mini onClick={() => handleTrade(t.id, 'complete')}>물려주기 완료</Mini>
                      <Mini $ghost onClick={() => handleTrade(t.id, 'reject')}>취소</Mini>
                    </>
                  )}
                </li>
              ))}
            </Requests>
          </Section>
        )}

        {isMine && item.status !== 'COMPLETED' && (
          <Section>
            <h4>내 글 관리</h4>
            <Row>
              <Button $variant="ghost" onClick={() => navigate(`/items/${id}/edit`)}>수정</Button>
              <Button $variant="danger" onClick={handleDelete}>삭제</Button>
            </Row>
          </Section>
        )}
      </Body>
    </>
  );
};

export default ItemDetailPage;

const Photo = styled.img`
  display: block;
  width: calc(100% - 32px);
  height: 340px;
  margin: 4px 16px 0;
  object-fit: contain;
  border-radius: 28px;
  background: var(--surface);
  border: 1px solid var(--line);
`;

const Body = styled.div` padding: 0 20px 40px; `;

const Seller = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 0 16px;
  border-bottom: 1px solid var(--line);
  b { display: block; font-size: 15px; font-weight: 800; }
  small { font-size: 13px; color: var(--sub); }
`;

const Avatar = styled.span`
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--ink);
  color: var(--page);
  font-weight: 800;
`;

const Badges = styled.div` display: flex; gap: 6px; margin-top: 18px; `;
const Title = styled.h2` margin-top: 12px; font-size: 28px; font-weight: 800; line-height: 1.2; letter-spacing: -0.045em; `;
const Meta = styled.p` margin-top: 4px; font-size: 13px; color: var(--sub); `;
const Price = styled.p`
  margin-top: 12px;
  font-family: var(--num);
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: ${({ $free }) => ($free ? 'var(--calm-text)' : 'var(--ink)')};
`;
const Desc = styled.p` margin-top: 16px; line-height: 1.7; color: var(--body); white-space: pre-wrap; `;

const Specs = styled.dl`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 20px;
  div { padding: 14px 16px; border-radius: 16px; background: var(--surface); border: 1px solid var(--line); }
  dt { font-size: 12px; font-weight: 600; color: var(--sub); }
  dd { margin-top: 3px; font-weight: 800; letter-spacing: -0.02em; }
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
  padding: 22px 20px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-card);
  h4 { font-size: 19px; font-weight: 800; letter-spacing: -0.04em; }
  p { font-size: 14px; line-height: 1.55; color: var(--sub); }
`;

const Answer = styled.div`
  padding: 16px 18px;
  border-radius: 16px;
  background: var(--accent-soft);
  color: var(--accent-text);
  font-size: 14px;
  line-height: 1.7;
  white-space: pre-wrap;
`;

const Requests = styled.ul`
  display: flex;
  flex-direction: column;
  li {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 0;
    border-bottom: 1px solid var(--line);
  }
  li > div { flex: 1; min-width: 0; }
  small { display: block; margin-top: 2px; font-size: 13px; color: var(--sub); }
`;

const TAG_COLORS = {
  PENDING: ['var(--bg)', 'var(--sub)'],
  ACCEPTED: ['var(--amber-soft)', 'var(--amber)'],
  REJECTED: ['#fbe7e7', 'var(--red)'],
  COMPLETED: ['var(--calm-soft)', 'var(--calm-text)'],
};

const Tag = styled.span`
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  background: ${({ $s }) => TAG_COLORS[$s][0]};
  color: ${({ $s }) => TAG_COLORS[$s][1]};
`;

const Mini = styled.button`
  padding: 8px 13px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  background: ${({ $ghost }) => ($ghost ? 'var(--fill)' : 'var(--ink)')};
  color: ${({ $ghost }) => ($ghost ? 'var(--ink)' : 'var(--page)')};
`;

const Row = styled.div`
  display: flex;
  gap: 8px;
  > * { flex: 1; }
  > input ~ button { flex: 0 0 auto; }
`;
