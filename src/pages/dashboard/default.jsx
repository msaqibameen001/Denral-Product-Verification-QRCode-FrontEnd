// ==================== DashboardDefault.jsx ====================
import { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';
import UniqueVisitorCard from 'sections/dashboard/default/UniqueVisitorCard';
import axiosInstance from '../../Redux/Action/axiosInstance';
import { Skeleton, Row, Col } from 'antd';
import Box from '@mui/material/Box';

export default function DashboardDefault() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_ENDPOINT = import.meta.env.VITE_APP_API_URL;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`${API_ENDPOINT}Dashboard/stats`);

      if (!response.data.success) {
        throw new Error('Failed to fetch dashboard data');
      }

      const result = response.data;
      if (result.success) {
        setDashboardData(result.data);
      } else {
        throw new Error(result.message || 'Failed to load data');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        {/* Title Skeleton */}
        <Skeleton.Input active size="large" style={{ width: 200, marginBottom: 30 }} />

        {/* Stats Cards Skeletons */}
        <Row gutter={[16, 16]}>
          {[1, 2, 3, 4].map((item) => (
            <Col xs={24} sm={12} lg={6} key={item}>
              <Skeleton
                active
                paragraph={{ rows: 2 }}
                style={{
                  padding: 20,
                  borderRadius: 8,
                  backgroundColor: '#f5f5f5'
                }}
              />
            </Col>
          ))}
        </Row>

        {/* Chart Skeleton */}
        <Skeleton
          active
          paragraph={{ rows: 6 }}
          style={{
            marginTop: 30,
            padding: 20,
            borderRadius: 8,
            backgroundColor: '#f5f5f5'
          }}
        />
      </Box>
    );
  }

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      {/* row 1 */}
      <Grid sx={{ mb: -2.25 }} size={12}>
        <Typography variant="h5" sx={{ fontFamily: '"Sofia Sans", sans-serif' }}>
          Dashboard
        </Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <AnalyticEcommerce title="Total Stock" count={`${dashboardData?.totalStock} Kg` || 0} low={dashboardData?.stockStatus || ''} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <AnalyticEcommerce
          title="Total Sales"
          count={`Rs.${dashboardData?.totalSalesThisMonth}` || 0}
          percentage={dashboardData?.salesGrowthPercentage || 0}
          extra="Total Sales This Month"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <AnalyticEcommerce
          title="Total Purchase"
          count={`Rs.${dashboardData?.totalPurchasesThisMonth || 0}`}
          percentage={dashboardData?.purchasesGrowthPercentage || 0}
          extra="Total Purchase This Month"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <AnalyticEcommerce title="Total Receivables" count={`Rs.${dashboardData?.totalReceivables || 0}`} extra="Total Receivables" />
      </Grid>
      <Grid sx={{ display: { sm: 'none', md: 'block', lg: 'none' } }} size={{ md: 8 }} />
      {/* row 2 */}
      <Grid size={{ xs: 12, md: 7, lg: 12 }}>
        {/* YE DEKHO - dashboardData pass kar rahe hain */}
        <UniqueVisitorCard dashboardData={dashboardData} loading={loading} />
      </Grid>
    </Grid>
  );
}
