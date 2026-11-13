import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Header = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const close = (e) => menuRef.current && !menuRef.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setOpen(false);
    navigate('/');
  };

  const go = (path) => { setOpen(false); navigate(path); };

  return (
    <Bar>
      <Wordmark onClick={() => navigate('/')}>
        Wearithm<Dot aria-hidden="true" />
      </Wordmark>

      {user ? (
        <Dropdown ref={menuRef}>
          <UserButton onClick={() => setOpen((v) => !v)}>
            <Avatar>{user.nickname[0]}</Avatar>{user.nickname}
          </UserButton>
          {open && (
            <Menu>
              <MenuItem onClick={() => go('/mypage')}>마이페이지</MenuItem>
              <MenuItem onClick={() => go('/mypage/edit')}>프로필 수정</MenuItem>
              <Divider />
              <MenuItem $danger onClick={handleLogout}>로그아웃</MenuItem>
            </Menu>
          )}
        </Dropdown>
      ) : (
        <LoginButton onClick={() => navigate('/login')}>로그인</LoginButton>
      )}
    </Bar>
  );
};

export default Header;

const Bar = styled.header`
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px 12px;
  background: color-mix(in srgb, var(--page) 92%, transparent);
  backdrop-filter: blur(8px);
`;

const Wordmark = styled.h1`
  display: flex;
  align-items: flex-end;
  font-family: var(--num);
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1;
  color: var(--ink);
  cursor: pointer;
`;

const Dot = styled.span`
  width: 7px;
  height: 7px;
  margin: 0 0 1px 3px;
  border-radius: 50%;
  background: var(--accent);
`;

const LoginButton = styled.button`
  padding: 9px 18px;
  border-radius: 999px;
  background: var(--ink);
  color: var(--page);
  font-size: 14px;
  font-weight: 700;
`;

const Dropdown = styled.div` position: relative; `;

const UserButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 14px 4px 4px;
  border-radius: 999px;
  background: var(--surface);
  border: 1px solid var(--line);
  font-size: 14px;
  font-weight: 700;
  color: var(--ink);
`;

const Avatar = styled.span`
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--ink);
  color: var(--page);
  font-size: 13px;
`;

const Menu = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 150px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-box);
  padding: 6px;
`;

const MenuItem = styled.div`
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  color: ${({ $danger }) => ($danger ? 'var(--red)' : 'var(--ink)')};
  &:hover { background: var(--page); }
`;

const Divider = styled.div`
  height: 1px;
  margin: 4px 6px;
  background: var(--line);
`;
