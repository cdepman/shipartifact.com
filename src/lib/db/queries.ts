import { eq, desc } from "drizzle-orm";
import { db } from ".";
import { sites, deployments } from "./schema";

export async function getSitesByUserId(userId: string) {
  return db
    .select()
    .from(sites)
    .where(eq(sites.userId, userId))
    .orderBy(desc(sites.updatedAt));
}

export async function getSiteBySlug(slug: string) {
  const results = await db
    .select()
    .from(sites)
    .where(eq(sites.slug, slug))
    .limit(1);
  return results[0] ?? null;
}

export async function isSlugAvailable(slug: string): Promise<boolean> {
  const existing = await getSiteBySlug(slug);
  return existing === null;
}

export async function createSite(data: {
  userId: string;
  slug: string;
  title: string;
  description?: string;
  sourceCode: string;
  artifactType: string;
}) {
  const results = await db.insert(sites).values(data).returning();
  return results[0];
}

export async function updateSite(
  slug: string,
  data: Partial<{
    title: string;
    description: string;
    sourceCode: string;
    artifactType: string;
    currentVersion: number;
    isPublished: boolean;
  }>
) {
  const results = await db
    .update(sites)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(sites.slug, slug))
    .returning();
  return results[0];
}

export async function deleteSite(slug: string) {
  await db.delete(sites).where(eq(sites.slug, slug));
}

export async function createDeployment(data: {
  siteId: string;
  version: number;
  sourceCode: string;
  artifactType: string;
  wrappedHtml: string;
  status?: string;
}) {
  const results = await db.insert(deployments).values(data).returning();
  return results[0];
}

export async function getDeploymentsBySiteId(siteId: string) {
  return db
    .select()
    .from(deployments)
    .where(eq(deployments.siteId, siteId))
    .orderBy(desc(deployments.version));
}
