import { useState } from "react";

const FONTS = "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Space+Mono:wght@400;700&display=swap";

const JOURNEYS = [
  {
    id: "user",
    label: "User Journey",
    color: "#6366F1",
    steps: [
      {
        num: "01",
        title: "Build in Claude",
        location: "claude.ai",
        description: "User builds something cool — a bill splitter, a quiz, a portfolio, a calculator — using Claude artifacts in a normal chat conversation.",
        details: [
          "No special setup needed",
          "Works with any Claude plan",
          "Artifact is a single .jsx or .html file",
        ],
        emoji: "💬",
      },
      {
        num: "02",
        title: "Visit your platform",
        location: "shipartifact.com",
        description: "User goes to your site. Signs up with Google/GitHub. Sees a simple dashboard: \"Deploy your first artifact.\"",
        details: [
          "One-click auth, no forms",
          "Free tier: 3 sites, your subdomain",
          "Paid tier: custom domains, AI backend, analytics",
        ],
        emoji: "🚀",
      },
      {
        num: "03",
        title: "Paste artifact code",
        location: "shipartifact.com/new",
        description: "User copies their artifact code from Claude and pastes it in. Your platform auto-detects whether it's React or HTML, and whether it makes any API calls.",
        details: [
          "Syntax detection (React vs HTML vs JS)",
          "API call scanning — finds fetch() to anthropic, openai, etc.",
          "Preview renders immediately",
        ],
        emoji: "📋",
      },
      {
        num: "04",
        title: "Configure & connect",
        location: "shipartifact.com/new",
        description: "User sets their site title, description, OG image. If the artifact needs AI, they choose: bring your own API key, or use your managed AI ($5/mo).",
        details: [
          "SEO fields: title, description, keywords",
          "OG image generator (built-in)",
          "Favicon picker",
          "AI backend toggle: BYOK or managed",
          "Custom domain field (paid)",
        ],
        emoji: "⚙️",
      },
      {
        num: "05",
        title: "Deploy",
        location: "shipartifact.com",
        description: "One click. Site goes live at myapp.shipartifact.com (or their custom domain). Backend spins up automatically if needed. Done in < 30 seconds.",
        details: [
          "Instant deploy to edge (Cloudflare)",
          "SSL auto-provisioned",
          "AI proxy endpoint auto-configured",
          "Site is live, shareable, no login required for visitors",
        ],
        emoji: "🌍",
      },
      {
        num: "06",
        title: "Iterate",
        location: "claude.ai → shipartifact.com",
        description: "User goes back to Claude, says \"update my artifact to add dark mode.\" Copies new code, pastes into dashboard, hits redeploy. Or: your platform gives them a snippet to paste into Claude that wires everything up automatically.",
        details: [
          "Version history",
          "Instant redeploy",
          "Claude-compatible config snippet",
          "Usage analytics on dashboard",
        ],
        emoji: "🔄",
      },
    ],
  },
  {
    id: "technical",
    label: "Technical Architecture",
    color: "#06B6D4",
    steps: [
      {
        num: "A",
        title: "Frontend Layer",
        location: "Cloudflare Pages / Workers",
        description: "The user's artifact gets wrapped in a production HTML shell with all SEO meta tags, then deployed to Cloudflare's edge network. Static, fast, global.",
        details: [
          "HTML wrapper injection (meta tags, OG, favicon)",
          "React artifacts get Babel + React UMD bundle",
          "Served from nearest edge node",
          "Custom domain via Cloudflare DNS",
        ],
        emoji: "🖥️",
      },
      {
        num: "B",
        title: "AI Proxy Layer",
        location: "Cloudflare Workers",
        description: "A lightweight worker sits between the user's site and the Anthropic API. Holds the API key server-side. Rate limits. Logs usage. The artifact's fetch() calls get rewritten to hit this endpoint.",
        details: [
          "API key stored in Workers secrets (encrypted)",
          "Request validation & rate limiting",
          "Usage metering for billing",
          "CORS configured per-site",
          "Supports streaming responses",
        ],
        emoji: "🔐",
      },
      {
        num: "C",
        title: "Data Layer",
        location: "Firebase / Supabase",
        description: "User accounts, site configs, API keys (encrypted), deploy history, usage metrics. Light and simple — no heavy database needed.",
        details: [
          "Auth: Firebase Auth or Supabase Auth",
          "Site configs: Firestore / Supabase tables",
          "API keys: encrypted at rest",
          "Usage logs: for billing & analytics",
          "File storage: OG images, favicons",
        ],
        emoji: "💾",
      },
      {
        num: "D",
        title: "Deploy Pipeline",
        location: "Your backend",
        description: "When user hits deploy: validate code → wrap in HTML shell → inject proxy endpoint → push to Cloudflare → provision SSL → update DNS if custom domain → return live URL.",
        details: [
          "Code sanitization (XSS protection)",
          "HTML template injection",
          "API endpoint rewriting",
          "Cloudflare Pages API for deploy",
          "DNS provisioning for custom domains",
        ],
        emoji: "⚡",
      },
      {
        num: "E",
        title: "The Claude Bridge (V2)",
        location: "MCP Server",
        description: "Future: an MCP server that Claude can connect to. User says \"deploy this to ShipArtifact\" right in the chat. Claude calls your MCP, deploys directly. Zero copy-paste.",
        details: [
          "MCP server with deploy, update, status tools",
          "Claude calls deploy() with artifact code",
          "Returns live URL in chat",
          "Full CI/CD from conversation",
          "This is the real magic — conversation-native deployment",
        ],
        emoji: "🌉",
      },
    ],
  },
  {
    id: "business",
    label: "Business Model",
    color: "#F59E0B",
    steps: [
      {
        num: "$0",
        title: "Free Tier",
        location: "The wedge",
        description: "Get people hooked. 3 sites on your subdomain (myapp.shipartifact.com). No AI backend. Just static hosting with SEO. This is already better than what exists.",
        details: [
          "3 deployed sites",
          "yourapp.shipartifact.com subdomain",
          "SEO + OG image generator",
          "Community gallery (optional)",
        ],
        emoji: "🆓",
      },
      {
        num: "$10",
        title: "Creator Plan",
        location: "Per month",
        description: "For people who want their sites to feel real. Custom domains, managed AI backend with usage-based pricing, analytics, version history.",
        details: [
          "Unlimited sites",
          "Custom domains + SSL",
          "Managed AI backend (usage-based)",
          "Analytics dashboard",
          "Priority deploys",
          "Remove \"made with ShipArtifact\" badge",
        ],
        emoji: "⚡",
      },
      {
        num: "$$$",
        title: "AI Usage Revenue",
        location: "Per API call",
        description: "The real business. You proxy AI calls and add a margin. User pays you instead of managing their own API key. Scales with their success.",
        details: [
          "Markup on Anthropic API calls (30-50%)",
          "User sees simple usage dashboard",
          "Auto-scaling, no config",
          "This is where the money is",
        ],
        emoji: "📈",
      },
      {
        num: "🎯",
        title: "The Flywheel",
        location: "Growth engine",
        description: "Every deployed site has a small \"made with ShipArtifact\" link. People see cool AI-powered sites, wonder how they were made, discover your platform. Hackathon-native distribution.",
        details: [
          "\"Made with ShipArtifact\" badge on free sites",
          "Gallery of cool community projects",
          "Hackathon partnerships",
          "\"Remix this\" button — fork any public site",
          "Claude power users are the early adopters",
        ],
        emoji: "🔁",
      },
    ],
  },
];

