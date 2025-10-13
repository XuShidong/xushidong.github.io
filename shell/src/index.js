import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import styled from 'styled-components';

// 微前端组件懒加载
const App1 = React.lazy(() => import('app1/App'));
const App2 = React.lazy(() => import('app2/App'));

const Header = styled.header`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
`;

const Nav = styled.nav`
  display: flex;
  gap: 2rem;
  margin-top: 1rem;
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: rgba(255,255,255,0.2);
  }
  
  &.active {
    background-color: rgba(255,255,255,0.3);
  }
`;

const MainContent = styled.main`
  padding: 2rem;
  min-height: calc(100vh - 200px);
`;

const Loading = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
  font-size: 1.1rem;
`;

const HomePage = () => (
  <div>
    <h2>欢迎使用微前端框架</h2>
    <p>这是一个基于 Webpack Module Federation 的微前端解决方案。</p>
    <div style={{ marginTop: '2rem' }}>
      <h3>功能特性：</h3>
      <ul>
        <li>🚀 独立部署和开发</li>
        <li>🔄 运行时动态加载</li>
        <li>📦 共享依赖管理</li>
        <li>🔗 应用间通信</li>
        <li>🎨 统一的设计系统</li>
      </ul>
    </div>
  </div>
);

const App = () => {
  return (
    <Router>
      <Header>
        <Title>微前端框架</Title>
        <Nav>
          <NavLink to="/">首页</NavLink>
          <NavLink to="/app1">应用1</NavLink>
          <NavLink to="/app2">应用2</NavLink>
        </Nav>
      </Header>
      
      <MainContent>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route 
            path="/app1" 
            element={
              <React.Suspense fallback={<Loading>正在加载应用1...</Loading>}>
                <App1 />
              </React.Suspense>
            } 
          />
          <Route 
            path="/app2" 
            element={
              <React.Suspense fallback={<Loading>正在加载应用2...</Loading>}>
                <App2 />
              </React.Suspense>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainContent>
    </Router>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);