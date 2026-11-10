require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const adminPass = await bcrypt.hash("Admin@123", 10);
  const userPass = await bcrypt.hash("User@123", 10);

  // upsert = create if missing, so you can run the seed many times safely
  await prisma.user.upsert({
    where: { email: "admin@bus.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@bus.com",
      phone: "01700000000",
      password: adminPass,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "user@bus.com" },
    update: {},
    create: {
      name: "Test User",
      email: "user@bus.com",
      phone: "01800000000",
      password: userPass,
      role: "USER",
    },
  });

  console.log("Seed done: admin@bus.com / Admin@123 and user@bus.com / User@123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
