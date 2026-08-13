import { config } from 'dotenv';
config({ path: '.env.local' });
import { and, eq } from 'drizzle-orm';

const data = [
  {
    name: 'Cali',
    city: 'Cali',
    department: 'Valle del Cauca',
    lat: 3.4516,
    lng: -76.5320,
    priorityLevel: 'amarillo' as const,
    estimatedAffected: 0,
    notes: 'Pendiente de actualizar con datos reales de campo',
  },
  {
    name: 'Pereira',
    city: 'Pereira',
    department: 'Risaralda',
    lat: 4.8133,
    lng: -75.6961,
    priorityLevel: 'amarillo' as const,
    estimatedAffected: 0,
    notes: 'Pendiente de actualizar con datos reales de campo',
  },
  {
    name: 'Quibdó',
    city: 'Quibdó',
    department: 'Chocó',
    lat: 5.6923,
    lng: -76.6582,
    priorityLevel: 'amarillo' as const,
    estimatedAffected: 0,
    notes: 'Pendiente de actualizar con datos reales de campo',
  },
  {
    name: 'Manizales',
    city: 'Manizales',
    department: 'Caldas',
    lat: 5.0689,
    lng: -75.5174,
    priorityLevel: 'amarillo' as const,
    estimatedAffected: 0,
    notes: 'Pendiente de actualizar con datos reales de campo',
  },
  {
    name: 'Armenia',
    city: 'Armenia',
    department: 'Quindío',
    lat: 4.5339,
    lng: -75.6811,
    priorityLevel: 'amarillo' as const,
    estimatedAffected: 0,
    notes: 'Pendiente de actualizar con datos reales de campo',
  },
];

async function seed() {
  console.log('Starting seed for populations...');
  const { db } = await import('./index');
  const { populations } = await import('./schema');

  for (const item of data) {
    const existing = await db
      .select()
      .from(populations)
      .where(and(eq(populations.name, item.name), eq(populations.city, item.city)));

    if (existing.length === 0) {
      await db.insert(populations).values(item);
      console.log(`Inserted population: ${item.name}`);
    } else {
      console.log(`Skipped population (already exists): ${item.name}`);
    }
  }
  console.log('Seed finished successfully.');
  process.exit(0);
}

seed().catch((error) => {
  console.error('Seed error:', error);
  process.exit(1);
});
