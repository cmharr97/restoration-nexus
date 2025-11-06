import Navigation from "@/components/Navigation";
import ScopeGenerator from "@/components/ScopeGenerator";

export default function ScopeGeneratorPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="lg:ml-64 mt-16 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold font-headline mb-2">AI Scope Generator</h1>
            <p className="text-muted-foreground text-lg">
              Upload damage photos and project details to automatically generate comprehensive reconstruction scopes
            </p>
          </div>

          <ScopeGenerator />
        </div>
      </main>
    </div>
  );
}
