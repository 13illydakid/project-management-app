export function isProd() {
  return !!process.env.VERCEL;
}
