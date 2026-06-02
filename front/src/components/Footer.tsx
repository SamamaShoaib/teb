import { Link } from "wouter";
import { Heart } from "lucide-react";
import tebLogo from "@assets/teb-logo-transparent.png";

export default function Footer() {
  return (
    <footer className="bg-foreground text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <img
                src={tebLogo}
                alt="The Empowerment Bridge logo"
                className="w-8 h-8 object-contain"
              />
              <span className="font-bold text-sm">The Empowerment Bridge</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              Empowering Persons with Disabilities through inclusive employment, community support, and access to funding.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3" style={{ color: "hsl(43 100% 50%)" }}>For Talent</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link href="/talent-hub" className="hover:text-white transition-colors">Browse Jobs</Link></li>
              <li><Link href="/talent-hub" className="hover:text-white transition-colors">Skills Assessment</Link></li>
              <li><Link href="/community-captains" className="hover:text-white transition-colors">Find a Mentor</Link></li>
              <li><Link href="/support-funding" className="hover:text-white transition-colors">Apply for Grants</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3" style={{ color: "hsl(43 100% 50%)" }}>For Organizations</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link href="/corporate-portal?tab=post-jobs" className="hover:text-white transition-colors">Post a Job</Link></li>
              <li><Link href="/corporate-portal?tab=partner" className="hover:text-white transition-colors">Partner With Us</Link></li>
              <li><Link href="/support-funding" className="hover:text-white transition-colors">Donate</Link></li>
              <li><Link href="/community-captains" className="hover:text-white transition-colors">Become a Captain</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3" style={{ color: "hsl(43 100% 50%)" }}>About</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link href="/about/mission" className="hover:text-white transition-colors">Our Mission</Link></li>
              <li><Link href="/about/impact" className="hover:text-white transition-colors">Impact Reports</Link></li>
              <li><Link href="/about/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/about/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-sm text-white/40">
            © {new Date().getFullYear()} The Empowerment Bridge. All rights reserved.
          </p>
          <p className="text-sm text-white/40">
            Made with <Heart className="inline w-3 h-3 mx-1" fill="currentColor" style={{ color: "hsl(43 100% 50%)" }} /> for the PWD community in Pakistan
          </p>
        </div>
      </div>
    </footer>
  );
}
