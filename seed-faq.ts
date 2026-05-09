import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.fAQ.createMany({
    data: [
      {
        question: "How do I verify my account?",
        answer: "Go to your profile settings and click on 'Verify Account'. You will need to upload your ID and take a live face scan.",
        category: "Verification"
      },
      {
        question: "How do I apply for a tuition job?",
        answer: "Navigate to the 'Jobs' tab, search for a job that matches your skills, and click 'Apply'. You can add a cover letter to increase your chances.",
        category: "Jobs"
      },
      {
        question: "What happens if I get reported?",
        answer: "Our safety team will review the report. If you are found violating our guidelines, your account may be temporarily suspended or permanently banned.",
        category: "Safety"
      }
    ]
  });
  console.log("Seeded FAQs successfully!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
