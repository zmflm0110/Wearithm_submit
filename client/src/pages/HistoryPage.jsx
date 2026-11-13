import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Page, PageTitle, PageDesc, Empty } from '../components/ui';

const HistoryPage = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api('/posts/history').then(setRows).catch((e) => alert(e.message));
  }, []);

  return (
    <Page>
      <PageTitle>순환 기록</PageTitle>
      <PageDesc>우리 학교에서 주인이 바뀐 옷들이에요. 거래·옷·회원 정보를 연결(JOIN)해서 보여줘요.</PageDesc>

      {rows.length === 0 && <Empty>아직 물려준 옷이 없어요.</Empty>}
      <List>
        {rows.map((r) => (
          <Row key={`${r.id}-${r.completed_at}`} onClick={() => navigate(`/items/${r.id}`)}>
            <Thumb src={r.image_url || '/favicon.svg'} alt="" />
            <Main>
              <Title>{r.title}</Title>
              <Flow>
                <Person>{r.giver}</Person>
                <Arrow>→</Arrow>
                <Person $to>{r.receiver}</Person>
              </Flow>
            </Main>
            <Side>
              <Cat>{r.category}</Cat>
              <small>{new Date(r.completed_at).toLocaleDateString('ko-KR')}</small>
            </Side>
          </Row>
        ))}
      </List>
    </Page>
  );
};

export default HistoryPage;

const List = styled.ul`
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-card);
  overflow: hidden;
  &:empty { display: none; }
`;

const Row = styled.li`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  cursor: pointer;
  & + & { border-top: 1px solid var(--line); }
  &:hover { background: var(--page); }
`;

const Thumb = styled.img`
  width: 52px;
  height: 52px;
  border-radius: 14px;
  object-fit: cover;
  background: var(--page);
`;

const Main = styled.div` flex: 1; min-width: 0; `;
const Title = styled.p` font-weight: 800; letter-spacing: -0.03em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; `;

const Flow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
`;

const Person = styled.span`
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  background: ${({ $to }) => ($to ? 'var(--ink)' : 'var(--fill)')};
  color: ${({ $to }) => ($to ? 'var(--page)' : 'var(--ink)')};
`;

const Cat = styled.span` font-size: 12px; font-weight: 700; color: var(--green-dark); `;
const Arrow = styled.span` color: var(--accent); font-size: 13px; font-weight: 800; `;

const Side = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  small { font-size: 12px; color: var(--sub); }
`;
