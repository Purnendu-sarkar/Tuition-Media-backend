import { Prisma } from "@prisma/client";
import { StatusCodes } from "http-status-codes";

import { AppError } from "../../lib/app-error.js";
import { signAccessToken } from "../../lib/jwt.js";
import { comparePassword, hashPassword } from "../../lib/password.js";
import { prisma } from "../../lib/prisma.js";
import type { SafeUser, SignInInput, SignUpInput } from "./auth.types.js";

function sanitizeUser(user: {
  id: string;
  name: string;
  email: string;
  role: SafeUser["role"];
  image: string | null;
  isVerified: boolean;
  createdAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    image: user.image,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
  } satisfies SafeUser;
}

async function signUp(payload: SignUpInput) {
  try {
    const passwordHash = await hashPassword(payload.password);

    const user = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email.toLowerCase(),
        role: payload.role,
        passwordHash,
      },
    });

    const safeUser = sanitizeUser(user);

    return {
      accessToken: signAccessToken({
        sub: safeUser.id,
        email: safeUser.email,
        role: safeUser.role,
      }),
      user: safeUser,
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new AppError(StatusCodes.CONFLICT, "An account with this email already exists.");
    }

    throw error;
  }
}

async function signIn(payload: SignInInput) {
  const user = await prisma.user.findUnique({
    where: {
      email: payload.email.toLowerCase(),
    },
  });

  if (!user) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid email or password.");
  }

  const isPasswordValid = await comparePassword(payload.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid email or password.");
  }

  const safeUser = sanitizeUser(user);

  return {
    accessToken: signAccessToken({
      sub: safeUser.id,
      email: safeUser.email,
      role: safeUser.role,
    }),
    user: safeUser,
  };
}

export const authService = {
  signUp,
  signIn,
};
