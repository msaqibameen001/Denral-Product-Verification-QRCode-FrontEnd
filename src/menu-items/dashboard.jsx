import {
  LayoutDashboard,
  BookOpen,
  PieChart,
  ShoppingCart,
  Boxes,
  Users,
  User,
  Truck,
  Wallet,
  FileText,
  PackageOpen,
  Package
} from 'lucide-react';

const icons = {
  LayoutDashboard,
  Boxes,
  Users,
  User,
  Truck,
  Wallet,
  FileText,
  PackageOpen,
  Package,
  ShoppingCart,
  BookOpen,
  PieChart
};

import { getUserData } from '../utils/authUtils';

const userData = getUserData();

const commonItems = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    type: 'item',
    url: '/dashboard/default',
    icon: icons.LayoutDashboard,
    breadcrumbs: false
  },
  {
    id: 'prod-categories',
    title: 'Product Category',
    type: 'item',
    url: '/categories',
    icon: icons.PackageOpen,
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
    id: 'qr-batch',
    title: 'QR Batch',
    type: 'item',
    url: '/qr-batch',
    icon: icons.Truck,
    breadcrumbs: false
  },
  {
    id: 'qr-batch',
    title: 'Create QR Batch',
    type: 'item',
    url: '/qr-batch-create',
    icon: icons.Truck,
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
