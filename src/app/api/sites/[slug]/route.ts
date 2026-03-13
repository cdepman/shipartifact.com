import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  getSiteBySlug,
  getDeploymentsBySiteId,
  updateSite,
  deleteSite,
} from "@/lib/db/queries";
import { deleteSiteFromR2 } from "@/lib/cloudflare/r2";
import { SITES_DOMAIN } from "@/lib/constants";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const site = await getSiteBySlug(slug);

  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  if (site.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const deploys = await getDeploymentsBySiteId(site.id);

  return NextResponse.json({
    site: {
      ...site,
      url: `https://${site.slug}.${SITES_DOMAIN}`,
    },
    deployments: deploys.map((d) => ({
      id: d.id,
      version: d.version,
      status: d.status,
      deployedAt: d.deployedAt,
    })),
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const site = await getSiteBySlug(slug);

  if (!site || site.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const { title, description, showcased } = body;

  if (title !== undefined && (!title || title.trim().length === 0)) {
    return NextResponse.json(
      { error: "Title cannot be empty" },
      { status: 400 }
    );
  }

  if (title !== undefined && title.length > 200) {
    return NextResponse.json(
      { error: "Title must be 200 characters or less" },
      { status: 400 }
    );
  }

  const updated = await updateSite(slug, {
    ...(title !== undefined && { title }),
    ...(description !== undefined && { description }),
    ...(showcased !== undefined && { showcased: Boolean(showcased) }),
  });

  return NextResponse.json({ site: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const site = await getSiteBySlug(slug);

  if (!site || site.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    await deleteSiteFromR2(slug);
    await deleteSite(slug);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Failed to delete site:", error);
    return NextResponse.json(
      { error: "Failed to delete site. Please try again." },
      { status: 500 }
    );
  }
}
