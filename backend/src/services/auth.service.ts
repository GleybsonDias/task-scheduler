import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma.js";
import {
  RegisterInput,
  LoginInput,
  UpdateProfileInput,
  ChangePasswordInput,
} from "../schemas/auth.schema.js";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("A variável de ambiente JWT_SECRET não está definida.");
  }
  return secret;
}

export async function registerUser(data: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error("Este e-mail já se encontra registado");
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  return user;
}

export async function loginUser(data: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new Error("Credenciais inválidas");
  }

  const isPasswordValid = await bcrypt.compare(
    data.password,
    user.passwordHash,
  );

  if (!isPasswordValid) {
    throw new Error("Credenciais inválidas");
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    getJwtSecret(),
    { expiresIn: "7d" },
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    token,
  };
}

export async function updateProfile(userId: string, data: UpdateProfileInput) {
  if (data.email) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing && existing.id !== userId) {
      throw new Error(
        "Este endereço de e-mail já está a ser utilizado por outra conta.",
      );
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      email: data.email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      updatedAt: true,
    },
  });

  return updatedUser;
}

export async function changePassword(
  userId: string,
  data: ChangePasswordInput,
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("Utilizador não encontrado.");
  }

  const isCurrentValid = await bcrypt.compare(
    data.currentPassword,
    user.passwordHash,
  );
  if (!isCurrentValid) {
    throw new Error("A palavra-passe atual está incorreta.");
  }

  const newHash = await bcrypt.hash(data.newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newHash },
  });

  return { message: "Palavra-passe alterada com sucesso." };
}
