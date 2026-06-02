import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Building2, Heart, Users, TrendingUp, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api, type Stats } from "@/lib/api";
import {
  FadeIn,
  StaggerGroup,
  StaggerItem,
  CountUp,
  WordReveal,
} from "@/components/motion";

function StatCard({
  value,
  label,
  raw,
  numeric,
  prefix,
  suffix,
}: {
  value: string;
  label: string;
  raw?: number;
  numeric?: number;
  prefix?: string;
  suffix?: string;
}) {
  const isEmpty = raw !== undefined && raw === 0;
  return (
    <div className="text-center">
      {isEmpty ? (
        <div className="text-base md:text-lg font-semibold text-white/80" style={{ letterSpacing: "-0.01em" }}>
          Just launching
        </div>
      ) : numeric !== undefined ? (
        <CountUp
          to={numeric}
          prefix={prefix}
          suffix={suffix}
          className="text-3xl md:text-4xl font-black inline-block"
          style={{ color: "#ffb800", letterSpacing: "-0.03em" }}
        />
      ) : (
        <div className="text-3xl md:text-4xl font-black" style={{ color: "#ffb800", letterSpacing: "-0.03em" }}>{value}</div>
      )}
      <div className="text-sm text-white/70 mt-1 font-medium">{label}</div>
    </div>
  );
}

const pillars = [
  {
    icon: Briefcase,
    title: "Talent Hub",
    description: "Browse inclusive job opportunities from companies committed to hiring PWDs. Filter by role, location, and accommodations offered.",
    href: "/talent-hub",
    color: "hsl(204 100% 36%)",
    badge: "Find Jobs",
  },
  {
    icon: Building2,
    title: "Corporate Portal",
    description: "Partner with us to unlock a skilled, motivated talent pool. Post jobs, access accommodation guides, and join inclusive hiring leaders.",
    href: "/corporate-portal",
    color: "hsl(142 76% 36%)",
    badge: "Partner With Us",
  },
  {
    icon: Heart,
    title: "Support & Funding",
    description: "Access grants, livelihood assistance, and adaptive equipment funding. Donors can contribute directly to life-changing programs.",
    href: "/support-funding",
    color: "hsl(43 100% 50%)",
    badge: "Get Funded",
  },
  {
    icon: Users,
    title: "Community Captains",
    description: "Connect with trained community ambassadors who provide mentorship, job coaching, and navigate government support systems.",
    href: "/community-captains",
    color: "hsl(262 83% 58%)",
    badge: "Find a Mentor",
  },
];

const testimonials = [
  {
    quote: "Through TEB's Talent Hub, I found a remote role that matches my skills and provides the flexibility I need. I'm earning more than ever.",
    name: "Maria S.",
    role: "UX Designer, Makati",
  },
  {
    quote: "Our Captain helped me navigate PhilHealth and SSS benefits I didn't know I qualified for. The guidance was invaluable.",
    name: "Rico T.",
    role: "Freelance Developer, Karachi",
  },
  {
    quote: "The grant covered my assistive technology. Now I can work independently and support my family.",
    name: "Ana L.",
    role: "Data Entry Specialist, Islamabad",
  },
];

