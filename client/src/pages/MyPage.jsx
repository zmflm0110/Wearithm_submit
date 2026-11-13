import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { api, priceText } from '../api';
import { Page, StatusBadge, Empty, Button } from '../components/ui';

const MyPage = () => {
  const navigate = useNavigate();
  const { user } = useOutletContext();
  const [me, setMe] = useState(null);
  const [tab, setTab] = useState('mine');
  const [mine, setMine] = useState([]);
  const [received, setReceived] = useState([]);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api('/users/me').then(setMe).catch((e) => alert(e.message));
    api('/posts/mine').then(setMine);
    api('/posts/received').then(setReceived);
  }, [user]);

  if (!me) return null;
  const list = tab === 'mine' ? mine : received;

  return (
    <Page>
      <Profile>
        <Avatar>{me.nickname[0]}</Avatar>
        <div>
          <Name>{me.nickname}</Name>
          <Sub>{me.email} · {me.student_id}</Sub>
        </div>
        <Button $variant="ghost" onClick={() => navigate('/mypage/edit')}>프로필 수정</Button>
      </Profile>

      <Stats>
        <div><b>{me.posted_count}</b><span>올린 옷</span></div>
        <div><b>{me.given_count}</b><span>물려준 옷</span></div>
        <div><b>{me.received_count}</b><span>받은 옷</span></div>
      </Stats>

      <Tabs>
        <TabBtn $active={tab === 'mine'} onClick={() => setTab('mine')}>내가 올린 옷</TabBtn>
        <TabBtn $active={tab === 'received'} onClick={() => setTab('received')}>내가 받은 옷</TabBtn>
      </Tabs>

      {list.length === 0 && <Empty>아직 없어요.</Empty>}
      {list.map((item) => (
        <Row key={item.id} onClick={() => navigate(`/items/${item.id}`)}>
          <Thumb src={item.image_url || '/favicon.svg'} alt="" />
          <div>
            <b>{item.title}</b>
            <Line>
              <StatusBadge status={item.status} />
              {tab === 'received' && <small>{item.seller_nickname || '탈퇴한 사용자'}님에게 받음</small>}
            </Line>
          </div>
          <PriceText>{priceText(item)}</PriceText>
        </Row>
      ))}
    </Page>
  );
};

export default MyPage;

const Profile = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  > div { flex: 1; }
  button { padding: 9px 12px; font-size: 13px; }
`;

const Avatar = styled.span`
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--ink);
  color: var(--page);
  font-size: 22px;
  font-weight: 800;
`;

const Name = styled.p` font-size: 24px; font-weight: 800; letter-spacing: -0.045em; `;
const Sub = styled.p` font-size: 13px; color: var(--sub); `;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin: 22px 0;
  border-radius: var(--radius-card);
  background: var(--ink);
  color: var(--page);
  div { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 22px 0 18px; }
  div + div { border-left: 1px solid rgba(255, 255, 255, 0.1); }
  b { font-family: var(--num); font-size: 34px; font-weight: 800; letter-spacing: -0.04em; color: var(--accent-bright); }
  span { color: #b9b3c9 !important; }
  span { font-size: 13px; color: var(--sub); }
`;

const Tabs = styled.div`
  display: flex;
  gap: 4px;
  padding: 4px;
  border-radius: 999px;
  background: var(--fill);
`;
const TabBtn = styled.button`
  flex: 1;
  padding: 11px 0;
  border-radius: 999px;
  font-weight: 700;
  background: ${({ $active }) => ($active ? 'var(--ink)' : 'transparent')};
  color: ${({ $active }) => ($active ? 'var(--page)' : 'var(--sub)')};
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 10px;
  padding: 12px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 20px;
  cursor: pointer;
  > div { flex: 1; min-width: 0; }
  b { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  small { font-size: 12px; color: var(--sub); }
`;

const Thumb = styled.img` width: 60px; height: 60px; border-radius: 14px; object-fit: cover; background: var(--page); `;
const Line = styled.div` display: flex; align-items: center; gap: 6px; margin-top: 6px; `;
const PriceText = styled.span` font-weight: 800; font-size: 14px; `;
