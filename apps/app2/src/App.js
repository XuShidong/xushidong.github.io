import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
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

const ChartContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const Chart = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  border: 1px solid #e9ecef;
`;

const ChartTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.2rem;
`;

const ChartValue = styled.div`
  font-size: 3rem;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 0.5rem;
`;

const ChartLabel = styled.div`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 20px;
  background: #e9ecef;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 0.5rem;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #007bff, #00d4ff);
  border-radius: 10px;
  transition: width 0.3s ease;
  width: ${props => props.percentage}%;
`;

const DataTable = styled.div`
  margin-top: 2rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
`;

const Th = styled.th`
  background: #f8f9fa;
  padding: 1rem;
  text-align: left;
  border-bottom: 2px solid #dee2e6;
  color: #495057;
  font-weight: 600;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  color: #495057;
`;

const Tr = styled.tr`
  &:hover {
    background: #f8f9fa;
  }
`;

const Button = styled.button`
  background: #28a745;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
  
  &:hover {
    background: #218838;
  }
`;

const App = () => {
  const [data, setData] = useState({
    totalUsers: 0,
    activeUsers: 0,
    revenue: 0,
    conversion: 0,
    pageViews: 0,
    bounceRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟API调用
    setTimeout(() => {
      setData({
        totalUsers: 12543,
        activeUsers: 8932,
        revenue: 45678,
        conversion: 3.2,
        pageViews: 234567,
        bounceRate: 45.6,
      });
      setLoading(false);
    }, 1500);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setData(prev => ({
        ...prev,
        totalUsers: prev.totalUsers + Math.floor(Math.random() * 100),
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 50),
        revenue: prev.revenue + Math.floor(Math.random() * 1000),
      }));
      setLoading(false);
    }, 1000);
  };

  const tableData = [
    { metric: '总用户数', value: data.totalUsers.toLocaleString(), change: '+12%' },
    { metric: '活跃用户', value: data.activeUsers.toLocaleString(), change: '+8%' },
    { metric: '收入', value: `¥${data.revenue.toLocaleString()}`, change: '+15%' },
    { metric: '转化率', value: `${data.conversion}%`, change: '+2%' },
    { metric: '页面浏览量', value: data.pageViews.toLocaleString(), change: '+5%' },
    { metric: '跳出率', value: `${data.bounceRate}%`, change: '-3%' },
  ];

  return (
    <Container>
      <Header>
        <Title>数据分析中心</Title>
        <Subtitle>实时监控业务指标和用户行为</Subtitle>
      </Header>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>关键指标</h2>
          <Button onClick={handleRefresh} disabled={loading}>
            {loading ? '刷新中...' : '刷新数据'}
          </Button>
        </div>

        <ChartContainer>
          <Chart>
            <ChartTitle>总用户数</ChartTitle>
            <ChartValue>{loading ? '...' : data.totalUsers.toLocaleString()}</ChartValue>
            <ChartLabel>累计注册用户</ChartLabel>
            <ProgressBar>
              <ProgressFill percentage={85} />
            </ProgressBar>
            <div style={{ fontSize: '0.8rem', color: '#28a745' }}>+12% 较上月</div>
          </Chart>

          <Chart>
            <ChartTitle>活跃用户</ChartTitle>
            <ChartValue>{loading ? '...' : data.activeUsers.toLocaleString()}</ChartValue>
            <ChartLabel>月活跃用户</ChartLabel>
            <ProgressBar>
              <ProgressFill percentage={72} />
            </ProgressBar>
            <div style={{ fontSize: '0.8rem', color: '#28a745' }}>+8% 较上月</div>
          </Chart>

          <Chart>
            <ChartTitle>收入</ChartTitle>
            <ChartValue>{loading ? '...' : `¥${data.revenue.toLocaleString()}`}</ChartValue>
            <ChartLabel>本月收入</ChartLabel>
            <ProgressBar>
              <ProgressFill percentage={68} />
            </ProgressBar>
            <div style={{ fontSize: '0.8rem', color: '#28a745' }}>+15% 较上月</div>
          </Chart>

          <Chart>
            <ChartTitle>转化率</ChartTitle>
            <ChartValue>{loading ? '...' : `${data.conversion}%`}</ChartValue>
            <ChartLabel>用户转化率</ChartLabel>
            <ProgressBar>
              <ProgressFill percentage={data.conversion * 20} />
            </ProgressBar>
            <div style={{ fontSize: '0.8rem', color: '#28a745' }}>+2% 较上月</div>
          </Chart>
        </ChartContainer>

        <DataTable>
          <h3>详细数据</h3>
          <Table>
            <thead>
              <tr>
                <Th>指标</Th>
                <Th>当前值</Th>
                <Th>变化</Th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <Tr key={index}>
                  <Td>{row.metric}</Td>
                  <Td>{row.value}</Td>
                  <Td style={{ color: row.change.startsWith('+') ? '#28a745' : '#dc3545' }}>
                    {row.change}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </DataTable>
      </Card>
    </Container>
  );
};

export default App;