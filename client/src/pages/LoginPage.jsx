import { useState } from 'react';
import styled from 'styled-components';
import { Link, useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { api } from '../api';
import { Page, PageTitle, PageDesc, Field, Input, Button } from '../components/ui';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useOutletContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await api('/users/login', { method: 'POST', body: { email, password } });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      navigate(location.state?.redirectTo || '/');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Page>
      <PageTitle>로그인</PageTitle>
      <PageDesc>학교 이메일로 로그인하세요.</PageDesc>
      <Form onSubmit={handleLogin}>
        <Field>이메일<Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></Field>
        <Field>비밀번호<Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></Field>
        <Button type="submit">로그인</Button>
      </Form>
      <Hint>아직 회원이 아니신가요? <Link to="/signup">회원가입</Link></Hint>
    </Page>
  );
};

export default LoginPage;

const Form = styled.form` display: flex; flex-direction: column; gap: 16px; `;
const Hint = styled.p`
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  color: var(--sub);
  a { color: var(--accent-text); font-weight: 800; }
`;
