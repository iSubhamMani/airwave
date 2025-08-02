import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Camera, ChevronDown, Play, Shield, Users, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Gradient Background with 45-degree angle */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-green-600 via-green-800 to-black"
          style={{
            background: `
              radial-gradient(circle at 20% 80%, rgba(22, 163, 74, 0.3), transparent 50%), /* Green tint */
              radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1), transparent 50%),
              linear-gradient(135deg, #16a34a 0%, #15803d 20%, #166534 25%, #000000 60%)
            `,
          }}
        />

        {/* Grainy Texture Overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Airwave
          </h1>

          <p className="text-balance text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
            Your all-in-one studio to stream, record, and go live with ease.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button className="group bg-green-500 text-black hover:bg-green-400 font-semibold cursor-pointer shadow-xl transition-all duration-150 ease-in-out hover:shadow-[0_0_15px_rgba(22,163,74,0.7)]">
              <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Start Streaming
            </Button>
            <Button
              variant="outline"
              className="border-gray-400 text-white shadow-xl hover:bg-white hover:text-black bg-transparent cursor-pointer"
            >
              Watch Demo
            </Button>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>10K+ Creators</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Ultra-Low Latency</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Enterprise Security</span>
            </div>
          </div>
          <div className="flex justify-center">
            <ChevronDown className="w-8 h-8 text-white animate-bounce mt-12" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Everything You Need to
              <span className="block text-green-400">Go Live</span>
            </h2>
            <p className="text-xl text-green-200 max-w-2xl mx-auto">
              Professional-grade streaming tools that make live podcasting
              effortless
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Play className="w-8 h-8" />,
                title: "Multi-Platform",
                description:
                  "Stream simultaneously to all major platforms and social networks.",
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Ultra-Low Latency",
                description:
                  "Sub-second latency ensures real-time interaction with your listeners.",
              },
              {
                icon: <Camera className="w-8 h-8" />,
                title: "Local Recording",
                description:
                  "Record high-quality audio and video locally for post-production.",
              },
            ].map((feature, index) => (
              <Card key={index} className="bg-green-800/20 border-green-800">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center text-green-400 mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-white font-bold text-xl">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-green-200 text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