export default function Home() {
  const { data: stats } = useQuery<Stats>({
    queryKey: ["stats"],
    queryFn: api.stats.get,
  });

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section 
        className="teb-hero teb-hero-blue relative overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: 'linear-gradient(135deg, rgba(0, 61, 102, 0.9) 0%, rgba(0, 111, 186, 0.8) 100%), url("/hero.png")' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-6 backdrop-blur-sm"
              style={{ background: "rgba(255,184,0,0.18)", color: "#ffd766", border: "1px solid rgba(255,184,0,0.3)" }}
            >
              <motion.span
                animate={{ rotate: [0, 18, -12, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.6 }}
                style={{ display: "inline-flex" }}
              >
                <Star className="w-3 h-3" fill="currentColor" />
              </motion.span>
              Pakistan's #1 PWD Empowerment Platform
            </motion.div>
            <h1
              className="text-white leading-[1.05] mb-5"
              style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)", fontWeight: 900, letterSpacing: "-0.04em", color: "#fff" }}
            >
              <WordReveal text="Bridging Talent," as="span" />
              <br />
              <WordReveal
                text="Breaking Barriers"
                as="span"
                delay={0.35}
                style={{ color: "#ffd766" }}
              />
            </h1>
            <FadeIn delay={0.7} duration={0.6}>
              <p className="text-lg text-white/85 mb-8 leading-relaxed max-w-xl">
                The Empowerment Bridge connects Persons with Disabilities to inclusive employers, community mentors, and life-changing funding — all in one platform built for the Pakistani PWD community.
              </p>
            </FadeIn>
            <FadeIn delay={0.95} duration={0.55}>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" className="teb-btn-glow font-semibold rounded-full px-7" style={{ background: "#ffb800", color: "#1a1a2e" }} asChild>
                  <Link href="/talent-hub">
                    Browse Jobs <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="font-semibold border-white/40 text-white hover:bg-white/10 rounded-full px-7" asChild>
                  <Link href="/corporate-portal">For Employers</Link>
                </Button>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section style={{ background: "linear-gradient(180deg, #1a1a2e 0%, #2c2c44 100%)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <StaggerGroup className="grid grid-cols-2 md:grid-cols-4 gap-8" stagger={0.12}>
            <StaggerItem>
              <StatCard
                raw={stats?.totalPwdMembers}
                numeric={stats?.totalPwdMembers}
                suffix="+"
                value={stats ? `${stats.totalPwdMembers}+` : "—"}
                label="PWD Members"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                raw={stats?.totalCorporatePartners}
                numeric={stats?.totalCorporatePartners}
                value={stats ? `${stats.totalCorporatePartners}` : "—"}
                label="Corporate Partners"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                raw={stats?.totalActiveCaptains}
                numeric={stats?.totalActiveCaptains}
                value={stats ? `${stats.totalActiveCaptains}` : "—"}
                label="Community Captains"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                raw={stats?.totalFundsDistributedPkr}
                numeric={stats ? Math.round(stats.totalFundsDistributedPkr / 1000) : undefined}
                prefix="Rs "
                suffix="K"
                value={stats ? `Rs ${(stats.totalFundsDistributedPkr / 1000).toFixed(0)}K` : "—"}
                label="Funds Distributed"
              />
            </StaggerItem>
          </StaggerGroup>
        </div>
      </section>

      {/* 4 Pillars */}
      <section className="py-20" style={{ background: "var(--teb-page-bg)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-14">
            <span className="teb-kicker">Our Ecosystem</span>
            <h2 className="text-3xl md:text-4xl mb-4" style={{ fontWeight: 800, letterSpacing: "-0.025em" }}>
              Four Pillars of Empowerment
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
              A holistic ecosystem designed to support every aspect of PWD economic participation and community wellbeing.
            </p>
          </FadeIn>
          <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" stagger={0.12}>
            {pillars.map((p) => {
              const Icon = p.icon;
              return (
                <StaggerItem key={p.href}>
                  <Link href={p.href}>
                    <div className="teb-card teb-card-clickable h-full p-6 flex flex-col group">
                      <div className="teb-section-icon mb-4" style={{ background: `${p.color}1a`, color: p.color }}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg mb-2 group-hover:text-[#006fba] transition-colors">{p.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed flex-1">{p.description}</p>
                      <div className="mt-5 flex items-center gap-1 text-sm font-semibold transition-all" style={{ color: p.color }}>
                        {p.badge} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-14">
            <span className="teb-kicker">Voices of TEB</span>
            <h2 className="text-3xl md:text-4xl mb-3" style={{ fontWeight: 800, letterSpacing: "-0.025em" }}>
              Real Stories of Change
            </h2>
            <p className="text-muted-foreground">From our growing community of empowered members.</p>
          </FadeIn>
          <StaggerGroup className="grid grid-cols-1 md:grid-cols-3 gap-6" stagger={0.12}>
            {testimonials.map((t, i) => (
              <StaggerItem key={i}>
                <div className="teb-card p-6 flex flex-col h-full">
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-4 h-4" style={{ color: "#ffb800" }} fill="#ffb800" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed mb-5 italic flex-1">"{t.quote}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-black/5">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: "linear-gradient(135deg,#006fba,#0088dd)" }}>
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.role}</div>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* CTA */}
      <section className="teb-hero teb-hero-blue py-20 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <FadeIn>
            <motion.div
              className="teb-section-icon mx-auto mb-5"
              style={{ background: "rgba(255,255,255,0.12)", color: "#ffb800", width: 56, height: 56 }}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <TrendingUp className="w-7 h-7" />
            </motion.div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="text-3xl md:text-4xl text-white mb-4" style={{ fontWeight: 900, letterSpacing: "-0.03em", color: "#fff" }}>
              Ready to Cross the Bridge?
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-white/85 mb-8 text-lg max-w-2xl mx-auto leading-relaxed">
              Join thousands of PWDs building careers, finding community, and accessing the support they deserve.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" className="teb-btn-glow font-semibold rounded-full px-7" style={{ background: "#ffb800", color: "#1a1a2e" }} asChild>
                <Link href="/sign-up">Create Free Account</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 font-semibold rounded-full px-7" asChild>
                <Link href="/talent-hub">Browse Opportunities</Link>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
