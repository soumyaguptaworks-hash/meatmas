import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { Dashboard } from '@/pages/Dashboard';
import { UserManagement } from '@/pages/UserManagement';
import { ItemMaster } from '@/pages/ItemMaster';
import { DemandApprovals } from '@/pages/DemandApprovals';
import { ProcessingPipeline } from '@/pages/ProcessingPipeline';
import { Login } from '@/pages/Login';
import { VerifyOtp } from '@/pages/VerifyOtp';

export const router = createBrowserRouter([
  { path: '/login',      element: <Login /> },
  { path: '/verify-otp', element: <VerifyOtp /> },
  {
    element: <AppShell />,
    children: [
      { path: '/',                  element: <Dashboard /> },
      { path: '/users',             element: <UserManagement /> },
      { path: '/item-master',       element: <ItemMaster /> },
      { path: '/demand-approvals',      element: <DemandApprovals /> },
      { path: '/processing-pipeline',   element: <ProcessingPipeline /> },
    ],
  },
]);
