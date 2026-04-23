import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import useMediaQuery from '@mui/material/useMediaQuery';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import { isLoggedIn } from '../../routes/IsLoggedIn';

import Drawer from './Drawer';
import Header from './Header';
import Loader from 'components/Loader';
import Breadcrumbs from 'components/@extended/Breadcrumbs';

import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';

export default function DashboardLayout() {
  const { menuMasterLoading } = useGetMenuMaster();
  const downXL = useMediaQuery((theme) => theme.breakpoints.down('xl'));
  const location = useLocation();
  const loggedIn = isLoggedIn();

  const isPurchaseRoute = location.pathname === '/purchase';
  const isProdVerifyRoute = location.pathname === '/prod-verify';
  const isScanRoute = /^\/scan\//.test(location.pathname);

  useEffect(() => {
    handlerDrawerOpen(!downXL);
  }, [downXL]);

  if (menuMasterLoading) return <Loader />;

  if (isScanRoute || (isProdVerifyRoute && !loggedIn)) {
    return (
      <Box
        component="main"
        sx={{
          width: 'calc(100%)',
          flexGrow: 1,
          backgroundColor: isPurchaseRoute ? '#F5F5F5' : 'transparent'
        }}
      >
        {/* <Toolbar sx={{ mt: 'inherit' }} />
        <Box
          sx={{
            ...{ px: { xs: 0, sm: 2 } },
            position: 'relative',
            minHeight: 'calc(100vh - 110px)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Breadcrumbs /> */}
        <Outlet />
        {/* <Footer /> */}
      </Box>
      // </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      <Header />
      <Drawer />

      <Box
        component="main"
        sx={{
          width: 'calc(100% - 260px)',
          flexGrow: 1,
          pt: isProdVerifyRoute ? 0 : { xs: 2, sm: 2 },
          backgroundColor: isPurchaseRoute ? '#F5F5F5' : 'transparent'
        }}
      >
        <Toolbar sx={{ mt: 'inherit' }} />
        <Box
          sx={{
            ...{ px: isProdVerifyRoute ? 0 : { xs: 0, sm: 2 }, },
            position: 'relative',
            minHeight: 'calc(100vh - 110px)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Breadcrumbs />
          <Outlet />
          {/* <Footer /> */}
        </Box>
      </Box>
    </Box>
  );
}
