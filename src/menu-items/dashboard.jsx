import {
  QrCode,
  PlusSquare,
  Layers,
  Package,
  ScanQrCode
} from 'lucide-react';

const icons = {
  QrCode,
  Package,
  PlusSquare,
  Layers,
  ScanQrCode,
};

import { getUserData } from '../utils/authUtils';

const userData = getUserData();

const commonItems = [
  // {
  //   id: 'dashboard',
  //   title: 'Dashboard',
  //   type: 'item',
  //   url: '/dashboard/default',
  //   icon: icons.LayoutDashboard,
  //   breadcrumbs: false
  // },
  {
    id: 'qr-batch',
    title: 'QR Batch',
    type: 'item',
    url: '/qr-batch',
    icon: icons.QrCode,
    breadcrumbs: false
  },
  {
    id: 'create-qr-batch',
    title: 'Create QR Batch',
    type: 'item',
    url: '/qr-batch-create',
    icon: icons.PlusSquare,
    breadcrumbs: false
  },
  {
    id: 'prod-categories',
    title: 'Product Category',
    type: 'item',
    url: '/categories',
    icon: icons.Layers,
    breadcrumbs: false
  },
  {
    id: 'products',
    title: 'Products',
    type: 'item',
    url: '/products',
    icon: icons.Package,
    breadcrumbs: false
  },
  {
    id: 'product-verification',
    title: 'Product Verification',
    type: 'item',
    url: '/prod-verify',
    icon: icons.ScanQrCode,
    breadcrumbs: false
  },
];


const dashboard = {
  id: 'group-dashboard',
  title: 'Main Menu',
  type: 'group',
  children: userData.isAdmin ? [...commonItems] : commonItems
};

export default dashboard;
