import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanup() {
  console.log('🧹 Nettoyage des données de test...')

  // 1. Supprimer les messages
  await prisma.message.deleteMany()
  console.log('✅ Messages supprimés')

  // 2. Supprimer les notifications
  await prisma.notification.deleteMany()
  console.log('✅ Notifications supprimées')

  // 3. Supprimer les rendez-vous
  await prisma.rendezVous.deleteMany()
  console.log('✅ Rendez-vous supprimés')

  // 4. Supprimer les documents
  await prisma.document.deleteMany()
  console.log('✅ Documents supprimés')

  // 5. Supprimer les paiements
  await prisma.paiement.deleteMany()
  console.log('✅ Paiements supprimés')

  // 6. Supprimer les factures
  await prisma.facture.deleteMany()
  console.log('✅ Factures supprimées')

  // 7. Supprimer les dossiers
  await prisma.dossier.deleteMany()
  console.log('✅ Dossiers supprimés')

  // 8. Supprimer les clients
  await prisma.client.deleteMany()
  console.log('✅ Clients supprimés')

  // 9. Supprimer les conversations
  await prisma.conversationParticipant.deleteMany()
  await prisma.conversation.deleteMany()
  console.log('✅ Conversations supprimées')

  // 10. Supprimer les utilisateurs (sauf garder un admin)
  await prisma.user.deleteMany({
    where: {
      email: {
        not: 'admin@elminassa.dz'
      }
    }
  })
  console.log('✅ Utilisateurs de test supprimés (admin conservé)')

  console.log('🎉 Nettoyage terminé !')
}

cleanup()
  .catch(console.error)
  .finally(() => prisma.$disconnect())