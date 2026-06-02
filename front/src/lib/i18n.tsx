import { createContext, useContext, useState, ReactNode } from "react";

type TranslationKey = 
  | "welcome" 
  | "tagline" 
  | "browseJobs" 
  | "forEmployers" 
  | "talentHub" 
  | "corporatePortal" 
  | "supportFunding" 
  | "communityCaptains"
  | "impact"
  | "languageToggle";

const translations: Record<"en" | "ur", Record<TranslationKey, string>> = {
  en: {
    welcome: "Welcome back",
    tagline: "Bridging Talent, Breaking Barriers",
    browseJobs: "Browse Jobs",
    forEmployers: "For Employers",
    talentHub: "Talent Hub",
    corporatePortal: "Corporate Portal",
    supportFunding: "Support & Funding",
    communityCaptains: "Community Captains",
    impact: "Impact",
    languageToggle: "اردو",
  },
  ur: {
    welcome: "خوش آمدید",
    tagline: "صلاحیت کا ملاپ، رکاوٹوں کا خاتمہ",
    browseJobs: "نوکریاں دیکھیں",
    forEmployers: "آجروں کے لیے",
    talentHub: "ٹیلنٹ ہب",
    corporatePortal: "کارپوریٹ پورٹل",
    supportFunding: "سپورٹ اور فنڈنگ",
    communityCaptains: "کمیونٹی کیپٹنز",
    impact: "اثرات",
    languageToggle: "English",
  }
};

type LanguageContextType = {
  lang: "en" | "ur";
  toggleLang: () => void;
  t: (key: TranslationKey) => string;
  isUrdu: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<"en" | "ur">("en");

  const toggleLang = () => setLang(prev => prev === "en" ? "ur" : "en");
  const t = (key: TranslationKey) => translations[lang][key] || key;
  const isUrdu = lang === "ur";

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t, isUrdu }}>
      <div dir={isUrdu ? "rtl" : "ltr"} className={isUrdu ? "font-urdu" : ""}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useTranslation must be used within LanguageProvider");
  return context;
}
