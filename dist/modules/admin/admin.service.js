import { prisma } from "../../lib/prisma.js";
async function getPlatformStats() {
    const [totalUsers, totalTutors, totalGuardians, activeJobs, pendingVerifications,] = await Promise.all([
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
async function getAllUsers(role) {
    const where = {};
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
async function deleteUser(userId) {
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
async function deleteJob(jobId) {
    return prisma.job.delete({
        where: { id: jobId },
    });
}
// Reports & Support
async function getAllReports() {
    return prisma.report.findMany({
        include: {
            reporter: { select: { id: true, name: true, email: true, role: true } },
            reported: { select: { id: true, name: true, email: true, role: true } }
        },
        orderBy: { createdAt: "desc" },
    });
}
async function updateReportStatus(reportId, status) {
    return prisma.report.update({
        where: { id: reportId },
        data: { status }
    });
}
async function getAllTickets() {
    return prisma.supportTicket.findMany({
        include: {
            user: { select: { id: true, name: true, email: true } },
            messages: { orderBy: { createdAt: "asc" } }
        },
        orderBy: { updatedAt: "desc" },
    });
}
async function updateTicketStatus(ticketId, status) {
    return prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status }
    });
}
async function addTicketMessage(ticketId, adminId, content) {
    return prisma.ticketMessage.create({
        data: {
            ticketId,
            senderId: adminId,
            content,
            isAdmin: true
        }
    });
}
export const adminService = {
    getPlatformStats,
    getAllUsers,
    deleteUser,
    getAllJobs,
    deleteJob,
    getAllReports,
    updateReportStatus,
    getAllTickets,
    updateTicketStatus,
    addTicketMessage
};
