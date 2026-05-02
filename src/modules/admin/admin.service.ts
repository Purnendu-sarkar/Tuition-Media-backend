import { prisma } from "../../lib/prisma.js";

async function getPlatformStats() {
  const [
    totalUsers,
    totalTutors,
    totalGuardians,
    activeJobs,
    pendingVerifications,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "TUTOR" } }),
    prisma.user.count({ where: { role: "GUARDIAN" } }),
    prisma.job.count({ where: { status: "OPEN" } }),
    prisma.verificationDocument.count({ where: { status: "PENDING" } }),
  ]);

  return {
    totalUsers,
    totalTutors,
    totalGuardians,
    activeJobs,
    pendingVerifications,
  };
}

async function getAllUsers(role?: string) {
  const where: any = {};
  if (role) {
    where.role = role.toUpperCase();
  }
  
  return prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isVerified: true,
      createdAt: true,
      _count: {
        select: {
          postedJobs: true,
          applications: true,
        }
      }
    },
    orderBy: { createdAt: "desc" },
  });
}

async function deleteUser(userId: string) {
  // Cascading deletes are configured in Prisma, so this deletes their profile, jobs, apps, etc.
  return prisma.user.delete({
    where: { id: userId },
  });
}

async function getAllJobs() {
  return prisma.job.findMany({
    include: {
      guardian: {
        select: { name: true, email: true }
      },
      _count: {
        select: { applications: true }
      }
    },
    orderBy: { createdAt: "desc" },
  });
}

async function deleteJob(jobId: string) {
  return prisma.job.delete({
    where: { id: jobId },
  });
}

export const adminService = {
  getPlatformStats,
  getAllUsers,
  deleteUser,
  getAllJobs,
  deleteJob,
};
