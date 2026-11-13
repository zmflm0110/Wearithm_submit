import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { api } from '../api';
import { Page, PageTitle, PageDesc, Field, Input, Button } from '../components/ui';

const ProfileEditPage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useOutletContext();
  const [form, setForm] = useState({ nickname: '', phone_number: '', entry_year: '', student_id: '', currentPassword: '', newPassword: '' });
  const [leavePassword, setLeavePassword] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api('/users/me').then((me) => setForm((f) => ({ ...f, ...me })));
  }, [user]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api('/users/me', { method: 'PUT', body: form });
      const next = { ...user, nickname: form.nickname };
      localStorage.setItem('user', JSON.stringify(next));
      setUser(next);
      alert('수정되었습니다.');
      navigate('/mypage');
    } catch (err) { alert(err.message); }
  };

  const handleLeave = async () => {
    if (!confirm('정말 탈퇴할까요? 거래 중인 글은 삭제되고, 물려준 기록은 "탈퇴한 사용자"로 남아요.')) return;
    try {
      await api('/users/me', { method: 'DELETE', body: { password: leavePassword } });
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      navigate('/');
    } catch (err) { alert(err.message); }
  };

  return (
    <Page>
      <PageTitle>프로필 수정</PageTitle>
      <PageDesc>{form.email}</PageDesc>

      <Form onSubmit={handleSave}>
        <Field>닉네임<Input name="nickname" value={form.nickname} onChange={change} required /></Field>
        <Field>전화번호<Input name="phone_number" value={form.phone_number} onChange={change} required /></Field>
        <Grid>
          <Field>입학년도<Input name="entry_year" type="number" value={form.entry_year} onChange={change} required /></Field>
          <Field>학번<Input name="student_id" value={form.student_id} onChange={change} required /></Field>
        </Grid>
        <Field>새 비밀번호 (바꿀 때만)<Input name="newPassword" type="password" value={form.newPassword} onChange={change} /></Field>
        <Field>현재 비밀번호 확인<Input name="currentPassword" type="password" value={form.currentPassword} onChange={change} required /></Field>
        <Button type="submit">저장</Button>
      </Form>

      <Danger>
        <h4>회원 탈퇴</h4>
        <p>거래 중인 글은 함께 삭제돼요. 이미 물려준 옷의 기록은 순환 기록을 위해 이름 없이 남아요.</p>
        <Row>
          <Input type="password" placeholder="비밀번호 확인" value={leavePassword} onChange={(e) => setLeavePassword(e.target.value)} />
          <Button $variant="danger" onClick={handleLeave}>탈퇴하기</Button>
        </Row>
      </Danger>
    </Page>
  );
};

export default ProfileEditPage;

const Form = styled.form` display: flex; flex-direction: column; gap: 16px; `;
const Grid = styled.div` display: grid; grid-template-columns: 1fr 1fr; gap: 14px; `;
const Danger = styled.section`
  margin-top: 36px;
  padding: 22px 20px;
  border: 1px solid #f1d4d2;
  border-radius: var(--radius-card);
  background: var(--surface);
  h4 { color: var(--red); font-size: 17px; font-weight: 800; }
  p { margin: 6px 0 12px; font-size: 13px; color: var(--sub); line-height: 1.5; }
`;
const Row = styled.div` display: flex; gap: 8px; > * { flex: 1; } `;