export default function UserJourneyMap() {
  const [activeJourney, setActiveJourney] = useState("user");
  const [expandedStep, setExpandedStep] = useState(null);

  const journey = JOURNEYS.find(j => j.id === activeJourney);

  return (
    <>
      <link href={FONTS} rel="stylesheet" />
      <div style={{
        minHeight: "100vh",
        background: "#06080D",
        color: "#E2E4E9",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {/* Ambient */}
        <div style={{
          position: "fixed", inset: 0, pointerEvents: "none",
          background: `radial-gradient(ellipse 70% 40% at 30% 0%, ${journey.color}08, transparent), radial-gradient(ellipse 50% 50% at 80% 100%, ${journey.color}05, transparent)`,
          transition: "background 0.6s ease",
        }} />

        <div style={{ maxWidth: 780, margin: "0 auto", padding: "40px 24px", position: "relative", zIndex: 1 }}>
          {/* Header */}
          <div style={{ marginBottom: 40 }}>
            <div style={{
              fontFamily: "'Space Mono', monospace", fontSize: 11,
              color: journey.color, textTransform: "uppercase",
              letterSpacing: "0.15em", marginBottom: 12,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ display: "inline-block", width: 20, height: 1, background: journey.color }} />
              Product Blueprint
            </div>
            <h1 style={{
              fontSize: 36, fontWeight: 700, letterSpacing: "-0.03em",
              lineHeight: 1.15, marginBottom: 8,
            }}>
              ShipArtifact
            </h1>
            <p style={{ color: "#6B7280", fontSize: 16, lineHeight: 1.5 }}>
              Build in Claude. Ship to the world. No login required.
            </p>
          </div>

          {/* Journey Tabs */}
          <div style={{ display: "flex", gap: 6, marginBottom: 40 }}>
            {JOURNEYS.map(j => (
              <button
                key={j.id}
                onClick={() => { setActiveJourney(j.id); setExpandedStep(null); }}
                style={{
                  padding: "10px 18px", borderRadius: 10,
                  border: activeJourney === j.id ? `1px solid ${j.color}44` : "1px solid rgba(255,255,255,0.06)",
                  background: activeJourney === j.id ? `${j.color}12` : "rgba(255,255,255,0.02)",
                  color: activeJourney === j.id ? j.color : "#6B7280",
                  fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500,
                  cursor: "pointer", transition: "all 0.25s",
                }}
              >
                {j.label}
              </button>
            ))}
          </div>

          {/* Steps */}
          <div style={{ position: "relative" }}>
            {/* Vertical line */}
            <div style={{
              position: "absolute", left: 23, top: 48, bottom: 48,
              width: 1, background: `linear-gradient(to bottom, ${journey.color}33, ${journey.color}08)`,
            }} />

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {journey.steps.map((step, i) => {
                const isExpanded = expandedStep === i;
                return (
                  <div
                    key={step.num}
                    onClick={() => setExpandedStep(isExpanded ? null : i)}
                    style={{
                      cursor: "pointer",
                      position: "relative",
                      padding: "20px 20px 20px 60px",
                      borderRadius: 14,
                      border: isExpanded ? `1px solid ${journey.color}33` : "1px solid transparent",
                      background: isExpanded ? `${journey.color}06` : "transparent",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {/* Step number circle */}
                    <div style={{
                      position: "absolute", left: 10, top: 22,
                      width: 28, height: 28, borderRadius: "50%",
                      background: isExpanded ? journey.color : "rgba(255,255,255,0.06)",
                      border: `1px solid ${isExpanded ? journey.color : "rgba(255,255,255,0.1)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "'Space Mono', monospace", fontSize: 10,
                      color: isExpanded ? "#FFF" : "#6B7280",
                      fontWeight: 700, transition: "all 0.3s",
                      zIndex: 2,
                    }}>
                      {step.num}
                    </div>

                    {/* Content */}
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                          <span style={{ fontSize: 20 }}>{step.emoji}</span>
                          <h3 style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.01em" }}>
                            {step.title}
                          </h3>
                        </div>
                        <div style={{
                          fontFamily: "'Space Mono', monospace", fontSize: 10,
                          color: journey.color, marginBottom: 8, marginLeft: 30,
                          opacity: 0.7,
                        }}>
                          {step.location}
                        </div>
                        <p style={{ color: "#9CA3AF", fontSize: 14, lineHeight: 1.6, marginLeft: 30 }}>
                          {step.description}
                        </p>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div style={{
                            marginTop: 16, marginLeft: 30, padding: "14px 18px",
                            background: "rgba(0,0,0,0.3)",
                            borderRadius: 10,
                            border: "1px solid rgba(255,255,255,0.05)",
                            animation: "fadeIn 0.3s ease",
                          }}>
                            {step.details.map((d, di) => (
                              <div key={di} style={{
                                display: "flex", alignItems: "flex-start", gap: 8,
                                padding: "5px 0",
                                color: "#A1A1AA", fontSize: 13,
                              }}>
                                <span style={{ color: journey.color, flexShrink: 0, marginTop: 2 }}>›</span>
                                {d}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Expand indicator */}
                      <div style={{
                        color: "#4B5563", fontSize: 14, marginTop: 4,
                        transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                      }}>
                        ›
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom CTA */}
          <div style={{
            marginTop: 48, padding: "28px 32px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 16,
          }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#6366F1", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              MVP Scope
            </div>
            <p style={{ color: "#D1D5DB", fontSize: 15, lineHeight: 1.6, marginBottom: 16 }}>
              <strong style={{ color: "#FFF" }}>Week 1:</strong> Landing page + paste-and-deploy flow (static sites only, your subdomain).
            </p>
            <p style={{ color: "#D1D5DB", fontSize: 15, lineHeight: 1.6, marginBottom: 16 }}>
              <strong style={{ color: "#FFF" }}>Week 2:</strong> AI proxy layer — artifacts with Anthropic API calls work out of the box.
            </p>
            <p style={{ color: "#D1D5DB", fontSize: 15, lineHeight: 1.6, marginBottom: 16 }}>
              <strong style={{ color: "#FFF" }}>Week 3:</strong> Custom domains + billing. You have a product.
            </p>
            <p style={{ color: "#D1D5DB", fontSize: 15, lineHeight: 1.6 }}>
              <strong style={{ color: "#FFF" }}>Week 4:</strong> MCP integration — deploy from inside Claude. That's the moat.
            </p>
          </div>
        </div>

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </>
  );
}