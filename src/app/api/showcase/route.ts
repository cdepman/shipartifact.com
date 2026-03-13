import { NextResponse } from "next/server";
import { getShowcasedSites } from "@/lib/db/queries";
import { SITES_DOMAIN } from "@/lib/constants";

export async function GET() {
  const showcased = await getShowcasedSites();

  const sites = showcased.map((site) => ({
    slug: site.slug,
    title: site.title,
    description: site.description,
    artifactType: site.artifactType,
    usesAi: site.usesAi,
    url: `https://${site.slug}.${SITES_DOMAIN}`,
    updatedAt: site.updatedAt,
  }));

  return NextResponse.json({ sites });
}
