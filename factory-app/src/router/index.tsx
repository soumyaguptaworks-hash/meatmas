import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { Login } from '@/pages/Login';
import { VerifyOtp } from '@/pages/VerifyOtp';
import { Home } from '@/pages/Home';
import { Demands } from '@/pages/Demands';
import { Inventory } from '@/pages/Inventory';
import { Batches } from '@/pages/Batches';
import { Packaging } from '@/pages/Packaging';
import { Profile } from '@/pages/Profile';

export const router = createBrowserRouter([
  // Public
  { path: '/login',      element: <Login /> },
  { path: '/verify-otp', element: <VerifyOtp /> },

  // Protected — AppShell guards with token check
  {
    element: <AppShell />,
    children: [
      { path: '/',          element: <Home /> },
      { path: '/demands',   element: <Demands /> },
      { path: '/inventory', element: <Inventory /> },
      { path: '/batches',   element: <Batches /> },
      { path: '/packaging', element: <Packaging /> },
      { path: '/profile',   element: <Profile /> },
    ],
  },
]);
