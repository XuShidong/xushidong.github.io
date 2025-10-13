import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  padding: 2rem;
  border-radius: 10px;
  margin-bottom: 2rem;
  text-align: center;
`;

const Title = styled.h1`
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
  font-weight: 600;
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 1.1rem;
  opacity: 0.9;
`;

const Card = styled.div`
  background: white;
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
`;

const UserList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const UserCard = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  }
`;

const UserName = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.2rem;
`;

const UserEmail = styled.p`
  margin: 0 0 0.5rem 0;
  color: #666;
  font-size: 0.9rem;
`;

const UserRole = styled.span`
  background: #007bff;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const Button = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
  
  &:hover {
    background: #0056b3;
  }
  
  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const App = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟API调用
    setTimeout(() => {
      const mockUsers = [
        { id: 1, name: '张三', email: 'zhangsan@example.com', role: '管理员' },
        { id: 2, name: '李四', email: 'lisi@example.com', role: '用户' },
        { id: 3, name: '王五', email: 'wangwu@example.com', role: '编辑' },
        { id: 4, name: '赵六', email: 'zhaoliu@example.com', role: '用户' },
        { id: 5, name: '钱七', email: 'qianqi@example.com', role: '管理员' },
        { id: 6, name: '孙八', email: 'sunba@example.com', role: '用户' },
      ];
      setUsers(mockUsers);
      setLoading(false);
    }, 1000);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <Container>
      <Header>
        <Title>用户管理系统</Title>
        <Subtitle>基于微前端架构的用户管理应用</Subtitle>
      </Header>

      <Stats>
        <StatCard>
          <StatNumber>{users.length}</StatNumber>
          <StatLabel>总用户数</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{users.filter(u => u.role === '管理员').length}</StatNumber>
          <StatLabel>管理员</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{users.filter(u => u.role === '用户').length}</StatNumber>
          <StatLabel>普通用户</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>98.5%</StatNumber>
          <StatLabel>系统可用性</StatLabel>
        </StatCard>
      </Stats>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>用户列表</h2>
          <Button onClick={handleRefresh} disabled={loading}>
            {loading ? '刷新中...' : '刷新数据'}
          </Button>
        </div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            正在加载用户数据...
          </div>
        ) : (
          <UserList>
            {users.map(user => (
              <UserCard key={user.id}>
                <UserName>{user.name}</UserName>
                <UserEmail>{user.email}</UserEmail>
                <UserRole>{user.role}</UserRole>
              </UserCard>
            ))}
          </UserList>
        )}
      </Card>
    </Container>
  );
};

export default App;