import { pgTable, serial, varchar, boolean, text, timestamp } from 'drizzle-orm/pg-core';

export const bookings = pgTable('bookings', {
	id: serial('id').primaryKey(),
	service: varchar('service', { length: 120 }).notNull(),
	name: varchar('name', { length: 255 }).notNull(),
	email: varchar('email', { length: 255 }).notNull(),
	phone: varchar('phone', { length: 60 }),
	preferredDate: varchar('preferred_date', { length: 40 }),
	preferredTime: varchar('preferred_time', { length: 40 }),
	message: text('message'),
	status: varchar('status', { length: 20 }).notNull().default('new'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

export const contacts = pgTable('contacts', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	email: varchar('email', { length: 255 }).notNull(),
	phone: varchar('phone', { length: 60 }),
	message: text('message').notNull(),
	handled: boolean('handled').notNull().default(false),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

export const adminSessions = pgTable('admin_sessions', {
	id: varchar('id', { length: 64 }).primaryKey(),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

export type Booking = typeof bookings.$inferSelect;
export type Contact = typeof contacts.$inferSelect;
