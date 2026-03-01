import "dotenv/config";

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET environment variable is required in production");
}

export const config = {
  port: Number(process.env.PORT ?? 4001),
  jwtSecret: jwtSecret ?? "dev_change_me",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  isProduction: process.env.NODE_ENV === "production",
};
