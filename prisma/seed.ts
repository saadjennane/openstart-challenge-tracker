import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper to get dates relative to today
const daysFromNow = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

// WENOV Responsibles
const WENOV = {
  OTHMANE: 'Othmane As Salih',
  ASMAA: 'Asmaa Ouach',
  RIM: 'Rim Hachidi',
};

// Entities (Metiers)
const ENTITIES = {
  WAFASALAF: 'WafaSalaf',
  WAFACASH: 'Wafa Cash',
  AWB_RH: 'AWB RH',
  AWB_IT: 'AWB IT',
  AFM: 'AFM',
  AWB: 'AWB',
};

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.activity.deleteMany();
  await prisma.action.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const hashedPassword = await bcrypt.hash('123456', 10);
  await prisma.user.create({
    data: {
      email: 'saadjennane@gmail.com',
      password: hashedPassword,
      name: 'Saad Jennane',
      isAdmin: true,
    },
  });
  console.log('Created admin user: saadjennane@gmail.com');

  // Create challenges with related data
  await prisma.challenge.create({
    data: {
      name: 'API Integration Payment Gateway',
      wenov_responsible: WENOV.OTHMANE,
      entity: ENTITIES.WAFASALAF,
      startup_name: 'PayFlow',
      contacts: {
        create: [
          { firstName: 'Othmane', lastName: 'As Salih', function: 'Project Lead', company: 'WENOV', email: 'othmane@wenov.com', phone: '', group: 'WENOV' },
          { firstName: 'Ahmed', lastName: 'Bennani', function: 'Tech Lead', company: 'WafaSalaf', email: 'ahmed@wafasalaf.ma', phone: '', group: 'Metier' },
          { firstName: 'Sarah', lastName: 'Chen', function: 'CEO', company: 'PayFlow', email: 'sarah@payflow.io', phone: '', group: 'Startup' },
        ],
      },
      actions: {
        create: [
          { title: 'Review API documentation', owner: 'AWB', due_date: daysFromNow(-2), is_urgent: true },
          { title: 'Setup test environment', owner: 'STARTUP', due_date: daysFromNow(3) },
          { title: 'Security audit planning', owner: 'AWB', due_date: daysFromNow(7) },
          { title: 'Initial meeting completed', owner: 'AWB', due_date: daysFromNow(-10), is_done: true },
        ],
      },
      activities: {
        create: [
          { type: 'meeting', note: 'Kickoff meeting with PayFlow team. Discussed integration timeline and milestones.' },
          { type: 'email', note: 'Sent technical requirements document to startup.' },
          { type: 'call', note: 'Quick sync call about API versioning concerns.' },
        ],
      },
    },
  });

  await prisma.challenge.create({
    data: {
      name: 'Mobile App Beta Launch',
      wenov_responsible: WENOV.ASMAA,
      entity: ENTITIES.AWB_IT,
      startup_name: 'AppNova',
      contacts: {
        create: [
          { firstName: 'Asmaa', lastName: 'Ouach', function: 'Innovation Manager', company: 'WENOV', email: 'asmaa@wenov.com', phone: '', group: 'WENOV' },
          { firstName: 'Youssef', lastName: 'Alami', function: 'Product Owner', company: 'AWB', email: 'youssef@awb.ma', phone: '', group: 'Metier' },
          { firstName: 'Tom', lastName: 'Wilson', function: 'CTO', company: 'AppNova', email: 'tom@appnova.io', phone: '', group: 'Startup' },
        ],
      },
      actions: {
        create: [
          { title: 'Beta testing coordination', owner: 'STARTUP', due_date: daysFromNow(1), is_urgent: true },
          { title: 'User feedback collection setup', owner: 'AWB', due_date: daysFromNow(5) },
        ],
      },
      activities: {
        create: [
          { type: 'meeting', note: 'Beta launch planning session. Set target date for next month.' },
          { type: 'note', note: 'Internal review: App performance looks good.' },
        ],
      },
    },
  });

  await prisma.challenge.create({
    data: {
      name: 'Data Analytics Dashboard POC',
      wenov_responsible: WENOV.RIM,
      entity: ENTITIES.AFM,
      startup_name: 'DataViz Pro',
      contacts: {
        create: [
          { firstName: 'Rim', lastName: 'Hachidi', function: 'Data Lead', company: 'WENOV', email: 'rim@wenov.com', phone: '', group: 'WENOV' },
          { firstName: 'Karim', lastName: 'Fassi', function: 'Analytics Director', company: 'AFM', email: 'karim@afm.ma', phone: '', group: 'Metier' },
          { firstName: 'Lisa', lastName: 'Park', function: 'Founder', company: 'DataViz Pro', email: 'lisa@dataviz.io', phone: '', group: 'Startup' },
        ],
      },
      actions: {
        create: [
          { title: 'Data source mapping', owner: 'AWB', due_date: daysFromNow(-5) },
          { title: 'Dashboard mockups review', owner: 'STARTUP', due_date: daysFromNow(-1) },
          { title: 'Performance benchmarks', owner: 'AWB', due_date: daysFromNow(10) },
        ],
      },
      activities: {
        create: [
          { type: 'email', note: 'Received updated mockups from DataViz Pro team.' },
        ],
      },
    },
  });

  await prisma.challenge.create({
    data: {
      name: 'Cloud Migration Assessment',
      wenov_responsible: WENOV.OTHMANE,
      entity: ENTITIES.AWB_IT,
      startup_name: 'CloudShift',
      contacts: {
        create: [
          { firstName: 'Othmane', lastName: 'As Salih', function: 'Cloud Architect', company: 'WENOV', email: 'othmane@wenov.com', phone: '', group: 'WENOV' },
          { firstName: 'Hassan', lastName: 'Berrada', function: 'IT Director', company: 'AWB', email: 'hassan@awb.ma', phone: '', group: 'Metier' },
          { firstName: 'James', lastName: 'Lee', function: 'CEO', company: 'CloudShift', email: 'james@cloudshift.io', phone: '', group: 'Startup' },
        ],
      },
      actions: {
        create: [
          { title: 'Infrastructure audit', owner: 'STARTUP', due_date: daysFromNow(2) },
          { title: 'Cost estimation review', owner: 'AWB', due_date: daysFromNow(8) },
        ],
      },
      activities: {
        create: [
          { type: 'meeting', note: 'Initial assessment meeting. Identified key migration priorities.' },
          { type: 'call', note: 'Follow-up on security requirements.' },
        ],
      },
    },
  });

  await prisma.challenge.create({
    data: {
      name: 'Customer Support AI Bot',
      wenov_responsible: WENOV.ASMAA,
      entity: ENTITIES.WAFACASH,
      startup_name: 'BotGenius',
      contacts: {
        create: [
          { firstName: 'Asmaa', lastName: 'Ouach', function: 'AI Lead', company: 'WENOV', email: 'asmaa@wenov.com', phone: '', group: 'WENOV' },
          { firstName: 'Fatima', lastName: 'Zahra', function: 'CS Manager', company: 'Wafa Cash', email: 'fatima@wafacash.ma', phone: '', group: 'Metier' },
          { firstName: 'Amy', lastName: 'Zhang', function: 'Co-founder', company: 'BotGenius', email: 'amy@botgenius.io', phone: '', group: 'Startup' },
        ],
      },
      actions: {
        create: [
          { title: 'Training data preparation', owner: 'AWB', due_date: daysFromNow(-3), is_urgent: true },
          { title: 'Bot personality definition', owner: 'STARTUP', due_date: daysFromNow(0), is_urgent: true },
          { title: 'Integration with CRM', owner: 'STARTUP', due_date: daysFromNow(14) },
          { title: 'Pilot group selection', owner: 'AWB', due_date: daysFromNow(6) },
        ],
      },
      activities: {
        create: [
          { type: 'note', note: 'BotGenius shared demo of their latest NLP improvements.' },
          { type: 'meeting', note: 'Workshop on conversation flows and edge cases.' },
        ],
      },
    },
  });

  await prisma.challenge.create({
    data: {
      name: 'HR Talent Platform Integration',
      wenov_responsible: WENOV.RIM,
      entity: ENTITIES.AWB_RH,
      startup_name: 'TalentMatch AI',
      contacts: {
        create: [
          { firstName: 'Rim', lastName: 'Hachidi', function: 'HR Innovation', company: 'WENOV', email: 'rim@wenov.com', phone: '', group: 'WENOV' },
          { firstName: 'Nadia', lastName: 'Tazi', function: 'HR Director', company: 'AWB', email: 'nadia@awb.ma', phone: '', group: 'Metier' },
          { firstName: 'Julia', lastName: 'Kim', function: 'CTO', company: 'TalentMatch AI', email: 'julia@talentmatch.io', phone: '', group: 'Startup' },
        ],
      },
      actions: {
        create: [
          { title: 'Job description standardization', owner: 'AWB', due_date: daysFromNow(6) },
          { title: 'AI matching algorithm test', owner: 'STARTUP', due_date: daysFromNow(15) },
          { title: 'Privacy compliance check', owner: 'AWB', due_date: daysFromNow(3) },
        ],
      },
      activities: {
        create: [
          { type: 'meeting', note: 'Kickoff meeting with HR team and TalentMatch AI.' },
          { type: 'note', note: 'Received positive feedback from initial demo session.' },
        ],
      },
    },
  });

  console.log('Seeding completed!');
  console.log('Created 6 challenges with actions, activities, and contacts.');
  console.log('WENOV Responsibles: Othmane As Salih, Asmaa Ouach, Rim Hachidi');
  console.log('Entities: WafaSalaf, Wafa Cash, AWB RH, AWB IT, AFM, AWB');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
