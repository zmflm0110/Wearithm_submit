import styled from 'styled-components';

const Footer = () => (
  <Foot>
    <strong>Wearithm<i>.</i></strong>
    <span>옷의 수명을 한 사람만큼 늘리는 교내 순환 마켓</span>
  </Foot>
);

export default Footer;

const Foot = styled.footer`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 36px 20px 28px;
  font-size: 13px;
  color: var(--sub);
  strong { font-family: var(--num); font-size: 15px; font-weight: 800; color: var(--ink); letter-spacing: -0.02em; }
  i { font-style: normal; color: var(--accent); }
`;
