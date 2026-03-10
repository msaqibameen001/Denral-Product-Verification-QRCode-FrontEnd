import PropTypes from 'prop-types';
// material-ui
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import MainCard from 'components/MainCard';

// assets
import RiseOutlined from '@ant-design/icons/RiseOutlined';
import FallOutlined from '@ant-design/icons/FallOutlined';

const iconSX = { fontSize: '0.75rem', color: 'inherit', marginLeft: 0, marginRight: 0 };

export default function AnalyticEcommerce({ color = 'primary', title, count, percentage, isLoss, extra, low }) {
  return (
    <MainCard contentSX={{ p: 2.25 }}>
      <Stack sx={{ gap: 0.5 }}>
        <Typography variant="h6" color="text.secondary" sx={{fontFamily: '"Sofia Sans", sans-serif'}}>
          {title}
        </Typography>
        <Grid container sx={{ alignItems: 'center' }}>
          <Grid>
            <Typography variant="h4" color="inherit" sx={{fontFamily: '"Sofia Sans", sans-serif'}}>
              {count}
            </Typography>
          </Grid>
          {percentage && (
            <Grid>
              <Chip
                variant="combined"
                color={color}
                icon={isLoss ? <FallOutlined style={iconSX} /> : <RiseOutlined style={iconSX} />}
                label={`${percentage}%`}
                sx={{ ml: 1.25, pl: 1, fontFamily: '"Sofia Sans", sans-serif' }}
                size="small"
              />
            </Grid>
          )}
        </Grid>
      </Stack>
      {low ? (
        <Box sx={{ pt: 2 }}>
          <Typography
            variant="caption"
            sx={{fontFamily: '"Sofia Sans", sans-serif'}}
            color={
              low.toLowerCase().includes('low') || low.toLowerCase().includes('bad')
                ? 'error' // red
                : 'success' // green
            }
          >
            {low}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ pt: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{fontFamily: '"Sofia Sans", sans-serif'}}>
            {extra}
          </Typography>
        </Box>
      )}
    </MainCard>
  );
}

AnalyticEcommerce.propTypes = {
  color: PropTypes.string,
  title: PropTypes.string,
  count: PropTypes.string,
  percentage: PropTypes.number,
  isLoss: PropTypes.bool,
  extra: PropTypes.string
};
