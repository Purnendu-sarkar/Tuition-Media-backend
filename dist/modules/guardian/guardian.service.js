import { prisma } from "../../lib/prisma.js";
import { aiService } from "../ai/ai.service.js";
async function getDashboardStats(guardianId) {
    // Ensure the user exists and is a guardian
    const user = await prisma.user.findUnique({
        where: { id: guardianId },
    });
    if (!user || user.role !== "GUARDIAN") {
        throw new Error("Guardian not found");
    }
    // Get total posted jobs
    const totalPostedJobs = await prisma.job.count({
        where: { guardianId },
    });
    // Get active jobs (OPEN or IN_PROGRESS)
    const activeJobs = await prisma.job.count({
        where: {
            guardianId,
            status: {
                in: ["OPEN", "IN_PROGRESS"],
            },
        },
    });
    // Get total applicants across all jobs
    const totalApplicants = await prisma.jobApplication.count({
        where: {
            job: {
                guardianId,
            },
        },
    });
    // Get recent jobs with applicant count
    const recentJobs = await prisma.job.findMany({
        where: { guardianId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
            _count: {
                select: { applications: true },
            },
        },
    });
    return {
        stats: {
            totalPostedJobs,
            activeJobs,
            totalApplicants,
        },
        recentJobs: recentJobs.map(job => ({
            id: job.id,
            title: job.title,
            budget: job.budget,
            status: job.status,
            applicantsCount: job._count.applications,
            createdAt: job.createdAt,
        })),
    };
}
async function createJob(guardianId, payload) {
    const job = await prisma.job.create({
        data: {
            guardianId,
            title: payload.title,
            description: payload.description,
            budget: payload.budget,
            location: payload.location,
        },
    });
    return job;
}
async function getJobApplications(guardianId, jobId) {
    // Verify job belongs to guardian
    const job = await prisma.job.findUnique({
        where: { id: jobId },
    });
    if (!job || job.guardianId !== guardianId) {
        throw new Error("Job not found or unauthorized");
    }
    const applications = await prisma.jobApplication.findMany({
        where: { jobId },
        include: {
            tutor: {
                select: {
                    name: true,
                    image: true,
                    tutorProfile: {
                        select: {
                            bio: true,
                            hourlyRate: true,
                            location: true,
                            subjects: true,
                        },
                    },
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });
    const applicationsWithScore = applications.map(app => {
        const matchScore = aiService.calculateMatchScore({ title: job.title, description: job.description, budget: job.budget }, {
            bio: app.tutor.tutorProfile?.bio,
            subjects: app.tutor.tutorProfile?.subjects,
            hourlyRate: app.tutor.tutorProfile?.hourlyRate
        });
        return {
            ...app,
            matchScore
        };
    });
    return applicationsWithScore;
}
async function updateApplicationStatus(guardianId, applicationId, data) {
    // First get the application and its related job
    const application = await prisma.jobApplication.findUnique({
        where: { id: applicationId },
        include: { job: true },
    });
    if (!application) {
        throw new Error("Application not found");
    }
    // Verify the guardian owns the job
    if (application.job.guardianId !== guardianId) {
        throw new Error("Unauthorized to update this application");
    }
    // Update application status
    const updatedApplication = await prisma.jobApplication.update({
        where: { id: applicationId },
        data: { status: data.status },
    });
    // Optional: If ACCEPTED, you might want to change the job status to IN_PROGRESS
    if (data.status === "ACCEPTED" && application.job.status === "OPEN") {
        await prisma.job.update({
            where: { id: application.jobId },
            data: { status: "IN_PROGRESS" },
        });
    }
    return updatedApplication;
}
export const guardianService = {
    getDashboardStats,
    createJob,
    getJobApplications,
    updateApplicationStatus,
};
