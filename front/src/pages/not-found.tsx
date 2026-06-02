import { Link } from "wouter";
import { Home, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-muted">
      <div className="text-center max-w-md px-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "hsl(204 60% 92%)" }}>
          <AlertCircle className="w-8 h-8" style={{ color: "hsl(204 100% 36%)" }} />
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page Not Found</h2>
        <p className="text-muted-foreground mb-6 text-sm">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild style={{ background: "hsl(204 100% 36%)" }} className="text-white">
          <Link href="/">
            <Home className="mr-2 w-4 h-4" /> Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
