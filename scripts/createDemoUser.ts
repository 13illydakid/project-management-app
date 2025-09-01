import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function createDemoUser() {
  const email = "demo@demo.com";
  const password = "demo123";
  const name = "Demo User";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    await prisma.user.create({
      data: { email, password, name },
    });
  }
}

createDemoUser().then(() => {
  console.log("Demo user created (demo@demo.com / demo123)");
  process.exit(0);
});
