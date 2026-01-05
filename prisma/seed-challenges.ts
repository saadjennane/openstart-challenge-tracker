import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const challenges = [
  {
    name: "Contrôle intelligent des documents d'affacturage via IA",
    wenov_responsible: '',
    entity: '',
    startup_name: '',
    status: 'ongoing',
  },
  {
    name: "Modèle IA pour anticiper les difficultés financières des clients",
    wenov_responsible: '',
    entity: '',
    startup_name: '',
    status: 'ongoing',
  },
  {
    name: "Prévention du churn crédit : prédiction des remboursements anticipés",
    wenov_responsible: '',
    entity: '',
    startup_name: '',
    status: 'ongoing',
  },
  {
    name: "Expert Data Augmenté : Traduction des requêtes métiers en SQL",
    wenov_responsible: '',
    entity: '',
    startup_name: '',
    status: 'ongoing',
  },
  {
    name: "Assessment augmenté des compétences via IA et gamification",
    wenov_responsible: '',
    entity: '',
    startup_name: '',
    status: 'ongoing',
  },
  {
    name: "Cartographie intelligente des actifs IT & détection du Shadow IT",
    wenov_responsible: '',
    entity: '',
    startup_name: '',
    status: 'ongoing',
  },
  {
    name: "Lutte antifraude sur cartes prépayées",
    wenov_responsible: '',
    entity: '',
    startup_name: '',
    status: 'ongoing',
  },
  {
    name: "Voicebot / Chatbot intelligent pour la gestion des demandes clients",
    wenov_responsible: '',
    entity: '',
    startup_name: '',
    status: 'ongoing',
  },
  {
    name: "Rhalia – Agent IA de coaching bien-être physique, mental et digital",
    wenov_responsible: '',
    entity: '',
    startup_name: '',
    status: 'ongoing',
  },
  {
    name: "SatisfAI – outil de mesure émotionnel et personnalisé de la satisfaction client",
    wenov_responsible: '',
    entity: '',
    startup_name: '',
    status: 'ongoing',
  },
  {
    name: "Agent RH Augmenté : réponses automatisées aux requêtes collaborateurs via LLM",
    wenov_responsible: '',
    entity: '',
    startup_name: '',
    status: 'ongoing',
  },
];

async function main() {
  console.log('Adding 11 challenges...');

  for (const challenge of challenges) {
    await prisma.challenge.create({
      data: challenge,
    });
    console.log(`Created: ${challenge.name.substring(0, 50)}...`);
  }

  console.log('\nAll 11 challenges have been added!');
  console.log('You can now edit them via the app or Prisma Studio (npm run db:studio)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
