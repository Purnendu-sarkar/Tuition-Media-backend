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
    // Calculate profile completeness
    const profile = user.tutorProfile;
    const missingSteps = [];
    let completenessScore = 0;
    if (user.image)
        completenessScore += 20;
    else
        missingSteps.push("Upload a profile photo");
    if (profile?.bio)
        completenessScore += 20;
    else
        missingSteps.push("Add a professional bio");
    if (profile?.subjects && profile.subjects.length > 0)
        completenessScore += 20;
    else
        missingSteps.push("List your expert subjects");
    if (profile?.location)
        completenessScore += 20;
    else
        missingSteps.push("Set your teaching location");
    if (profile?.hourlyRate)
        completenessScore += 20;
    else
        missingSteps.push("Set your hourly rate");
    return {
        stats: {
            activeApplications: activeApplicationsCount,
            profileViews: profile?.profileViews || 0,
            totalEarnings: profile?.totalEarnings || 0,
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
            isProfileComplete: completenessScore === 100,
            completenessScore,
            missingSteps,
        }
    };
}
async function getProfile(tutorId) {
    const user = await prisma.user.findUnique({
        where: { id: tutorId },
        include: { tutorProfile: true },
    });
    if (!user)
        throw new Error("User not found");
    return {
        name: user.name,
        email: user.email,
        image: user.image,
        phone: user.phone,
        ...user.tutorProfile,
    };
}
async function updateProfile(tutorId, data) {
    const { name, image, phone, ...profileData } = data;
    // Filter out read-only or internal fields from profileData
    const cleanProfileData = {};
    if (profileData.bio !== undefined)
        cleanProfileData.bio = profileData.bio;
    if (profileData.subjects !== undefined)
        cleanProfileData.subjects = profileData.subjects;
    if (profileData.location !== undefined)
        cleanProfileData.location = profileData.location;
    if (profileData.hourlyRate !== undefined)
        cleanProfileData.hourlyRate = Number(profileData.hourlyRate);
    // Update User table
    const userData = {};
    if (name)
        userData.name = name;
    if (image)
        userData.image = image;
    if (phone)
        userData.phone = phone;
    if (Object.keys(userData).length > 0) {
        await prisma.user.update({
            where: { id: tutorId },
            data: userData,
        });
    }
    // Upsert TutorProfile
    const profile = await prisma.tutorProfile.upsert({
        where: { userId: tutorId },
        create: {
            userId: tutorId,
            ...cleanProfileData,
        },
        update: {
            ...cleanProfileData,
        },
    });
    return profile;
}
export const tutorService = {
    getDashboardStats,
    getProfile,
    updateProfile,
};
