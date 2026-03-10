import { useState } from 'react';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import MainCard from 'components/MainCard';
import IncomeAreaChart from './IncomeAreaChart';

export default function UniqueVisitorCard({ dashboardData, loading }) {
  const [view, setView] = useState('monthly'); // 'monthly' or 'weekly'

  return (
    <>
      <Grid container sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Grid>
          <Typography variant="h5" sx={{ fontFamily: '"Sofia Sans", sans-serif' }}>
            Sales & Purchase Trend
          </Typography>
        </Grid>
        <Grid>
          <Stack direction="row" sx={{ alignItems: 'center' }}>
            <Button
              size="small"
              onClick={() => setView('monthly')}
              color={view === 'monthly' ? 'primary' : 'secondary'}
              variant={view === 'monthly' ? 'outlined' : 'text'}
              sx={{ fontFamily: '"Sofia Sans", sans-serif' }}
            >
              Month
            </Button>
            <Button
              size="small"
              onClick={() => setView('weekly')}
              color={view === 'weekly' ? 'primary' : 'secondary'}
              variant={view === 'weekly' ? 'outlined' : 'text'}
              sx={{ fontFamily: '"Sofia Sans", sans-serif' }}
            >
              Week
            </Button>
          </Stack>
        </Grid>
      </Grid>
      <MainCard content={false} sx={{ mt: 1.5 }}>
        <Box sx={{ pt: 1, pr: 2 }}>
          {/* YE DEKHO - dashboardData aur loading pass kar rahe hain */}
          <IncomeAreaChart view={view} dashboardData={dashboardData} loading={loading} />
        </Box>
      </MainCard>
    </>
  );
}
