import { boolean, date, doublePrecision, integer, numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  focusAreas: text('focus_areas').array().notNull(),
  categories: text('categories').array().notNull(),
  description: text('description').notNull(),
  contactPhone: text('contact_phone').notNull(),
  contactWhatsapp: text('contact_whatsapp').notNull(),
  city: text('city').notNull(),
  department: text('department').notNull(),
  lat: doublePrecision('lat'),
  lng: doublePrecision('lng'),
  capacityNotes: text('capacity_notes').notNull(),
  verified: boolean('verified').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  authProvider: text('auth_provider', { enum: ['google', 'credentials'] }).notNull(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const populations = pgTable('populations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  city: text('city').notNull(),
  department: text('department').notNull(),
  lat: doublePrecision('lat').notNull(),
  lng: doublePrecision('lng').notNull(),
  priorityLevel: text('priority_level', { enum: ['rojo', 'amarillo', 'verde'] }).notNull(),
  estimatedAffected: integer('estimated_affected').notNull(),
  notes: text('notes').notNull(),
});

export const needs = pgTable('needs', {
  id: uuid('id').primaryKey().defaultRandom(),
  populationId: uuid('population_id').notNull().references(() => populations.id),
  category: text('category').notNull(),
  description: text('description').notNull(),
  quantityNeeded: numeric('quantity_needed').notNull(),
  unit: text('unit').notNull(),
  urgency: text('urgency', { enum: ['alta', 'media', 'baja'] }).notNull(),
  status: text('status', { enum: ['abierta', 'parcial', 'cubierta'] }).notNull(),
  reportedByOrgId: uuid('reported_by_org_id').references(() => organizations.id),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const inventory = pgTable('inventory', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  category: text('category').notNull(),
  itemName: text('item_name').notNull(),
  quantity: numeric('quantity').notNull(),
  unit: text('unit').notNull(),
  status: text('status', { enum: ['disponible', 'reservado', 'entregado'] }).notNull(),
  location: text('location').notNull(),
  notes: text('notes').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const volunteers = pgTable('volunteers', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  name: text('name').notNull(),
  contactPhone: text('contact_phone').notNull(),
  skills: text('skills').array().notNull(),
  city: text('city').notNull(),
  availabilityFrom: date('availability_from').notNull(),
  availabilityTo: date('availability_to').notNull(),
  status: text('status', { enum: ['disponible', 'asignado', 'no_disponible'] }).notNull(),
});

export const p2pProfiles = pgTable('p2p_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique().references(() => users.id),
  alias: text('alias').notNull(),
  phone: text('phone').notNull(),
  avatarUrl: text('avatar_url'),
  isBlocked: boolean('is_blocked').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const p2pOffers = pgTable('p2p_offers', {
  id: uuid('id').primaryKey().defaultRandom(),
  donorId: uuid('donor_id').notNull().references(() => users.id),
  category: text('category').notNull(),
  description: text('description').notNull(),
  availability: text('availability').notNull(),
  city: text('city').notNull(),
  zone: text('zone'),
  photoUrl: text('photo_url'),
  status: text('status', { enum: ['activa', 'pausada', 'completada', 'bloqueada'] }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const p2pRequests = pgTable('p2p_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  offerId: uuid('offer_id').notNull().references(() => p2pOffers.id),
  requesterId: uuid('requester_id').notNull().references(() => users.id),
  message: text('message'),
  status: text('status', { enum: ['pendiente', 'aceptada', 'rechazada', 'atendida'] }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const p2pReports = pgTable('p2p_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  reporterId: uuid('reporter_id').notNull().references(() => users.id),
  targetType: text('target_type').notNull(), // 'offer' or 'profile'
  targetId: uuid('target_id').notNull(),
  reason: text('reason').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
