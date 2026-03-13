import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { detectArtifactType, detectsAiUsage } from "@/lib/artifact/detect";
import { wrapArtifact } from "@/lib/artifact/wrap";
import { validateDeployInput } from "@/lib/artifact/validate";
import {
  getSiteBySlug,
  getSitesByUserId,
  createSite,
  updateSite,
  createDeployment,
  deleteSite,
} from "@/lib/db/queries";
import { uploadSiteToR2, deleteSiteFromR2 } from "@/lib/cloudflare/r2";
import { SITES_DOMAIN, MAX_SITES_FREE_TIER } from "@/lib/constants";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { slug, title, description, sourceCode, showcased } = body;

  // Validate input
  const errors = validateDeployInput({ slug, title, sourceCode });
  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  // Check if slug is taken by another user
  const existingSite = await getSiteBySlug(slug);
  const isRedeploy = existingSite && existingSite.userId === userId;

  if (existingSite && !isRedeploy) {
    return NextResponse.json(
      {
        errors: [
          { field: "slug", message: "This site name is already taken" },
        ],
      },
      { status: 409 }
    );
  }

  // Check free tier limit for new sites
  if (!isRedeploy) {
    const userSites = await getSitesByUserId(userId);
    if (userSites.length >= MAX_SITES_FREE_TIER) {
      return NextResponse.json(
        {
          errors: [
            {
              field: "slug",
              message: `Free tier is limited to ${MAX_SITES_FREE_TIER} sites`,
            },
          ],
        },
        { status: 403 }
      );
    }
  }

  // Detect artifact type and AI usage, then wrap
  const artifactType = detectArtifactType(sourceCode);
  const usesAi = detectsAiUsage(sourceCode);
  const wrappedHtml = wrapArtifact(sourceCode, artifactType, {
    title,
    description,
    slug,
  }, { usesAi });

  try {
    // DB first, then R2 — if DB fails, nothing is orphaned in R2
    let site;
    let version: number;

    if (isRedeploy) {
      version = existingSite.currentVersion + 1;
      site = await updateSite(slug, {
        title,
        description,
        sourceCode,
        artifactType,
        currentVersion: version,
        usesAi,
        ...(showcased !== undefined && { showcased: Boolean(showcased) }),
      });
    } else {
      version = 1;
      site = await createSite({
        userId,
        slug,
        title,
        description,
        sourceCode,
        artifactType,
        usesAi,
        showcased: Boolean(showcased),
      });
    }

    const deployment = await createDeployment({
      siteId: site!.id,
      version,
      sourceCode,
      artifactType,
      wrappedHtml,
      status: "deploying",
    });

    // Upload to R2 — if this fails, roll back the DB records
    try {
      await uploadSiteToR2(slug, wrappedHtml);
    } catch (r2Error) {
      console.error("R2 upload failed, rolling back DB:", r2Error);
      if (!isRedeploy) {
        await deleteSite(slug);
      }
      throw r2Error;
    }

    return NextResponse.json(
      {
        url: `https://${slug}.${SITES_DOMAIN}`,
        siteId: site!.id,
        deploymentId: deployment.id,
        version,
      },
      { status: isRedeploy ? 200 : 201 }
    );
  } catch (error) {
    console.error("Deploy failed:", error);
    return NextResponse.json(
      { error: "Deployment failed. Please try again." },
      { status: 500 }
    );
  }
}
