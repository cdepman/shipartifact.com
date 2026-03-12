import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { detectArtifactType } from "@/lib/artifact/detect";
import { wrapArtifact } from "@/lib/artifact/wrap";
import { validateDeployInput } from "@/lib/artifact/validate";
import {
  getSiteBySlug,
  createSite,
  updateSite,
  createDeployment,
} from "@/lib/db/queries";
import { uploadSiteToR2 } from "@/lib/cloudflare/r2";
import { SITES_DOMAIN, MAX_SITES_FREE_TIER } from "@/lib/constants";
import { getSitesByUserId } from "@/lib/db/queries";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { slug, title, description, sourceCode } = body;

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
      { errors: [{ field: "slug", message: "This site name is already taken" }] },
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

  // Detect artifact type and wrap
  const artifactType = detectArtifactType(sourceCode);
  const wrappedHtml = wrapArtifact(sourceCode, artifactType, {
    title,
    description,
    slug,
  });

  try {
    // Upload to R2
    await uploadSiteToR2(slug, wrappedHtml);

    let site;
    let version: number;

    if (isRedeploy) {
      // Update existing site
      version = existingSite.currentVersion + 1;
      site = await updateSite(slug, {
        title,
        description,
        sourceCode,
        artifactType,
        currentVersion: version,
      });
    } else {
      // Create new site
      version = 1;
      site = await createSite({
        userId,
        slug,
        title,
        description,
        sourceCode,
        artifactType,
      });
    }

    // Create deployment record
    const deployment = await createDeployment({
      siteId: site!.id,
      version,
      sourceCode,
      artifactType,
      wrappedHtml,
      status: "deployed",
    });

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
