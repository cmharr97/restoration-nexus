import Navigation from "@/components/Navigation";
import { HomeHQ } from "@/components/home/HomeHQ";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="lg:ml-64 mt-16 p-6">
        <div className="max-w-6xl mx-auto">
          <HomeHQ />
        </div>
      </main>
    </div>
  );
}
