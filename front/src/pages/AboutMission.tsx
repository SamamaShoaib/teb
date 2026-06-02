import { Link } from "wouter";
import { Heart, Users, Briefcase, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const pillars = [
  {
    icon: Briefcase,
    title: "Inclusive Employment",
    body: "Connect Persons with Disabilities to meaningful work with employers who value their talent and adapt to their needs.",
  },
  {
    icon: Users,
    title: "Community Support",
    body: "Build a network of mentors, captains, and peers so no member of our community has to navigate the journey alone.",
  },
  {
    icon: Sparkles,
    title: "Access to Funding",
    body: "Make livelihood, training, and assistive-technology grants reachable for every PWD across Pakistan.",
  },
];

export default function AboutMission() {
  return (
    <div className="min-h-screen bg-muted">
      <section
        className="py-16"
        style={{
          background:
            "linear-gradient(135deg, var(--teb-trust-blue) 0%, var(--teb-trust-blue-bright) 100%)",
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: "rgba(255,255,255,0.18)" }}
          >
            <Heart className="w-7 h-7" />
          </div>
          <h1
            className="mb-4"
            style={{
              fontWeight: 900,
              letterSpacing: "-0.035em",
              fontSize: "clamp(1.875rem, 4vw, 2.5rem)",
            }}
          >
            Our Mission
          </h1>
          <p className="text-white/85 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            The Empowerment Bridge exists to make sure every Person with a
            Disability in Pakistan has a clear path to dignified work,
            supportive community, and the financial tools to thrive.
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pillars.map((p) => {
              const Icon = p.icon;
              return (
                <Card key={p.title} className="border border-border bg-white">
                  <CardContent className="p-6">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                      style={{
                        background: "var(--teb-trust-blue)",
                        color: "#fff",
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-foreground mb-2">{p.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {p.body}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border border-border bg-white">
            <CardContent className="p-8">
              <h2 className="text-xl font-bold text-foreground mb-3">
                Why "The Empowerment Bridge"?
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                A bridge is built by many hands and carries many travelers. We
                see ourselves as the structure that connects PWDs, employers,
                community captains, and donors so that opportunity flows freely
                in every direction.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every job posted, mentor matched, and grant funded strengthens
                the bridge for the next person who needs to cross it.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <Link href="/talent-hub">
                  <Button
                    style={{ background: "var(--teb-trust-blue)" }}
                    className="text-white rounded-full"
                  >
                    Explore Opportunities <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/community-captains">
                  <Button variant="outline" className="rounded-full">
                    Meet the Community
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
