import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

const SEED_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';
const SEED_EMPLOYEE_PASSWORD = process.env.SEED_EMPLOYEE_PASSWORD || 'Employee@123';
const SEED_USER_PASSWORD = process.env.SEED_USER_PASSWORD || 'User@123';

type GovernmentEntitySeed = {
  name: string;
  contactEmail: string;
  description: string;
  governorate: string;
};

type EmployeeSeed = {
  firstName: string;
  fatherName: string;
  lastName: string;
  email: string;
  governmentContactEmail: string;
};

type UserSeed = {
  name: string;
  email: string;
  phone: string;
};

const governmentEntitiesSeed: GovernmentEntitySeed[] = [
  {
    name: 'Ministry of Interior',
    contactEmail: 'interior@gov.ly',
    description: 'Oversees public security and safety initiatives.',
    governorate: 'Tripoli',
  },
  {
    name: 'Ministry of Health',
    contactEmail: 'health@gov.ly',
    description: 'Responsible for national health services.',
    governorate: 'Benghazi',
  },
];

const employeesSeed: EmployeeSeed[] = [
  {
    firstName: 'Ali',
    fatherName: 'Khaled',
    lastName: 'Sahli',
    email: 'ali.sahli@interior.gov.ly',
    governmentContactEmail: 'interior@gov.ly',
  },
  {
    firstName: 'Mona',
    fatherName: 'Yousef',
    lastName: 'Faraj',
    email: 'mona.faraj@health.gov.ly',
    governmentContactEmail: 'health@gov.ly',
  },
];

const adminsSeed = [
  {
    name: 'System Administrator',
    email: 'admin@complaints.gov.ly',
  },
];

const usersSeed: UserSeed[] = [
  {
    name: 'Abdallah Salem',
    email: 'abdallah@example.com',
    phone: '+218910000001',
  },
  {
    name: 'Sara Khaled',
    email: 'sara@example.com',
    phone: '+218910000002',
  },
];

async function seedGovernmentEntities() {
  const map = new Map<string, number>();

  for (const entity of governmentEntitiesSeed) {
    const upserted = await prisma.governmentEntity.upsert({
      where: { contactEmail: entity.contactEmail },
      update: {
        name: entity.name,
        description: entity.description,
        governorate: entity.governorate,
      },
      create: entity,
    });

    map.set(upserted.contactEmail, upserted.id);
  }

  return map;
}

async function seedAdmins() {
  const hashedPassword = await bcrypt.hash(SEED_ADMIN_PASSWORD, SALT_ROUNDS);

  for (const admin of adminsSeed) {
    await prisma.admin.upsert({
      where: { email: admin.email },
      update: {
        name: admin.name,
        password: hashedPassword,
      },
      create: {
        name: admin.name,
        email: admin.email,
        password: hashedPassword,
      },
    });
  }
}

async function seedEmployees(governmentEntityMap: Map<string, number>) {
  const hashedPassword = await bcrypt.hash(SEED_EMPLOYEE_PASSWORD, SALT_ROUNDS);

  for (const employee of employeesSeed) {
    const governmentEntityId = governmentEntityMap.get(employee.governmentContactEmail);

    if (!governmentEntityId) {
      console.warn(`Skipping ${employee.email}; missing government entity ${employee.governmentContactEmail}`);
      continue;
    }

    await prisma.employee.upsert({
      where: { email: employee.email },
      update: {
        firstName: employee.firstName,
        fatherName: employee.fatherName,
        lastName: employee.lastName,
        governmentEntityId,
        isActive: true,
        password: hashedPassword,
      },
      create: {
        firstName: employee.firstName,
        fatherName: employee.fatherName,
        lastName: employee.lastName,
        email: employee.email,
        password: hashedPassword,
        governmentEntityId,
        isActive: true,
      },
    });
  }
}

async function seedUsers() {
  const hashedPassword = await bcrypt.hash(SEED_USER_PASSWORD, SALT_ROUNDS);

  for (const user of usersSeed) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        phone: user.phone,
        password: hashedPassword,
        isActive: true,
        otpCode: null,
        otpExpiresAt: null,
        otpAttempts: 0,
      },
      create: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        password: hashedPassword,
        isActive: true,
      },
    });
  }
}

async function main() {
  console.log('🌱 Starting seed...');
  const governmentEntityMap = await seedGovernmentEntities();
  await seedAdmins();
  await seedEmployees(governmentEntityMap);
  await seedUsers();
  console.log('✅ Seed completed');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });