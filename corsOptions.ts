export const corsOption = (req: any, res: any, next: any) => {
  const allowedOrigins = ["https://bucodel-fysq9nvix-alabiemmanuel177.vercel.app", "https://bucodel.vercel.app/", "https://bucodel-alabiemmanuel177.vercel.app/"];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "content-type, Authorization, application/ json"
  );
  next();
};
export default corsOption;
