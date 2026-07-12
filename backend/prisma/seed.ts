import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ALL_ROLES: Role[] = ['ADMIN', 'MANAGER', 'DISPATCHER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'];

async function main() {
  console.log('🌱 Seeding database...');

  // Create permissions for each role
  const permissionMatrix: Record<string, string[]> = {
    ADMIN: ['VEHICLE_READ','VEHICLE_WRITE','VEHICLE_DELETE','DRIVER_READ','DRIVER_WRITE','DRIVER_DELETE','TRIP_READ','TRIP_WRITE','TRIP_DELETE','FUEL_READ','FUEL_WRITE','MAINTENANCE_READ','MAINTENANCE_WRITE','EXPENSE_READ','EXPENSE_WRITE','REPORT_READ','SETTINGS_READ','SETTINGS_WRITE','USER_READ','USER_WRITE'],
    MANAGER: ['VEHICLE_READ','VEHICLE_WRITE','DRIVER_READ','DRIVER_WRITE','TRIP_READ','TRIP_WRITE','FUEL_READ','FUEL_WRITE','MAINTENANCE_READ','MAINTENANCE_WRITE','EXPENSE_READ','EXPENSE_WRITE','REPORT_READ','SETTINGS_READ'],
    DISPATCHER: ['VEHICLE_READ','DRIVER_READ','TRIP_READ','TRIP_WRITE','FUEL_READ','MAINTENANCE_READ'],
    DRIVER: ['VEHICLE_READ','DRIVER_READ','TRIP_READ'],
    SAFETY_OFFICER: ['VEHICLE_READ','DRIVER_READ','DRIVER_WRITE','TRIP_READ','MAINTENANCE_READ','MAINTENANCE_WRITE','REPORT_READ'],
    FINANCIAL_ANALYST: ['VEHICLE_READ','DRIVER_READ','TRIP_READ','FUEL_READ','EXPENSE_READ','REPORT_READ'],
  };

  for (const role of ALL_ROLES) {
    for (const permission of permissionMatrix[role] || []) {
      await prisma.rolePermission.upsert({
        where: { role_permission: { role, permission: permission as any } },
        update: {},
        create: { role, permission: permission as any },
      });
    }
  }
  console.log('   ✓ Role permissions seeded');

  // Create users
  const users = [
    { email: 'admin@transitops.com', password: 'admin123', name: 'Admin User', role: 'ADMIN' as Role },
    { email: 'manager@transitops.com', password: 'manager123', name: 'Manager User', role: 'MANAGER' as Role },
    { email: 'dispatcher@transitops.com', password: 'dispatch123', name: 'Dispatcher User', role: 'DISPATCHER' as Role },
    { email: 'driver@transitops.com', password: 'driver123', name: 'John Driver', role: 'DRIVER' as Role },
    { email: 'safety@transitops.com', password: 'safety123', name: 'Safety Officer', role: 'SAFETY_OFFICER' as Role },
    { email: 'finance@transitops.com', password: 'finance123', name: 'Financial Analyst', role: 'FINANCIAL_ANALYST' as Role },
  ];

  for (const u of users) {
    const hashedPassword = await bcrypt.hash(u.password, 12);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { email: u.email, password: hashedPassword, name: u.name, role: u.role },
    });
  }
  console.log('   ✓ 6 users created (admin, manager, dispatcher, driver, safety, finance)');

  // Create vehicles with mileage and region
  const vehicles = [
    { plateNumber: 'ABC-1234', make: 'Volvo', model: 'FH16', year: 2022, capacity: 25000, type: 'Truck', fuelType: 'DIESEL', mileage: 45000, region: 'North' },
    { plateNumber: 'DEF-5678', make: 'Scania', model: 'R500', year: 2023, capacity: 22000, type: 'Truck', fuelType: 'DIESEL', mileage: 28000, region: 'South' },
    { plateNumber: 'GHI-9012', make: 'Mercedes-Benz', model: 'Actros', year: 2021, capacity: 24000, type: 'Truck', fuelType: 'DIESEL', mileage: 62000, region: 'East' },
    { plateNumber: 'JKL-3456', make: 'MAN', model: 'TGX', year: 2023, capacity: 26000, type: 'Trailer', fuelType: 'DIESEL', mileage: 15000, region: 'West' },
    { plateNumber: 'MNO-7890', make: 'DAF', model: 'XF', year: 2022, capacity: 20000, type: 'Truck', fuelType: 'DIESEL', mileage: 51000, region: 'North' },
  ];

  for (const v of vehicles) {
    await prisma.vehicle.upsert({
      where: { plateNumber: v.plateNumber },
      update: {},
      create: v,
    });
  }
  console.log(`   ✓ ${vehicles.length} vehicles created with mileage & region`);

  // Create drivers with experience and safety scores
  const drivers = [
    { licenseNumber: 'DL-1001', firstName: 'John', lastName: 'Doe', email: 'john.doe@email.com', phone: '+1-555-0101', experience: 8, safetyScore: 85 },
    { licenseNumber: 'DL-1002', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@email.com', phone: '+1-555-0102', experience: 5, safetyScore: 78 },
    { licenseNumber: 'DL-1003', firstName: 'Carlos', lastName: 'Garcia', email: 'carlos.garcia@email.com', phone: '+1-555-0103', experience: 12, safetyScore: 92 },
    { licenseNumber: 'DL-1004', firstName: 'Anna', lastName: 'Johnson', email: 'anna.johnson@email.com', phone: '+1-555-0104', experience: 3, safetyScore: 72 },
  ];

  for (const d of drivers) {
    await prisma.driver.upsert({
      where: { licenseNumber: d.licenseNumber },
      update: {},
      create: d,
    });
  }
  console.log(`   ✓ ${drivers.length} drivers created with safety scores`);

  console.log('\n✅ Seeding complete!');
  console.log('\n📋 Demo Credentials:');
  console.log('   Admin:      admin@transitops.com / admin123');
  console.log('   Manager:    manager@transitops.com / manager123');
  console.log('   Dispatcher: dispatcher@transitops.com / dispatch123');
  console.log('   Driver:     driver@transitops.com / driver123');
  console.log('   Safety:     safety@transitops.com / safety123');
  console.log('   Finance:    finance@transitops.com / finance123');
}

main()
  .catch((e) => { console.error('❌ Seed error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
