import styled from 'styled-components';
import { NavLink, useNavigate } from 'react-router-dom';
import { GoHome, GoHomeFill, GoHistory, GoPerson, GoPersonFill } from 'react-icons/go';
import { FiPlus } from 'react-icons/fi';

const TabBar = ({ user }) => {
  const navigate = useNavigate();

  const needLogin = (path) => (e) => {
    if (user) return;
    e.preventDefault();
    alert('로그인이 필요합니다.');
    navigate('/login', { state: { redirectTo: path } });
  };

  return (
    <Bar>
      <Tab to="/" end>
        {({ isActive }) => (<>{isActive ? <GoHomeFill /> : <GoHome />}<span>홈</span></>)}
      </Tab>
      <Tab to="/write" onClick={needLogin('/write')}>
        <Plus><FiPlus /></Plus><span>올리기</span>
      </Tab>
      <Tab to="/history">
        <GoHistory /><span>순환 기록</span>
      </Tab>
      <Tab to="/mypage" onClick={needLogin('/mypage')}>
        {({ isActive }) => (<>{isActive ? <GoPersonFill /> : <GoPerson />}<span>마이</span></>)}
      </Tab>
    </Bar>
  );
};

export default TabBar;

const Bar = styled.nav`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 60;
  width: 100%;
  max-width: 640px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  padding: 8px 8px calc(10px + env(safe-area-inset-bottom));
  background: color-mix(in srgb, var(--surface) 94%, transparent);
  backdrop-filter: blur(10px);
  border-top: 1px solid var(--line);
`;

const Tab = styled(NavLink)`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding-top: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--sub);
  svg { font-size: 22px; }

  &.active { color: var(--ink); font-weight: 800; }
  &.active::before {
    content: '';
    position: absolute;
    top: -2px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent);
  }
`;

const Plus = styled.span`
  display: grid;
  place-items: center;
  width: 26px;
  height: 22px;
  border-radius: 999px;
  background: var(--ink);
  color: var(--page);
  svg { font-size: 16px; }
`;
