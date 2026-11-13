import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import Header from './components/Header';
import Footer from './components/Footer';
import TabBar from './components/TabBar';

const Layout = ({ user, setUser }) => {
  return (
    <PageWrapper>
      <Header user={user} setUser={setUser} />
      <MainContent>
        <Outlet context={{ user, setUser }} />
      </MainContent>
      <Footer />
      <TabBar user={user} />
    </PageWrapper>
  );
};

export default Layout;

const PageWrapper = styled.div`
  max-width: 640px;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--page);
  padding-bottom: 76px;`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
`;
