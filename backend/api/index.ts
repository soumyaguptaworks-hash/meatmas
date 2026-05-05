// Thin wrapper — esbuild-safe, no NestJS decorators here.
// The actual NestJS app is pre-compiled by tsc into dist/serverless.js
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getApp } = require('../dist/serverless');

module.exports = async (req: any, res: any) => {
  const expressApp = await getApp();
  return expressApp(req, res);
};
