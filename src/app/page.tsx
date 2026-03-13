import { Navbar } from "@/components/shared/navbar";
import { CtaButton } from "@/components/landing/cta-button";
import { PromptCopySection } from "@/components/landing/prompt-copy-section";
import { ShowcaseCarousel } from "@/components/landing/showcase-carousel";
import { Sparkles, Eye, Globe, UserX, Link as LinkIcon } from "lucide-react";
import NextLink from "next/link";

const STEPS = [
  {
    icon: Sparkles,
    title: "Create with Claude",
    description:
      "Go to claude.ai (it's free) and ask it to build something for you. Copy one of our example prompts to get started.",
    link: { label: "Open Claude \u2192", href: "https://claude.ai" },
  },
  {
    icon: Eye,
    title: "Paste & Preview",
    description:
      "Copy your creation from Claude and paste it here. You'll see a live preview right away.",
  },
  {
    icon: Globe,
    title: "Publish It",
    description:
      "Choose a name and hit publish. Your creation gets its own link you can share with anyone.",
  },
];

export default function LandingPage() {
  return (
    <div className="theme-light min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(99,102,241,0.06), transparent)",
          }}
        />

        <div className="relative mx-auto max-w-4xl px-6 pb-20 pt-24 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Free while in beta
          </div>

          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
            Create with Claude.
            <br />
            <span className="text-primary">Share with the world.</span>
          </h1>

          <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Create amazing AI-powered apps with Claude (for free), then publish
            them here so anyone can use them. No technical skills needed.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <CtaButton label="Get Started — It's Free" />
          </div>
          <div className="mt-4 flex justify-center">
            <a
              href="#how-it-works"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              See how it works &darr;
            </a>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-border py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
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
                <div className="mb-1 text-xs font-medium text-muted-foreground">
                  Step {i + 1}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
                {"link" in step && step.link && (
                  <a
                    href={(step.link as { href: string }).href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-sm font-medium text-primary transition-opacity hover:opacity-80"
                  >
                    {(step.link as { label: string }).label}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key benefits */}
      <section className="border-t border-border py-14">
        <div className="mx-auto grid max-w-3xl gap-6 px-6 sm:grid-cols-2">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <UserX size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">No login required</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Anyone with the link can use your creation instantly. No account
                needed.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <LinkIcon size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">A clean link you can share</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Your creation gets its own short link you can text, post, or put
                on a business card.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase */}
      <ShowcaseCarousel />

      {/* Try this in Claude */}
      <section className="border-t border-border py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
              Try it yourself
            </p>
            <h2 className="text-3xl font-bold">
              Start with a prompt, end with a website
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              Copy one of these prompts into Claude, then bring your creation
              here to publish it.
            </p>
          </div>

          <PromptCopySection />
        </div>
      </section>

      {/* What you can create */}
      <section className="border-t border-border py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
              Ideas to get you started
            </p>
            <h2 className="text-3xl font-bold">
              If you can imagine it, you can publish it
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "AI language tutors",
              "Smart recipe generators",
              "Personalized story creators",
              "AI homework helpers",
              "Custom chatbots",
              "Interactive learning tools",
              "AI writing assistants",
              "Smart calculators & analyzers",
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
            Publish your first creation
          </h2>
          <p className="mb-8 text-muted-foreground">
            Free to create at claude.ai. Free to publish here. No credit card
            needed.
          </p>
          <CtaButton label="Get Started Free" />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 px-6 text-sm text-muted-foreground sm:flex-row sm:justify-between">
          <p>&copy; {new Date().getFullYear()} PushToStart</p>
          <NextLink href="/showcase" className="transition-colors hover:text-foreground">
            Showcase
          </NextLink>
        </div>
      </footer>
    </div>
  );
}
