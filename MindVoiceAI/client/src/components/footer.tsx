import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Shield className="text-accent w-4 h-4" />
            <span className="text-sm text-muted-foreground">All data processed locally and securely</span>
          </div>
          <p className="text-xs text-muted-foreground">
            This assessment is for informational purposes only and is not a substitute for professional medical advice.
            Always consult with a qualified healthcare provider for proper diagnosis and treatment.
          </p>
          <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Use</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
