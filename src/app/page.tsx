import Link from "next/link";
import { Navbar } from "@/components/shared/navbar";
import { ArrowRight, Code, Eye, Globe } from "lucide-react";

const STEPS = [
  {
    icon: Code,
    title: "Build in Claude",
    description:
      "Create something amazing with Claude artifacts — a calculator, quiz, portfolio, or anything else.",
  },
  {
    icon: Eye,
    title: "Paste & Preview",
    description:
      "Copy your artifact code and paste it into ShipArtifact. See a live preview instantly.",
  },
  {
    icon: Globe,
    title: "Ship It",
    description:
      "Pick a name, hit deploy. Your site is live at yourapp.shipartifact.com in seconds.",
  },
];

export default function LandingPage() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Ambient gradient */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(99,102,241,0.08), transparent)",
          }}
        />

        <div className="relative mx-auto max-w-4xl px-6 pb-20 pt-24 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
            Free during beta
          </div>

          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
            Build in Claude.
            <br />
            <span className="text-primary">Ship to the world.</span>
          </h1>

          <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Deploy your Claude artifacts as live websites in seconds. Paste your
            code, pick a name, and get a URL. No config, no setup, no
            infrastructure.
          </p>

          <div className="flex justify-center gap-4">
            <Link
              href="/sign-up"
              className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Get Started
              <ArrowRight size={16} />
            </Link>
            <a
              href="#how-it-works"
              className="rounded-xl border border-border px-8 py-3 text-sm font-medium transition-colors hover:bg-muted"
            >
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-border py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-12 text-center">
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-primary">
              How it works
            </p>
            <h2 className="text-3xl font-bold">Three steps. Thirty seconds.</h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                  <step.icon size={24} className="text-primary" />
                </div>
                <div className="mb-1 font-mono text-xs text-muted-foreground">
                  0{i + 1}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you can deploy */}
      <section className="border-t border-border py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-12 text-center">
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-primary">
              Use cases
            </p>
            <h2 className="text-3xl font-bold">
              If Claude can build it, you can ship it.
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "Calculators & converters",
              "Interactive quizzes",
              "Portfolio sites",
              "Data visualizations",
              "Mini games",
              "Utility tools",
              "Landing pages",
              "Dashboards & demos",
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-border bg-card px-5 py-4 text-sm"
              >
                <span className="mr-2 text-primary">&#x203A;</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold">
            Deploy your first artifact
          </h2>
          <p className="mb-8 text-muted-foreground">
            Free during beta. 3 sites on your own subdomain. No credit card
            required.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Start Shipping
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-4xl px-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ShipArtifact. Built with Claude.</p>
        </div>
      </footer>
    </>
  );
}
