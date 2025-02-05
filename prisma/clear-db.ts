const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    // Supprimer dans l'ordre pour respecter les contraintes de clés étrangères
    await prisma.businessHours.deleteMany();
    await prisma.professionalService.deleteMany();
    await prisma.defaultService.deleteMany();
    await prisma.user.deleteMany();

    console.log('✅ Base de données vidée avec succès');
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage de la base de données:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase();
