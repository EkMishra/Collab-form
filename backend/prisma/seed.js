
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
 
  await prisma.formField.deleteMany();
  await prisma.formResponse.deleteMany();
  await prisma.form.deleteMany();
  await prisma.user.deleteMany();

  
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      role: 'admin',
    },
  });

  
  const form = await prisma.form.create({
    data: {
      title: 'Collaborative Feedback Form',
      createdById: admin.id,
      inviteCode: uuidv4().slice(0, 6),
    },
  });

  
  const fields = await prisma.formField.createMany({
    data: [
      {
        label: 'Name',
        fieldType: 'text',
        order: 1,
        formId: form.id,
      },
      {
        label: 'Rating (1-5)',
        fieldType: 'number',
        order: 2,
        formId: form.id,
      },
      {
        label: 'Suggestions',
        fieldType: 'text',
        order: 3,
        formId: form.id,
      },
    ],
  });

  
  await prisma.formResponse.create({
    data: {
      formId: form.id,
      responses: {},
    },
  });

  
  await prisma.user.createMany({
    data: [
      { name: 'Alice', role: 'user' },
      { name: 'Bob', role: 'user' },
    ],
  });

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
