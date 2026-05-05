import api from './axios';

export interface LoginPayload {
  email: string;
  password: string;
  appContext: 'FACTORY';
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<AuthTokens>('/auth/login', payload),

  logout: () =>
    api.post<{ message: string }>('/auth/logout'),
};
