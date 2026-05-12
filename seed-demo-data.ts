import { PrismaClient, UserRole, JobStatus, ApplicationStatus, VerificationStatus, ReportStatus, TicketStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seeding...");

  const passwordHash = await bcrypt.hash("password123", 12);

  // --- 1. ADMIN ---
  const admin = await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: {
      email: "admin@demo.com",
      name: "Admin User",
      passwordHash,
      role: UserRole.ADMIN,
      isVerified: true,
      emailVerifiedAt: new Date(),
    },
  });
  console.log("Admin created");

  // --- 2. GUARDIANS ---
  const guardianNames = ["Rahim Uddin", "Sultana Razia", "Karim Ahmed"];
  const guardians = [];
  for (let i = 0; i < guardianNames.length; i++) {
    const email = `guardian${i + 1}@demo.com`;
    const g = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: guardianNames[i],
        passwordHash,
        role: UserRole.GUARDIAN,
        isVerified: true,
        emailVerifiedAt: new Date(),
        phone: `0171100000${i}`,
      },
    });
    guardians.push(g);
  }
  console.log("Guardians created");

  // --- 3. TUTORS ---
  const tutorData = [
    { name: "Arif Hossain", subjects: ["Mathematics", "Physics"], location: "Dhaka", rate: 5000 },
    { name: "Sumi Akter", subjects: ["English", "Bangla"], location: "Chittagong", rate: 4000 },
    { name: "Tanvir Ahmed", subjects: ["Chemistry", "Biology"], location: "Sylhet", rate: 4500 },
    { name: "Nusrat Jahan", subjects: ["Computer Science", "ICT"], location: "Dhaka", rate: 6000 },
  ];

  const tutors = [];
  for (let i = 0; i < tutorData.length; i++) {
    const email = `tutor${i + 1}@demo.com`;
    const t = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: tutorData[i].name,
        passwordHash,
        role: UserRole.TUTOR,
        isVerified: true,
        emailVerifiedAt: new Date(),
        phone: `0181100000${i}`,
        tutorProfile: {
          create: {
            bio: `I am an experienced tutor specialized in ${tutorData[i].subjects.join(", ")}. I have been teaching for 5 years.`,
            subjects: tutorData[i].subjects,
            location: tutorData[i].location,
            hourlyRate: tutorData[i].rate,
          }
        }
      },
    });
    tutors.push(t);
  }
  console.log("Tutors created");

  // --- 4. JOBS ---
  const jobTitles = [
    "Need Math tutor for Class 10",
    "English medium tutor for Grade 5",
    "Physics & Chemistry tutor for HSC",
    "IELTS instructor needed",
  ];

  const jobs = [];
  for (let i = 0; i < jobTitles.length; i++) {
    const job = await prisma.job.create({
      data: {
        title: jobTitles[i],
        description: `Looking for a dedicated tutor for ${jobTitles[i]}. Classes 3 days a week. Time: Afternoon.`,
        budget: 3000 + i * 1000,
        location: "Dhaka",
        guardianId: guardians[i % guardians.length].id,
        status: JobStatus.OPEN,
      }
    });
    jobs.push(job);
  }
  console.log("Jobs created");

  // --- 5. APPLICATIONS ---
  for (let i = 0; i < jobs.length; i++) {
    await prisma.jobApplication.create({
      data: {
        jobId: jobs[i].id,
        tutorId: tutors[i % tutors.length].id,
        coverLetter: "I am interested in this position. I have relevant experience.",
        status: ApplicationStatus.PENDING,
      }
    });
  }
  console.log("Applications created");

  // --- 6. REVIEWS ---
  for (let i = 0; i < 2; i++) {
    await prisma.review.create({
      data: {
        rating: 5,
        comment: "Excellent tutor, very professional.",
        reviewerId: guardians[0].id,
        revieweeId: tutors[0].id,
        jobId: jobs[0].id,
      }
    });
  }
  console.log("Reviews created");

  // --- 7. REPORTS ---
  await prisma.report.create({
    data: {
      reporterId: guardians[1].id,
      reportedId: tutors[1].id,
      reason: "Inappropriate behavior",
      description: "The tutor was late multiple times and was unprofessional during the session.",
      status: ReportStatus.PENDING,
    }
  });
  console.log("Report created");

  // --- 8. SUPPORT TICKETS ---
  await prisma.supportTicket.create({
    data: {
      userId: tutors[2].id,
      subject: "Payment Issue",
      description: "I am having trouble receiving payment from a guardian.",
      status: TicketStatus.OPEN,
      messages: {
        create: {
          senderId: tutors[2].id,
          content: "Please help me resolve this issue.",
          isAdmin: false,
        }
      }
    }
  });
  console.log("Support Ticket created");

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
