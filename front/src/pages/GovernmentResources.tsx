import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api, type UserProfile } from "@/lib/api";
import { Landmark, GraduationCap, Briefcase, HeartHandshake, ChevronRight, ExternalLink, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

interface GovProgram {
  id: string;
  name: string;
  agency: string;
  category: "financial" | "education" | "training" | "health";
  description: string;
  benefit: string;
  eligibility: string;
}

const GOV_PROGRAMS: GovProgram[] = [
  {
    id: "bisp-pwd",
    name: "Benazir Kafaalat for PWDs",
    agency: "BISP",
    category: "financial",
    description: "Monthly unconditional cash transfer for persons with disabilities from low-income families.",
    benefit: "Rs. 2,000 / Month",
    eligibility: "Valid PWD Certificate & PMT Score < 32",
  },
  {
    id: "hec-scholarship",
    name: "HEC Disability Scholarship",
    agency: "Higher Education Commission",
    category: "education",
    description: "Full tuition fee waiver and monthly stipend for students with disabilities in public universities.",
    benefit: "100% Fee Waiver + Stipend",
    eligibility: "Enrolled in Public University",
  },
  {
    id: "navttc-skill",
    name: "Prime Minister's Skill Development",
    agency: "NAVTTC",
    category: "training",
    description: "Free technical and vocational training courses with specialized equipment for PWDs.",
    benefit: "Free Certification + Toolkit",
    eligibility: "Aged 18-35",
  },
  {
    id: "pbm-assistive",
    name: "Assistive Devices Support",
    agency: "Pakistan Bait-ul-Mal",
    category: "health",
    description: "Provision of wheelchairs, hearing aids, and artificial limbs for needy PWDs.",
    benefit: "Free Assistive Equipment",
    eligibility: "Medical Assessment + Poverty Proof",
  }
];

export default function GovernmentResources() {
  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["myProfile"],
    queryFn: api.users.getMe,
  });

  return (
    <div className="min-h-screen bg-muted/30 pb-12">
      <div className="teb-hero teb-hero-green py-14 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="teb-section-icon mb-4 bg-white/15 text-green-300">
                <Landmark className="w-6 h-6" />
              </div>
              <h1 className="text-white font-black text-3xl md:text-4xl tracking-tight">Government Benefits</h1>
              <p className="text-white/80 text-lg">Integrated support from BISP, HEC, and Bait-ul-Mal.</p>
            </div>
            
            {profile?.isVerified ? (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-300 border border-green-500/30">
                  <BadgeCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-green-300 uppercase">Status Verified</p>
                  <p className="text-sm text-white font-medium">Synced with NADRA Database</p>
                </div>
              </div>
            ) : (
              <div className="bg-amber-500/10 backdrop-blur-md border border-amber-500/20 p-4 rounded-2xl flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-300 border border-amber-500/30">
                  <Landmark className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-300 uppercase">Verification Needed</p>
                  <a href={`${basePath}/verify-identity`} className="text-sm text-white font-medium underline hover:text-amber-200">Verify to unlock all benefits</a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-foreground">Available Programs</h2>
            
            <div className="grid grid-cols-1 gap-4">
              {GOV_PROGRAMS.map((program, idx) => (
                <motion.div
                  key={program.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="border border-border hover:shadow-lg transition-all group overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        <div className={`w-full sm:w-2 px-0 py-1 ${
                          program.category === 'financial' ? 'bg-blue-500' :
                          program.category === 'education' ? 'bg-purple-500' :
                          program.category === 'training' ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} />
                        <div className="p-6 flex-1 flex flex-col sm:flex-row justify-between gap-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xxs font-black uppercase tracking-widest text-muted-foreground">{program.agency}</span>
                              <div className="w-1 h-1 rounded-full bg-border" />
                              <span className={`text-xxs font-black uppercase tracking-widest ${
                                program.category === 'financial' ? 'text-blue-600' :
                                program.category === 'education' ? 'text-purple-600' :
                                program.category === 'training' ? 'text-amber-600' : 'text-emerald-600'
                              }`}>{program.category}</span>
                            </div>
                            <h3 className="text-lg font-bold text-foreground group-hover:text-green-700 transition-colors">{program.name}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">{program.description}</p>
                            
                            <div className="flex flex-wrap gap-4 pt-2">
                              <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                                <HeartHandshake className="w-4 h-4 text-green-600" /> {program.benefit}
                              </div>
                              <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                                <BadgeCheck className="w-4 h-4 text-blue-600" /> {program.eligibility}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex sm:flex-col justify-end gap-2">
                            <Button variant="outline" size="sm" className="rounded-lg gap-2">
                              Details <ChevronRight className="w-3 h-3" />
                            </Button>
                            <Button size="sm" style={{ background: "hsl(142 76% 36%)" }} className="text-white rounded-lg gap-2">
                              Apply <ExternalLink className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <Card className="bg-white border-border shadow-sm rounded-2xl">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg">Special Quota Info</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Under Pakistani law, a **3% mandatory employment quota** exists for PWDs in all government departments. 
                </p>
                <div className="pt-2">
                  <Button variant="link" className="p-0 h-auto text-blue-600 font-bold text-xs uppercase tracking-widest gap-2">
                    View Vacancies <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-100 shadow-sm rounded-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-100 rounded-full -mr-12 -mt-12 opacity-50" />
              <CardContent className="p-6 space-y-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-700">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg">Kamyab Jawan PWD</h3>
                <p className="text-sm text-green-900/70 leading-relaxed">
                  Special interest-free loans up to **Rs. 500,000** for PWD entrepreneurs.
                </p>
                <Button className="w-full bg-green-700 text-white hover:bg-green-800 rounded-xl">
                  Check Eligibility
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
