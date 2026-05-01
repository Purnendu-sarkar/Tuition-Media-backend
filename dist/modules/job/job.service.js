import { prisma } from "../../lib/prisma.js";
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
async function getJobById(jobId) {
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
async function applyForJob(tutorId, jobId, data) {
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
export const jobService = {
    getAllOpenJobs,
    getJobById,
    applyForJob,
};
