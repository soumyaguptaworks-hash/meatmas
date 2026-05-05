interface JwtPayload { sub: string; email: string; role: string; appContext: string; exp: number; }
export function decodeJwt(token: string): JwtPayload {
  const json = decodeURIComponent(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))
    .split('').map(c => '%' + c.charCodeAt(0).toString(16).padStart(2,'0')).join(''));
  return JSON.parse(json);
}
