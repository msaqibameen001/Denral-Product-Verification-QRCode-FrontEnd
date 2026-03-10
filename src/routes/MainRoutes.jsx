import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import { isLoggedIn } from './IsLoggedIn';
import { Navigate } from 'react-router-dom';
import { getUserData } from '../utils/authUtils';

// render- Dashboard
const DashboardDefault = Loadable(lazy(() => import('../pages/dashboard/default')));
const NotFound = Loadable(lazy(() => import('../pages/component-overview/NotFoundPage')));

const ProductCategories = Loadable(lazy(() => import('../pages/component-overview/Products/ProductCategories')));
const Products = Loadable(lazy(() => import('../pages/component-overview/Products/Products')));
const QRBatchList = Loadable(lazy(() => import('../pages/component-overview/QRBatch/QRBatchList')));
const CreateQRBatch = Loadable(lazy(() => import('../pages/component-overview/QRBatch/CreateQRBatch')));
const BatchDetails = Loadable(lazy(() => import('../pages/component-overview/QRBatch/BatchDetails')));
const SerialScan = Loadable(lazy(() => import('../pages/component-overview/QRBatch/SerialScan')));

const userData = getUserData();

const MainRoutes = {
  path: '/',
  element: <DashboardLayout />,
  children: [
    {
      path: '/',
      element: isLoggedIn() ? <DashboardDefault /> : <Navigate to="/login" />
    },
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: isLoggedIn() ? <DashboardDefault /> : <Navigate to="/login" />
        }
      ]
    },
    {
      path: 'categories',
      element: isLoggedIn() ? <ProductCategories /> : <Navigate to="/login" />
    },
    {
      path: 'scan/:serialNo',
      element: <SerialScan />
    },
    {
      path: 'qr-batch',
      element: isLoggedIn() ? <QRBatchList /> : <Navigate to="/login" />
    },
    {
      path: 'qr-batch-create',
      element: isLoggedIn() ? <CreateQRBatch /> : <Navigate to="/login" />
    },
    {
      path: 'products',
      element: isLoggedIn() ? <Products /> : <Navigate to="/login" />
    },
    {
      path: 'qr-batch/:batchId',
      element: isLoggedIn() ? <BatchDetails /> : <Navigate to="/login" />
    },
    {
      path: '*',
      element: <NotFound />
    }
  ]
};

export default MainRoutes;
