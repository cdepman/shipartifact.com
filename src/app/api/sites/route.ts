import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSitesByUserId } from "@/lib/db/queries";
import { SITES_DOMAIN } from "@/lib/constants";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userSites = await getSitesByUserId(userId);

  const sitesWithUrls = userSites.map((site) => ({
    id: site.id,
    slug: site.slug,
    title: site.title,
    description: site.description,
    artifactType: site.artifactType,
    currentVersion: site.currentVersion,
    showcased: site.showcased,
    url: `https://${site.slug}.${SITES_DOMAIN}`,
    createdAt: site.createdAt,
    updatedAt: site.updatedAt,
  }));

  return NextResponse.json({ sites: sitesWithUrls });
}
