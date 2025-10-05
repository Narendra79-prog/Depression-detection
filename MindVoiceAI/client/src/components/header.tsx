import { Brain, Shield } from "lucide-react";

export function Header() {
  return (
    <header className="bg-card border-b border-border">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Brain className="text-primary-foreground text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">MindVoice</h1>
              <p className="text-sm text-muted-foreground">Mental Health Assessment</p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground flex items-center">
            <Shield className="mr-1 w-4 h-4" />
            Private & Secure
          </div>
        </div>
      </div>
    </header>
  );
}
