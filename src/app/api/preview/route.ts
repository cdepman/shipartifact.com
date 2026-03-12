import { NextRequest, NextResponse } from "next/server";
import { detectArtifactType } from "@/lib/artifact/detect";
import { wrapArtifact } from "@/lib/artifact/wrap";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { sourceCode, title } = body;

  if (!sourceCode) {
    return NextResponse.json(
      { error: "sourceCode is required" },
      { status: 400 }
    );
  }

  const artifactType = detectArtifactType(sourceCode);
  const html = wrapArtifact(sourceCode, artifactType, {
    title: title || "Preview",
    slug: "preview",
  });

  return NextResponse.json({ html, artifactType });
}
