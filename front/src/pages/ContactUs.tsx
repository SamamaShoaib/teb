import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function ContactUs() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setStatusMessage("Sending your message...");
    window.setTimeout(() => {
      setSubmitting(false);
      setName("");
      setEmail("");
      setMessage("");
      setStatusMessage(
        "Message sent. Our team will get back to you within 2 business days.",
      );
      toast({
        title: "Message received",
        description:
          "Thanks for reaching out — our team will get back to you within 2 business days.",
      });
    }, 600);
  }

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
            Contact Us
          </h1>
          <p className="text-white/85 max-w-2xl mx-auto leading-relaxed">
            Questions, partnership ideas, or feedback — we'd love to hear from
            you.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border border-border bg-white">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-foreground mb-1">
                  Send us a message
                </h2>
                <p className="text-sm text-muted-foreground mb-2">
                  Fill in the form below and our team will respond within 2
                  business days.
                </p>
                <p className="text-xs text-muted-foreground italic mb-5">
                  Demo form — messages are not yet persisted.
                </p>
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4"
                  aria-busy={submitting}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contact-name">Your name</Label>
                      <Input
                        id="contact-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        autoComplete="name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-email">Email address</Label>
                      <Input
                        id="contact-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="contact-message">Message</Label>
                    <Textarea
                      id="contact-message"
                      rows={6}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      placeholder="How can we help?"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={submitting}
                    style={{ background: "var(--teb-trust-blue)" }}
                    className="text-white rounded-full"
                  >
                    {submitting ? "Sending..." : "Send message"}
                    <Send className="ml-2 w-4 h-4" />
                  </Button>
                  <div
                    role="status"
                    aria-live="polite"
                    className="sr-only"
                  >
                    {statusMessage}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="border border-border bg-white">
              <CardContent className="p-5">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                  style={{
                    background: "var(--teb-trust-blue)",
                    color: "#fff",
                  }}
                >
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">Email</h3>
                <p className="text-sm text-muted-foreground break-all">
                  hello@empowermentbridge.pk
                </p>
              </CardContent>
            </Card>
            <Card className="border border-border bg-white">
              <CardContent className="p-5">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                  style={{
                    background: "var(--teb-trust-blue)",
                    color: "#fff",
                  }}
                >
                  <Phone className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">Phone</h3>
                <p className="text-sm text-muted-foreground">
                  +92 (42) 3577 0188
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Mon–Fri, 9:00 AM – 6:00 PM PKT
                </p>
              </CardContent>
            </Card>
            <Card className="border border-border bg-white">
              <CardContent className="p-5">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                  style={{
                    background: "var(--teb-trust-blue)",
                    color: "#fff",
                  }}
                >
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">Office</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Gulberg III
                  <br />
                  Lahore, Punjab
                  <br />
                  Pakistan
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
