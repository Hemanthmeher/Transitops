import { PrismaClient, Role, VehicleStatus, DriverStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@transitops.com' },
    update: {},
    create: {
      email: 'admin@transitops.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });
  console.log(`   ✓ Admin user: admin@transitops.com / admin123`);

  // Create manager
  const managerPassword = await bcrypt.hash('manager123', 12);
  await prisma.user.upsert({
    where: { email: 'manager@transitops.com' },
    update: {},
    create: {
      email: 'manager@transitops.com',
      password: managerPassword,
      name: 'Manager User',
      role: 'MANAGER',
    },
  });
  console.log(`   ✓ Manager user: manager@transitops.com / manager123`);

  // Create dispatcher
  const dispatcherPassword = await bcrypt.hash('dispatch123', 12);
  await prisma.user.upsert({
    where: { email: 'dispatcher@transitops.com' },
    update: {},
    create: {
      email: 'dispatcher@transitops.com',
      password: dispatcherPassword,
      name: 'Dispatcher User',
      role: 'DISPATCHER',
    },
  });
  console.log(`   ✓ Dispatcher user: dispatcher@transitops.com / dispatch123`);

  // Create vehicles
  const vehicles = [
    { plateNumber: 'ABC-1234', make: 'Volvo', model: 'FH16', year: 2022, capacity: 25000 },
    { plateNumber: 'DEF-5678', make: 'Scania', model: 'R500', year: 2023, capacity: 22000 },
    { plateNumber: 'GHI-9012', make: 'Mercedes-Benz', model: 'Actros', year: 2021, capacity: 24000 },
    { plateNumber: 'JKL-3456', make: 'MAN', model: 'TGX', year: 2023, capacity: 26000 },
    { plateNumber: 'MNO-7890', make: 'DAF', model: 'XF', year: 2022, capacity: 20000 },
  ];

  for (const v of vehicles) {
    await prisma.vehicle.upsert({
      where: { plateNumber: v.plateNumber },
      update: {},
      create: v,
    });
  }
  console.log(`   ✓ ${vehicles.length} vehicles created`);

  // Create drivers
  const drivers = [
    { licenseNumber: 'DL-1001', firstName: 'John', lastName: 'Doe', email: 'john.doe@email.com', phone: '+1-555-0101' },
    { licenseNumber: 'DL-1002', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@email.com', phone: '+1-555-0102' },
    { licenseNumber: 'DL-1003', firstName: 'Carlos', lastName: 'Garcia', email: 'carlos.garcia@email.com', phone: '+1-555-0103' },
    { licenseNumber: 'DL-1004', firstName: 'Anna', lastName: 'Johnson', email: 'anna.johnson@email.com', phone: '+1-555-0104' },
  ];

  for (const d of drivers) {
    await prisma.driver.upsert({
      where: { licenseNumber: d.licenseNumber },
      update: {},
      create: d,
    });
  }
  console.log(`   ✓ ${drivers.length} drivers created`);

  console.log('\n✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
