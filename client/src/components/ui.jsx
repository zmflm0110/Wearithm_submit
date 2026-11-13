/* eslint-disable react-refresh/only-export-components */
import styled from 'styled-components';
import { STATUS } from '../api';

export const StatusBadge = ({ status }) => <Badge $status={status}>{STATUS[status]}</Badge>;

const BADGE_COLORS = {
  SELLING: ['var(--calm-soft)', 'var(--calm-text)'],
  RESERVED: ['var(--amber-soft)', 'var(--amber)'],
  COMPLETED: ['var(--fill)', 'var(--sub)'],
};

const Badge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  background: ${({ $status }) => BADGE_COLORS[$status][0]};
  color: ${({ $status }) => BADGE_COLORS[$status][1]};
`;

export const Page = styled.div`
  padding: 12px 20px 40px;
`;

export const PageTitle = styled.h2`
  font-size: 30px;
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.045em;
  margin-bottom: 10px;
`;

export const Period = styled.span`
  color: var(--accent);
`;

export const PageDesc = styled.p`
  font-size: 15px;
  line-height: 1.55;
  color: var(--sub);
  margin-bottom: 24px;
`;

export const Card = styled.section`
  padding: 22px 20px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-card);
`;

export const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
  font-size: 13px;
  font-weight: 700;
  color: var(--body);
`;

export const Input = styled.input`
  width: 100%;
  min-width: 0;
  padding: 13px 16px;
  border: 1px solid var(--line);
  border-radius: 14px;
  font-size: 15px;
  color: var(--ink);
  background: var(--surface);
  transition: border-color .15s, box-shadow .15s;
  &::placeholder { color: #a39fb0; }
  &:focus { outline: none; border-color: var(--ink); box-shadow: 0 0 0 3px var(--accent-soft); }
  &:disabled { background: var(--fill); color: var(--sub); }
`;

export const Select = styled(Input).attrs({ as: 'select' })``;
export const Textarea = styled(Input).attrs({ as: 'textarea' })`
  min-height: 120px;
  resize: vertical;
  line-height: 1.5;
`;

const BUTTON = {
  primary: ['var(--ink)', 'var(--page)', 'none'],
  ghost: ['var(--fill)', 'var(--ink)', 'none'],
  outline: ['var(--surface)', 'var(--ink)', '1px solid var(--line)'],
  danger: ['var(--surface)', 'var(--red)', '1px solid var(--line)'],
  accent: ['var(--accent)', '#fff', 'none'],
};

export const Button = styled.button`
  padding: 15px 20px;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.01em;
  background: ${({ $variant = 'primary' }) => BUTTON[$variant][0]};
  color: ${({ $variant = 'primary' }) => BUTTON[$variant][1]};
  border: ${({ $variant = 'primary' }) => BUTTON[$variant][2]};
  &:hover:not(:disabled) { filter: brightness(0.94); }
  &:disabled { opacity: 0.45; cursor: default; }
`;

export const Num = styled.span`
  font-family: var(--num);
  font-weight: 800;
  letter-spacing: -0.04em;
  font-variant-numeric: tabular-nums;
`;

export const Empty = styled.p`
  padding: 56px 0;
  text-align: center;
  color: var(--sub);
  font-size: 14px;
`;
