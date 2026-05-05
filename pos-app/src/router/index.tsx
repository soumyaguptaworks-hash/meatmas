import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { Login } from '@/pages/Login';
import { VerifyOtp } from '@/pages/VerifyOtp';
import { POS } from '@/pages/POS';

export const router = createBrowserRouter([
  { path: '/login',       element: <Login /> },
  { path: '/verify-otp',  element: <VerifyOtp /> },
  {
    element: <AppShell />,
    children: [{ path: '/', element: <POS /> }],
  },
]);
