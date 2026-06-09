import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const results = {
    totalUsers: await prisma.user.count(),
    adminExists: await prisma.user.count({ where: { email: 'admin@elminassa.dz' } }),
    otherUsers: await prisma.user.count({ where: { email: { not: 'admin@elminassa.dz' } } }),
    plans: await prisma.plan.count(),
    wilayas: await prisma.wilaya.count(),
    clients: await prisma.client.count(),
    dossiers: await prisma.dossier.count(),
    notifications: await prisma.notification.count(),
    messages: await prisma.message.count(),
    rendezVous: await prisma.rendezVous.count(),
    documents: await prisma.document.count(),
    factures: await prisma.facture.count(),
    subscriptions: await prisma.subscription.count(),
  };

  console.log(JSON.stringify(results, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
