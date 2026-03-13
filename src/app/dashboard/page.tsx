import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getSitesByUserId } from "@/lib/db/queries";
import { SiteCard } from "@/components/dashboard/site-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { SITES_DOMAIN } from "@/lib/constants";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const sites = await getSitesByUserId(userId);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Your Sites</h1>
          <p className="text-sm text-muted-foreground">
            {sites.length > 0
              ? `${sites.length} published site${sites.length === 1 ? "" : "s"}`
              : "Publish your Claude creations as live websites"}
          </p>
        </div>
      </div>

      {sites.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sites.map((site) => (
            <SiteCard
              key={site.id}
              slug={site.slug}
              title={site.title}
              description={site.description}
              artifactType={site.artifactType}
              currentVersion={site.currentVersion}
              url={`https://${site.slug}.${SITES_DOMAIN}`}
              updatedAt={site.updatedAt}
            />
          ))}
        </div>
      )}
    </div>
  );
}
