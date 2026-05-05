import api from './axios';

export interface LoginPayload   { email: string; password: string; appContext: 'POS'; }
export interface VerifyOtpPayload { email: string; otp: string; }
export interface AuthTokens       { accessToken: string; refreshToken: string; }

export const authApi = {
  login:  (p: LoginPayload) => api.post<AuthTokens>('/auth/login', p),
  logout: ()                => api.post('/auth/logout'),
};
