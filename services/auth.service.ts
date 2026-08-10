import { sleep } from "@/utils/helpers";
import type { LoginCredentials, AuthResponse as LoginResponse, User } from "@/types";

const MOCK_CURRENT_USER: User = {
  id: "u1",
  name: "Admin User",
  email: "admin@entryflow.com",
  role: "admin",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const DEMO_EMAIL = "admin@entryflow.com";
const DEMO_PASSWORD = "admin123";
const MOCK_TOKEN = "ey.mock.jwt.token.entryflow";

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    await sleep(900);
    if (
      credentials.email !== DEMO_EMAIL ||
      credentials.password !== DEMO_PASSWORD
    ) {
      throw new Error("Invalid email or password. Use admin@entryflow.com / admin123");
    }
    // Set cookie for middleware
    document.cookie = `ef-auth-token=${MOCK_TOKEN}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
    return {
      user: MOCK_CURRENT_USER,
      token: MOCK_TOKEN,
      refreshToken: "ef.refresh.token",
    };
  },

  async logout(): Promise<void> {
    await sleep(300);
    document.cookie = "ef-auth-token=; path=/; max-age=0";
  },

  async getMe(): Promise<User> {
    await sleep(400);
    return MOCK_CURRENT_USER;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    await sleep(800);
    if (!email.includes("@")) throw new Error("Invalid email");
    return { message: "OTP sent to your email address." };
  },

  async verifyOtp(email: string, otp: string): Promise<{ resetToken: string }> {
    await sleep(600);
    if (otp !== "123456") throw new Error("Invalid OTP. Use 123456 for demo.");
    return { resetToken: "ef.reset.token.mock" };
  },

  async resetPassword(resetToken: string, password: string): Promise<{ message: string }> {
    await sleep(700);
    void resetToken;
    void password;
    return { message: "Password reset successfully." };
  },
};
