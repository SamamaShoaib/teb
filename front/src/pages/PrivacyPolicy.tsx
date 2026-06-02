import { Card, CardContent } from "@/components/ui/card";

const sections = [
  {
    title: "1. Information we collect",
    body: "When you create a TEB account we collect your name, email address, role (PWD member, employer, captain, or donor), and any profile details you choose to share. When you apply for grants or jobs we also collect the information required to evaluate that application, such as disability category, work history, or organization details.",
  },
  {
    title: "2. How we use your information",
    body: "We use your information to operate the TEB platform: matching PWDs to opportunities, processing grant applications, connecting captains and mentors, and notifying you about activity on your account. We never sell your data, and we only share it with third parties when it is strictly required to deliver a service you requested.",
  },
  {
    title: "3. Sensitive data and disability information",
    body: "Disability-related information is treated as sensitive personal data in line with Pakistan's data protection legislation, including the Personal Data Protection Bill and the Prevention of Electronic Crimes Act, 2016. Access is restricted to authorized staff and verified community captains, and it is only used to determine eligibility for grants, jobs, or community programs that you opt into.",
  },
  {
    title: "4. Your rights",
    body: "You can access, update, or delete your account information at any time from your dashboard, or by contacting our team. You may also withdraw any pending grant application and request that the underlying data be deleted, subject to legal retention requirements for completed financial transactions.",
  },
  {
    title: "5. Cookies and analytics",
    body: "We use a small number of essential cookies to keep you signed in and remember your preferences. We use privacy-friendly analytics to understand which parts of the platform are most useful, but we do not build advertising profiles based on your activity.",
  },
  {
    title: "6. Contacting us",
    body: "Questions about this policy or requests related to your data can be sent to privacy@empowermentbridge.pk. We aim to respond within 5 business days.",
  },
];

export default function PrivacyPolicy() {
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
            Privacy Policy
          </h1>
          <p className="text-white/85 max-w-2xl mx-auto leading-relaxed">
            How The Empowerment Bridge collects, uses, and protects your
            information.
          </p>
          <p className="text-white/70 text-xs mt-3">
            Last updated: April 2026
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border border-border bg-white">
            <CardContent className="p-6 sm:p-8 space-y-6">
              {sections.map((s) => (
                <div key={s.title}>
                  <h2 className="text-base font-bold text-foreground mb-2">
                    {s.title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {s.body}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
