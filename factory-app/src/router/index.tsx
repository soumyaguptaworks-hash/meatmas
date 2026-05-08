import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { Login } from '@/pages/Login';
import { VerifyOtp } from '@/pages/VerifyOtp';
import { Home } from '@/pages/Home';
import { Demands } from '@/pages/Demands';
import { DemandDetail } from '@/pages/DemandDetail';
import { Inventory } from '@/pages/Inventory';
import { InventoryDetail } from '@/pages/InventoryDetail';
import { Batches } from '@/pages/Batches';
import { BatchDetail } from '@/pages/BatchDetail';
import { Packaging } from '@/pages/Packaging';
import { PackagingDetail } from '@/pages/PackagingDetail';
import { Profile } from '@/pages/Profile';

export const router = createBrowserRouter([
  // Public
  { path: '/login',      element: <Login /> },
  { path: '/verify-otp', element: <VerifyOtp /> },

  // Protected — AppShell guards with token check
  {
    element: <AppShell />,
    children: [
      { path: '/',               element: <Home /> },
      { path: '/demands',        element: <Demands /> },
      { path: '/demands/:id',    element: <DemandDetail /> },
      { path: '/inventory',      element: <Inventory /> },
      { path: '/inventory/:id',  element: <InventoryDetail /> },
      { path: '/batches',        element: <Batches /> },
      { path: '/batches/:id',    element: <BatchDetail /> },
      { path: '/packaging',      element: <Packaging /> },
      { path: '/packaging/:id',  element: <PackagingDetail /> },
      { path: '/profile',        element: <Profile /> },
    ],
  },
]);
