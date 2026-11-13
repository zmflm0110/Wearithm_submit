import { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { api } from '../api';
import { Page, PageTitle, PageDesc, Field, Input, Button } from '../components/ui';

const SignupPage = () => {
  const navigate = useNavigate();
  const { setUser } = useOutletContext();
  const [form, setForm] = useState({
    email: '', password: '', nickname: '', phone_number: '', entry_year: '', student_id: '',
  });

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const data = await api('/users/signup', { method: 'POST', body: form });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      navigate('/');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Page>
      <PageTitle>회원가입</PageTitle>
      <PageDesc>같은 학교 학생끼리만 옷을 주고받아요.</PageDesc>
      <Form onSubmit={handleSignup}>
        <Field>학교 이메일<Input name="email" type="email" value={form.email} onChange={change} required /></Field>
        <Field>비밀번호<Input name="password" type="password" value={form.password} onChange={change} required /></Field>
        <Field>닉네임<Input name="nickname" value={form.nickname} onChange={change} required /></Field>
        <Field>전화번호<Input name="phone_number" value={form.phone_number} onChange={change} placeholder="010-0000-0000" required /></Field>
        <Grid>
          <Field>입학년도<Input name="entry_year" type="number" value={form.entry_year} onChange={change} placeholder="2025" required /></Field>
          <Field>학번<Input name="student_id" value={form.student_id} onChange={change} placeholder="20407" required /></Field>
        </Grid>
        <Button type="submit">가입하기</Button>
      </Form>
    </Page>
  );
};

export default SignupPage;

const Form = styled.form` display: flex; flex-direction: column; gap: 16px; `;
const Grid = styled.div` display: grid; grid-template-columns: 1fr 1fr; gap: 14px; `;
