import { Link } from "wouter";
import { TrendingUp, Users, Briefcase, HandCoins, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  { icon: Users, label: "PWDs registered on TEB", value: "12,400+" },
  { icon: Briefcase, label: "Inclusive jobs posted", value: "1,850+" },
  { icon: HandCoins, label: "Grant funding deployed", value: "Rs 18.3M" },
  { icon: TrendingUp, label: "Approval rate of grant applications", value: "62%" },
];

const milestones = [
  {
    period: "Q1 2026",
    title: "Soft launch in Lahore",
    body: "Onboarded 24 community captains and 80 corporate partners across Punjab.",
  },
  {
    period: "Q2 2026",
    title: "Karachi and Islamabad expansion",
    body: "Opened regional hubs and translated key flows to Urdu. Member growth +180%.",
  },
  {
    period: "Q3 2026",
    title: "Skills training grants live",
    body: "Launched the assistive-technology and skills-training grant tracks alongside livelihood funds.",
  },
];

export default function ImpactReports() {
  return (
    <div className="min-h-screen bg-muted">
      <section
        className="py-14"
        style={{
          background:
            "linear-gradient(135deg, var(--teb-trust-blue) 0%, var(--teb-trust-blue-bright) 100%)",
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h1
            className="mb-3"
            style={{
              fontWeight: 900,
              letterSpacing: "-0.035em",
              fontSize: "clamp(1.875rem, 4vw, 2.5rem)",
            }}
          >
            Impact Reports
          </h1>
          <p className="text-white/85 max-w-2xl mx-auto leading-relaxed">
            A transparent look at the people, jobs, and pesos moving through
            The Empowerment Bridge so far this year.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <Card key={s.label} className="border border-border bg-white">
                  <CardContent className="p-5">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                      style={{
                        background: "var(--teb-action-yellow)",
                        color: "hsl(215 28% 17%)",
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-2xl font-extrabold text-foreground">
                      {s.value}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-snug">
                      {s.label}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-foreground mb-5">
            2026 Milestones
          </h2>
          <ol className="space-y-4">
            {milestones.map((m) => (
              <li key={m.period}>
                <Card className="border border-border bg-white">
                  <CardContent className="p-5">
                    <div
                      className="text-xs font-semibold uppercase tracking-wide mb-1"
                      style={{ color: "var(--teb-trust-blue)" }}
                    >
                      {m.period}
                    </div>
                    <h3 className="font-bold text-foreground mb-1">
                      {m.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {m.body}
                    </p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ol>

          <Card className="border border-border bg-white mt-8">
            <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="font-bold text-foreground mb-1">
                  Want to power the next milestone?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Donations and corporate partnerships fund every grant we
                  approve.
                </p>
              </div>
              <Link href="/support-funding">
                <Button
                  style={{ background: "var(--teb-trust-blue)" }}
                  className="text-white rounded-full whitespace-nowrap"
                >
                  Support a PWD <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
