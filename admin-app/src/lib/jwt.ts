interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  appContext: string;
  exp: number;
}

// Decode JWT payload without verifying signature.
// Signature is verified by the backend on every request.
export function decodeJwt(token: string): JwtPayload {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  const json = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join(''),
  );
  return JSON.parse(json) as JwtPayload;
}
