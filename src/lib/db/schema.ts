import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
} from "drizzle-orm/pg-core";

export const sites = pgTable("sites", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  sourceCode: text("source_code").notNull(),
  artifactType: text("artifact_type").notNull(), // 'jsx' | 'html'
  currentVersion: integer("current_version").notNull().default(1),
  isPublished: boolean("is_published").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const deployments = pgTable("deployments", {
  id: uuid("id").defaultRandom().primaryKey(),
  siteId: uuid("site_id")
    .notNull()
    .references(() => sites.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  sourceCode: text("source_code").notNull(),
  artifactType: text("artifact_type").notNull(),
  wrappedHtml: text("wrapped_html").notNull(),
  status: text("status").notNull().default("deployed"), // 'deploying' | 'deployed' | 'failed'
  deployedAt: timestamp("deployed_at").defaultNow().notNull(),
});
