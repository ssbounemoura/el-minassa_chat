import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "azhocine@atomicmail.io";
  const user = await prisma.user.update({
    where: { email },
    data: { isActive: true },
  });
  console.log(`User activated: ${user.email} (isActive=${user.isActive})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
