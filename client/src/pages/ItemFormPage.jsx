import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { api, CATEGORIES, CONDITION } from '../api';
import { Page, PageTitle, PageDesc, Field, Input, Select, Textarea, Button } from '../components/ui';

const EMPTY = {
  title: '', description: '', category: '교복상의', size: '', item_condition: 'B',
  fabric: '', texture: '', trade_type: 'FREE', price: 0, location: '',
};

const ItemFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useOutletContext();
  const [form, setForm] = useState(EMPTY);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [rating, setRating] = useState(null);
  const [ratingLoading, setRatingLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    if (!id) return;
    api(`/posts/${id}`).then((item) => {
      if (item.seller_id !== user.id) {
        alert('본인이 올린 글만 수정할 수 있습니다.');
        return navigate(`/items/${id}`);
      }
      const next = {};
      Object.keys(EMPTY).forEach((k) => { next[k] = item[k] ?? EMPTY[k]; });
      setForm(next);
    });
  }, [id]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImage = async (e) => {
    const file = e.target.files[0];
    setImage(file || null);
    setRating(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(file ? URL.createObjectURL(file) : null);
    if (!file) return;

    const data = new FormData();
    data.append('image', file);
    setRatingLoading(true);
    try {
      const res = await api('/care/analyze', { method: 'POST', form: data });
      setRating(res);
      setForm((f) => ({
        ...f,
        category: res.category,
        item_condition: res.grade,
        fabric: res.fabric.slice(0, 30),
        texture: res.texture.slice(0, 30),
      }));
    } catch (err) {
      setRating({ error: err.message });
    } finally {
      setRatingLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    if (image) data.append('image', image);

    try {
      const res = await api(id ? `/posts/${id}` : '/posts', { method: id ? 'PUT' : 'POST', form: data });
      navigate(`/items/${id || res.id}`);
    } catch (err) { alert(err.message); }
  };

  return (
    <Page>
      <PageTitle>{id ? '옷 정보 수정' : '옷 올리기'}</PageTitle>
      <PageDesc>
        안 입는 교복과 옷을 후배에게 물려주세요. 사진을 고르면 AI가 옷을 분석해서 상태 평점과 관리법을 알려줘요.
      </PageDesc>

      <Form onSubmit={handleSubmit}>
        <Field>사진<Input type="file" accept="image/*" onChange={handleImage} /></Field>
        {preview && (
          <RatingBox>
            <Preview src={preview} alt="미리보기" />
            <div>
              {ratingLoading && <p>AI가 옷을 분석하고 있어요... (ResNet-101 → Gemini)</p>}
              {rating?.error && <ErrorText>{rating.error}</ErrorText>}
              {rating && !rating.error && (
                <>
                  <Score>{rating.clothing} · AI 평점 <strong>{rating.score}</strong> / 10 · {rating.grade} {CONDITION[rating.grade]}</Score>
                  <p>{rating.reason}</p>
                  <Care>
                    <li><b>세탁</b> {rating.wash}</li>
                    <li><b>건조</b> {rating.dry}</li>
                    <li><b>보관</b> {rating.store}</li>
                  </Care>
                  <Hint>
                    ResNet-101 분류: {rating.resnet.slice(0, 3).map((r) => `${r.ko || r.label.split(',')[0]} ${r.score}%`).join(' · ')}
                  </Hint>
                  <Hint>종류·소재·질감·상태를 자동으로 채웠어요. 직접 바꿀 수도 있어요.</Hint>
                </>
              )}
            </div>
          </RatingBox>
        )}
        <Field>제목<Input name="title" value={form.title} onChange={change} required /></Field>
        <Grid>
          <Field>종류
            <Select name="category" value={form.category} onChange={change}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </Select>
          </Field>
          <Field>사이즈<Input name="size" value={form.size} onChange={change} placeholder="95, M, 30인치" required /></Field>
          <Field>상태
            <Select name="item_condition" value={form.item_condition} onChange={change}>
              {Object.entries(CONDITION).map(([k, v]) => <option key={k} value={k}>{k} · {v}</option>)}
            </Select>
          </Field>
          <Field>거래 장소<Input name="location" value={form.location} onChange={change} placeholder="1층 중앙현관" required /></Field>
          <Field>소재<Input name="fabric" value={form.fabric} onChange={change} placeholder="폴리에스터" /></Field>
          <Field>질감<Input name="texture" value={form.texture} onChange={change} placeholder="매끈함" /></Field>
          <Field>방식
            <Select name="trade_type" value={form.trade_type} onChange={change}>
              <option value="FREE">무료 나눔</option>
              <option value="SELL">판매</option>
            </Select>
          </Field>
          <Field>가격
            <Input name="price" type="number" min="0" value={form.trade_type === 'FREE' ? 0 : form.price} onChange={change} disabled={form.trade_type === 'FREE'} />
          </Field>
        </Grid>
        <Field>설명<Textarea name="description" value={form.description} onChange={change} required /></Field>
        <Button type="submit">{id ? '수정 완료' : '올리기'}</Button>
      </Form>
    </Page>
  );
};

export default ItemFormPage;

const Form = styled.form` display: flex; flex-direction: column; gap: 16px; `;
const Grid = styled.div` display: grid; grid-template-columns: 1fr 1fr; gap: 14px; `;
const RatingBox = styled.div`
  display: flex; gap: 14px; align-items: flex-start;
  padding: 16px; border: 1px solid #d9ccff; border-radius: var(--radius-card); background: var(--accent-soft);
  font-size: 14px; line-height: 1.5;
`;
const Preview = styled.img` width: 96px; height: 96px; object-fit: cover; border-radius: 16px; flex-shrink: 0; `;
const Score = styled.p` font-weight: 800; margin-bottom: 4px; letter-spacing: -0.02em; strong { font-family: var(--num); font-size: 28px; letter-spacing: -0.04em; color: var(--accent-text); } `;
const Hint = styled.p` margin-top: 6px; font-size: 12px; color: var(--sub); `;
const ErrorText = styled.p` color: var(--red); `;
const Care = styled.ul` list-style: none; margin-top: 8px; display: flex; flex-direction: column; gap: 4px; b { margin-right: 6px; color: var(--green-dark); } `;
