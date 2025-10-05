import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Home from "./pages/home";
import Demographics from "./pages/demographics";
import PHQ9 from "./pages/phq9";
import VoiceAnalysis from "./pages/voice-analysis";
import Results from "./pages/results";
import NotFound from "./pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/demographics/:assessmentId?" component={Demographics} />
      <Route path="/phq9/:assessmentId" component={PHQ9} />
      <Route path="/voice/:assessmentId" component={VoiceAnalysis} />
      <Route path="/results/:assessmentId" component={Results} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background flex flex-col">
          <Header />
          <main className="flex-1">
            <Router />
          </main>
          <Footer />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
