import React, { useState } from "react";
import { Scale, ShieldAlert, Gavel, FileText, ChevronRight, Search, MapPin, Phone, MessageSquare, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const RIGHTS_CARDS = [
  {
    title: "Employment Quota",
    law: "CPLDA 2020",
    summary: "3% of all government and private sector roles must be reserved for PWDs.",
    icon: <Scale className="w-5 h-5 text-blue-600" />,
  },
  {
    title: "Workplace Accessibility",
    law: "Accessibility Code 2006",
    summary: "Employers must provide reasonable accommodations (ramps, software, flexible hours).",
    icon: <FileText className="w-5 h-5 text-purple-600" />,
  },
  {
    title: "Non-Discrimination",
    law: "Constitution Art. 25",
    summary: "You cannot be denied a job or promotion solely based on your disability.",
    icon: <ShieldAlert className="w-5 h-5 text-red-600" />,
  }
];

const LAWYERS = [
  {
    name: "Barrister Zafarullah Khan",
    expertise: "Civil Rights & Disability Law",
    location: "Islamabad",
    contact: "+92 51 1234567",
    isProBono: true,
  },
  {
    name: "Justice (R) Nasira Iqbal",
    expertise: "Advocacy & Social Justice",
    location: "Lahore",
    contact: "+92 42 7654321",
    isProBono: true,
  },
  {
    name: "Asma Jahangir Legal Aid Cell",
    expertise: "Human Rights Litigation",
    location: "Karachi / Lahore",
    contact: "+92 300 1234567",
    isProBono: true,
  }
];

export default function LegalAid() {
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const [reportOpen, setReportOpen] = useState(false);

  const filteredLawyers = LAWYERS.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase()) || 
    l.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Report Received",
      description: "Our legal advocacy team will review your case and contact you within 48 hours.",
    });
    setReportOpen(false);
  };

  return (
    <div className="min-h-screen bg-muted/20 pb-12">
      <div className="teb-hero teb-hero-navy py-14 relative overflow-hidden bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="teb-section-icon mb-4 bg-white/10 text-blue-400">
            <Scale className="w-6 h-6" />
          </div>
          <h1 className="text-white font-black text-3xl md:text-4xl tracking-tight">Legal Aid & Rights</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">Empowering PWDs through legal awareness and pro-bono advocacy support.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left: Rights & Reporting */}
          <div className="lg:col-span-2 space-y-10">
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">Know Your Rights</h2>
                <Button variant="link" className="text-blue-600 font-bold text-xs uppercase tracking-widest">Full Legislation <ChevronRight className="w-3 h-3" /></Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {RIGHTS_CARDS.map((card, i) => (
                  <Card key={i} className="border border-border hover:border-blue-200 transition-colors">
                    <CardContent className="p-5 space-y-3">
                      <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
                        {card.icon}
                      </div>
                      <h3 className="font-bold text-sm">{card.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{card.summary}</p>
                      <div className="text-xxs font-black text-muted-foreground uppercase opacity-50">{card.law}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section className="bg-red-50 border border-red-100 rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <ShieldAlert className="w-32 h-32 text-red-900" />
              </div>
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2 text-red-700">
                  <ShieldAlert className="w-6 h-6" />
                  <h2 className="text-xl font-bold">Facing Discrimination?</h2>
                </div>
                <p className="text-red-900/70 text-sm max-w-xl leading-relaxed">
                  If you have been denied a job, promotion, or accommodation due to your disability, you can file a confidential report with our advocacy cell.
                </p>
                <Button 
                  onClick={() => setReportOpen(true)}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-8"
                >
                  File a Legal Report
                </Button>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-foreground">Pro-Bono Directory</h2>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or city..."
                    className="pl-9 h-9 text-sm"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredLawyers.map((lawyer, i) => (
                  <Card key={i} className="border border-border hover:shadow-md transition-shadow">
                    <CardContent className="p-5 flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
                        <Gavel className="w-6 h-6" />
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-sm">{lawyer.name}</h3>
                          {lawyer.isProBono && <span className="text-xxs font-black uppercase text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Pro-Bono</span>}
                        </div>
                        <p className="text-xs text-muted-foreground">{lawyer.expertise}</p>
                        <div className="flex flex-wrap gap-4 text-xxs text-muted-foreground font-medium pt-1">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {lawyer.location}</span>
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {lawyer.contact}</span>
                        </div>
                        <div className="pt-2 flex gap-2">
                          <Button variant="outline" size="sm" className="h-8 text-xxs font-bold uppercase tracking-wider rounded-lg flex-1">
                            Call
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 text-xxs font-bold uppercase tracking-wider rounded-lg flex-1">
                            Message
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>

          {/* Right: Sidebar / FAQs */}
          <div className="space-y-6">
            <Card className="bg-white border-border shadow-sm rounded-2xl">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Gavel className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg">Legal FAQ</h3>
                <div className="space-y-3">
                  <FAQItem question="Can I be fired for my disability?" answer="No, under Pakistani law, wrongful termination based on disability is illegal." />
                  <FAQItem question="Is work-from-home a right?" answer="It is considered a 'Reasonable Accommodation' if the job can be done remotely." />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 text-white border-none shadow-xl rounded-2xl overflow-hidden">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-bold text-lg">Advocacy Helpline</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Need immediate advice? Our partners at the Legal Aid Cell are available 24/7 for PWDs.
                </p>
                <div className="bg-white/10 p-3 rounded-xl flex items-center gap-3">
                  <Phone className="w-5 h-5 text-blue-400" />
                  <span className="font-mono text-lg font-bold">1099</span>
                </div>
                <p className="text-xxs text-muted-foreground uppercase tracking-widest font-black text-center">Toll-Free Govt Helpline</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {reportOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="bg-red-600 p-6 text-white">
                <h2 className="text-xl font-bold">Report Discrimination</h2>
                <p className="text-red-100 text-xs">Confidentially document a violation of PWD rights.</p>
              </div>
              <form onSubmit={handleReportSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Incident Type</label>
                  <select className="w-full border border-border rounded-lg h-10 px-3 text-sm">
                    <option>Hiring Bias</option>
                    <option>Accommodation Refusal</option>
                    <option>Harassment / Bullying</option>
                    <option>Wrongful Termination</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Description</label>
                  <textarea 
                    className="w-full border border-border rounded-lg p-3 text-sm min-h-[100px] resize-none"
                    placeholder="Provide details about the company and incident..."
                    required
                  />
                </div>
                <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-xxs text-muted-foreground leading-relaxed">
                    By submitting, you agree to allow TEB and its legal partners to review this information. Your identity remains protected until you choose to pursue legal action.
                  </p>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setReportOpen(false)} className="flex-1 rounded-xl">Cancel</Button>
                  <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl">Submit Report</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0 pb-3 last:pb-0">
      <button 
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="text-xs font-bold text-foreground">{question}</span>
        <ChevronRight className={`w-3 h-3 transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.p 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="text-xxs text-muted-foreground mt-2 leading-relaxed overflow-hidden"
          >
            {answer}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
