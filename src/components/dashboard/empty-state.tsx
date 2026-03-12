import Link from "next/link";
import { Rocket } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 rounded-2xl bg-primary/10 p-4">
        <Rocket size={32} className="text-primary" />
      </div>
      <h2 className="mb-2 text-xl font-semibold">No sites yet</h2>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        Deploy your first Claude artifact as a live website. Paste your code,
        pick a name, and ship it in seconds.
      </p>
      <Link
        href="/new"
        className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        Deploy your first artifact
      </Link>
    </div>
  );
}
