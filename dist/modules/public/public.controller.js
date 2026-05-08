import { StatusCodes } from "http-status-codes";
import { prisma } from "../../lib/prisma.js";
async function getTutors(req, res, next) {
    try {
        const { subject, location, minRate, maxRate, query, page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);
        const where = {
            role: "TUTOR",
            tutorProfile: {
                isNot: null,
            },
        };
        if (subject) {
            where.tutorProfile.subjects = {
                has: subject,
            };
        }
        if (location) {
            where.tutorProfile.location = {
                contains: location,
                mode: "insensitive",
            };
        }
        if (minRate || maxRate) {
            where.tutorProfile.hourlyRate = {};
            if (minRate)
                where.tutorProfile.hourlyRate.gte = Number(minRate);
            if (maxRate)
                where.tutorProfile.hourlyRate.lte = Number(maxRate);
        }
        if (query) {
            where.OR = [
                { name: { contains: query, mode: "insensitive" } },
                { tutorProfile: { bio: { contains: query, mode: "insensitive" } } },
            ];
        }
        const [tutors, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    image: true,
                    role: true,
                    isVerified: true,
                    tutorProfile: {
                        select: {
                            bio: true,
                            subjects: true,
                            location: true,
                            hourlyRate: true,
                            profileViews: true,
                        },
                    },
                    reviewsReceived: {
                        select: {
                            rating: true,
                        },
                    },
                },
                skip,
                take,
                orderBy: {
                    createdAt: "desc",
                },
            }),
            prisma.user.count({ where }),
        ]);
        const tutorsWithRating = tutors.map((tutor) => {
            const avgRating = tutor.reviewsReceived.length > 0
                ? tutor.reviewsReceived.reduce((acc, curr) => acc + curr.rating, 0) / tutor.reviewsReceived.length
                : 0;
            return {
                ...tutor,
                averageRating: Number(avgRating.toFixed(1)),
                totalReviews: tutor.reviewsReceived.length,
            };
        });
        res.status(StatusCodes.OK).json({
            tutors: tutorsWithRating,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        next(error);
    }
}
async function getTutorById(req, res, next) {
    try {
        const { id } = req.params;
        const tutorId = id;
        const tutor = await prisma.user.findUnique({
            where: { id: tutorId },
            select: {
                id: true,
                name: true,
                image: true,
                role: true,
                isVerified: true,
                createdAt: true,
                tutorProfile: {
                    select: {
                        bio: true,
                        subjects: true,
                        location: true,
                        hourlyRate: true,
                    },
                },
                reviewsReceived: {
                    include: {
                        reviewer: {
                            select: {
                                name: true,
                                image: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                },
            },
        });
        if (!tutor || tutor.role !== "TUTOR") {
            res.status(StatusCodes.NOT_FOUND).json({ message: "Tutor not found" });
            return;
        }
        // Increment profile views
        await prisma.tutorProfile.update({
            where: { userId: tutorId },
            data: { profileViews: { increment: 1 } },
        });
        const avgRating = tutor.reviewsReceived.length > 0
            ? tutor.reviewsReceived.reduce((acc, curr) => acc + curr.rating, 0) / tutor.reviewsReceived.length
            : 0;
        res.status(StatusCodes.OK).json({
            ...tutor,
            averageRating: Number(avgRating.toFixed(1)),
            totalReviews: tutor.reviewsReceived.length,
        });
    }
    catch (error) {
        next(error);
    }
}
async function getJobs(req, res, next) {
    try {
        const { query, location, minBudget, maxBudget, page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);
        const where = {
            status: "OPEN",
        };
        if (location) {
            where.location = {
                contains: location,
                mode: "insensitive",
            };
        }
        if (minBudget || maxBudget) {
            where.budget = {};
            if (minBudget)
                where.budget.gte = Number(minBudget);
            if (maxBudget)
                where.budget.lte = Number(maxBudget);
        }
        if (query) {
            where.OR = [
                { title: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
            ];
        }
        const [jobs, total] = await Promise.all([
            prisma.job.findMany({
                where,
                include: {
                    guardian: {
                        select: {
                            name: true,
                            image: true,
                            isVerified: true,
                        },
                    },
                    _count: {
                        select: { applications: true },
                    },
                },
                skip,
                take,
                orderBy: {
                    createdAt: "desc",
                },
            }),
            prisma.job.count({ where }),
        ]);
        res.status(StatusCodes.OK).json({
            jobs,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        next(error);
    }
}
export const publicController = {
    getTutors,
    getTutorById,
    getJobs,
};
