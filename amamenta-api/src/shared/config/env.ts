import "dotenv/config";

export const env = {
  jwtSecret:
    process.env.JWT_SECRET ||
    "6a25a98290e76635f5fc80031393bb2659c1f3ee4c5fc23b3df78aa5d9a5e037a6d45b564740b2c88f1e423aea44da82426e8a17b264d1adc99c0b1bb97f4a5d",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "30d",
  appBaseUrl: process.env.APP_BASE_URL || "http://localhost:3000",
  frontendUrl: process.env.FRONTEND_URL,

  emailHost: process.env.EMAIL_HOST || "",
  emailPort: Number(process.env.EMAIL_PORT || 587),
  emailSecure: process.env.EMAIL_SECURE === "true",
  emailUser: process.env.EMAIL_USER || "",
  emailPass: process.env.EMAIL_PASS || "",

  emailFrom: process.env.EMAIL_FROM || "",
  resendApiKey: process.env.RESEND_API_KEY || "",

  SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD,
  SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL,
  DATABASE_URL: process.env.DATABASE_URL,
};
