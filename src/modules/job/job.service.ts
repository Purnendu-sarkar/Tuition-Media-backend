import { prisma } from "../../lib/prisma.js";
import type { ApplyJobInput } from "./job.validation.js";

async function getAllOpenJobs() {
  const jobs = await prisma.job.findMany({
    where: {
      status: "OPEN",
    },
    include: {
      guardian: {
        select: {
          name: true,
          image: true,
        },
      },
      _count: {
        select: { applications: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return jobs;
}

async function getJobById(jobId: string) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      guardian: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });

  if (!job) {
    throw new Error("Job not found");
  }

  return job;
}

async function applyForJob(tutorId: string, jobId: string, data: ApplyJobInput) {
  // Check if job exists and is open
  const job = await prisma.job.findUnique({
    where: { id: jobId },
  });

  if (!job) {
    throw new Error("Job not found");
  }

  if (job.status !== "OPEN") {
    throw new Error("This job is no longer open for applications");
  }

  // Check if tutor already applied
  const existingApplication = await prisma.jobApplication.findUnique({
    where: {
      jobId_tutorId: {
        jobId,
        tutorId,
      },
    },
  });

  if (existingApplication) {
    throw new Error("You have already applied for this job");
  }

  // Create application
  const application = await prisma.jobApplication.create({
    data: {
      jobId,
      tutorId,
      coverLetter: data.coverLetter,
      status: "PENDING",
    },
  });

  return application;
}

async function getAppliedJobsByTutor(tutorId: string) {
  const applications = await prisma.jobApplication.findMany({
    where: {
      tutorId,
    },
    select: {
      jobId: true,
    },
  });

  return applications.map((app) => app.jobId);
}

export const jobService = {
  getAllOpenJobs,
  getJobById,
  applyForJob,
  getAppliedJobsByTutor,
};
