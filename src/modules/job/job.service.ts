import { prisma } from "../../lib/prisma.js";
import { aiService } from "../ai/ai.service.js";
import type { ApplyJobInput } from "./job.validation.js";

async function getAllOpenJobs(tutorId?: string) {
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

  if (!tutorId) return jobs;

  // Calculate match scores if tutorId is provided
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { userId: tutorId },
  });

  if (!tutorProfile) return jobs;

  return jobs.map(job => ({
    ...job,
    matchScore: aiService.calculateMatchScore(
      { title: job.title, description: job.description, budget: job.budget },
      { bio: tutorProfile.bio, subjects: tutorProfile.subjects, hourlyRate: tutorProfile.hourlyRate }
    )
  }));
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

async function getTutorApplications(tutorId: string) {
  return prisma.jobApplication.findMany({
    where: { tutorId },
    include: {
      job: {
        include: {
          guardian: {
            select: { id: true, name: true, image: true }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
}

export const jobService = {
  getAllOpenJobs,
  getJobById,
  applyForJob,
  getAppliedJobsByTutor,
  getTutorApplications,
};
