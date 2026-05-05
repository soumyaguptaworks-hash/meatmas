import { Navigate } from 'react-router-dom';

export function VerifyOtp() {
  return <Navigate to="/login" replace />;
}
