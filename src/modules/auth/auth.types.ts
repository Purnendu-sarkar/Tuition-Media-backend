import type { UserRole } from "@prisma/client";

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
  role: Extract<UserRole, "TUTOR" | "GUARDIAN">;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image: string | null;
  isVerified: boolean;
  createdAt: Date;
}
