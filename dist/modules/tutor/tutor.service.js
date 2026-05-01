import { prisma } from "../../lib/prisma.js";
async function getDashboardStats(tutorId) {
    // Ensure the user exists and is a tutor
    const user = await prisma.user.findUnique({
        where: { id: tutorId },
        include: { tutorProfile: true },
    });
    if (!user || user.role !== "TUTOR") {
        throw new Error("Tutor not found");
    }
    // Get active applications count (PENDING or ACCEPTED)
    const activeApplicationsCount = await prisma.jobApplication.count({
        where: {
            tutorId,
            status: {
                in: ["PENDING", "ACCEPTED"],
            },
        },
    });
    // Get recent applications
    const recentApplications = await prisma.jobApplication.findMany({
        where: { tutorId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
            job: {
                select: {
                    title: true,
                    budget: true,
                    status: true,
                },
            },
        },
    });
    // Get average rating
    const reviews = await prisma.review.findMany({
        where: { revieweeId: tutorId },
        select: { rating: true },
    });
    const averageRating = reviews.length > 0
        ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length
        : 0;
    return {
        stats: {
            activeApplications: activeApplicationsCount,
            profileViews: user.tutorProfile?.profileViews || 0,
            totalEarnings: user.tutorProfile?.totalEarnings || 0,
            averageRating: Number(averageRating.toFixed(1)),
        },
        recentApplications: recentApplications.map(app => ({
            id: app.id,
            jobTitle: app.job.title,
            budget: app.job.budget,
            status: app.status,
            appliedAt: app.createdAt,
        })),
        profileStatus: {
            isVerified: user.isVerified,
            isProfileComplete: !!user.tutorProfile,
        }
    };
}
export const tutorService = {
    getDashboardStats,
};
