import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import { api, CATEGORIES, CONDITION, timeAgo, priceText } from '../api';
import { StatusBadge, Empty, Num, Button } from '../components/ui';

const Home = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [category, setCategory] = useState('전체');
  const [q, setQ] = useState('');
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    api(`/posts?category=${encodeURIComponent(category)}&q=${encodeURIComponent(keyword)}`)
      .then(setItems).catch((e) => alert(e.message));
  }, [category, keyword]);

  useEffect(() => {
    api('/posts/stats').then(setStats).catch(() => {});
  }, []);

  const total = stats?.byCategory.reduce((sum, c) => sum + Number(c.cnt), 0) ?? 0;

  return (
    <>
      <Hero>
        <Live><i />교내 순환 마켓 · 지금</Live>
        <HeroText>지금까지 새 주인을 찾은 옷</HeroText>
        <BigNumber>
          <Num>{stats ? Number(stats.completed) : '–'}</Num><small>벌</small>
        </BigNumber>
        <HeroSub>올라온 옷 {total}벌 · 버리지 말고 물려주세요</HeroSub>
      </Hero>

      <Action>
        <h2>안 입는 옷,<br />물려주세요<b>.</b></h2>
        <p>사진만 고르면 AI가 옷 종류와 상태를 보고 평점과 관리법을 알려줘요.</p>
        <Button onClick={() => navigate('/write')}>사진으로 옷 올리기</Button>
      </Action>

      <SectionHead>
        <h3>올라온 옷</h3>
        <span>{items.length}벌 · 최신 순</span>
      </SectionHead>

      <Search onSubmit={(e) => { e.preventDefault(); setKeyword(q); }}>
        <FiSearch />
        <input placeholder="제목으로 찾기 (예: 체육복)" value={q} onChange={(e) => setQ(e.target.value)} />
      </Search>

      <Chips>
        {['전체', ...CATEGORIES].map((c) => {
          const cnt = c === '전체' ? total : stats?.byCategory.find((s) => s.category === c)?.cnt;
          return (
            <Chip key={c} $active={category === c} onClick={() => setCategory(c)}>
              {c}{cnt ? <em>{cnt}</em> : null}
            </Chip>
          );
        })}
      </Chips>

      <List>
        {items.length === 0 && <Empty>아직 올라온 옷이 없어요.</Empty>}
        {items.map((item) => (
          <Item key={item.id} onClick={() => navigate(`/items/${item.id}`)} $done={item.status === 'COMPLETED'}>
            <Thumb src={item.image_url || '/favicon.svg'} alt={item.title} />
            <Info>
              <Title>{item.title}</Title>
              <Meta>{item.category} · {item.size} · {CONDITION[item.item_condition]}</Meta>
              <Meta>{item.location} · {item.seller_nickname || '탈퇴한 사용자'} · {timeAgo(item.created_at)}</Meta>
              <Bottom>
                <StatusBadge status={item.status} />
                <Price $free={item.trade_type === 'FREE'}>{priceText(item)}</Price>
              </Bottom>
            </Info>
          </Item>
        ))}
      </List>
    </>
  );
};

export default Home;

const Hero = styled.section`
  position: relative;
  overflow: hidden;
  margin: 4px 16px 0;
  padding: 26px 24px 24px;
  border-radius: 28px;
  background: var(--ink);
  color: var(--page);
  &::after {
    content: '';
    position: absolute;
    inset: 0 0 auto 45%;
    height: 70%;
    background-image: radial-gradient(rgba(255, 255, 255, 0.09) 1.2px, transparent 1.2px);
    background-size: 14px 14px;
    mask-image: linear-gradient(to left, #000, transparent);
    pointer-events: none;
  }
`;

const Live = styled.p`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #b9b3c9;
  i {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--accent-bright);
    box-shadow: 0 0 0 0 var(--accent-bright);
    animation: ping 2.2s var(--ease) infinite;
  }
  @keyframes ping {
    0% { box-shadow: 0 0 0 0 rgba(155, 123, 255, 0.6); }
    100% { box-shadow: 0 0 0 10px rgba(155, 123, 255, 0); }
  }
`;

const HeroText = styled.p`
  margin-top: 18px;
  font-size: 21px;
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.3;
`;

const BigNumber = styled.p`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  margin-top: 2px;
  span { font-size: 104px; line-height: 0.95; color: var(--accent-bright); }
  small { margin-bottom: 10px; font-size: 24px; font-weight: 800; }
`;

const HeroSub = styled.p`
  margin-top: 16px;
  font-size: 14px;
  font-weight: 600;
  color: #b9b3c9;
`;

const Action = styled.section`
  margin: 14px 16px 0;
  padding: 26px 22px 22px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 28px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  h2 { font-size: 30px; font-weight: 800; line-height: 1.15; letter-spacing: -0.05em; }
  h2 b { color: var(--accent); }
  p { font-size: 15px; line-height: 1.55; color: var(--sub); margin-bottom: 6px; }
`;

const SectionHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin: 34px 20px 12px;
  h3 { font-size: 22px; font-weight: 800; letter-spacing: -0.04em; }
  span { font-size: 14px; color: var(--sub); }
`;

const Search = styled.form`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 16px;
  padding: 0 18px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--surface);
  color: var(--sub);
  &:focus-within { border-color: var(--ink); }
  input {
    flex: 1;
    min-width: 0;
    padding: 13px 0;
    border: none;
    outline: none;
    background: none;
    font-size: 15px;
  }
`;

const Chips = styled.nav`
  display: flex;
  gap: 8px;
  padding: 14px 16px;
  overflow-x: auto;
  &::-webkit-scrollbar { display: none; }
`;

const Chip = styled.button`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 700;
  background: ${({ $active }) => ($active ? 'var(--ink)' : 'var(--surface)')};
  color: ${({ $active }) => ($active ? 'var(--page)' : 'var(--body)')};
  border: 1px solid ${({ $active }) => ($active ? 'var(--ink)' : 'var(--line)')};
  em { font-style: normal; font-family: var(--num); font-size: 12px; opacity: 0.7; }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 16px;
`;

const Item = styled.article`
  display: flex;
  gap: 16px;
  padding: 14px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-card);
  cursor: pointer;
  opacity: ${({ $done }) => ($done ? 0.55 : 1)};
  transition: transform .2s var(--ease), border-color .2s;
  &:hover { border-color: #c9c2d8; transform: translateY(-2px); }
`;

const Thumb = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 16px;
  object-fit: cover;
  flex-shrink: 0;
  background: var(--page);
`;

const Info = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 2px;
`;

const Title = styled.h3`
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.03em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Meta = styled.p`
  font-size: 13px;
  color: var(--sub);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Bottom = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: auto;
`;

const Price = styled.span`
  margin-left: auto;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: ${({ $free }) => ($free ? 'var(--calm-text)' : 'var(--ink)')};
`;
