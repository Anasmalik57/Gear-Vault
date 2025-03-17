"use client";
import Link from "next/link";
import { useEffect } from "react";

const Home = () => {
  // Add scroll effect for smooth scrolling
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const features = [
    {
      title: "Smart AI Enhancement",
      description:
        "Automatically optimize brightness, contrast, and sharpness using neural networks",
      emoji: "✨",
    },
    {
      title: "Batch Processing",
      description:
        "Enhance multiple images at once with our bulk processing tools",
      emoji: "📸",
    },
    {
      title: "Instant Downloads",
      description: "Get your enhanced images in maximum resolution instantly",
      emoji: "⬇️",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0F1D] text-white overflow-x-hidden">
      {/* Hero Section */}
      <section
        className="h-screen flex flex-col justify-center items-center text-center px-4 relative"
        aria-label="Hero section"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none ">
          <div className="absolute -top-32 -left-32 w-92 h-92 bg-gradient-to-r from-green-400/20 to-transparent rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-32 -right-32 w-92 h-92 bg-gradient-to-l from-green-400/20 to-transparent rounded-full blur-3xl animate-pulse" />
        </div>

        <h1 className="text-5xl pb-1.5 md:text-7xl font-bold mb-6 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent animate-fade-in-down">
          Transform Your Images
        </h1>

        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl animate-fade-in-up animation-delay-200">
          Elevate your visuals with AI-powered enhancement tools that work like
          magic
        </p>

        <div className="flex gap-4 animate-scale-in animation-delay-400">
          <Link href={"/image-enhancer"}>
            <button
              className="bg-green-400 cursor-pointer text-[#0A0F1D] px-8 py-3 rounded-full text-lg font-semibold hover:bg-green-500 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400"
              aria-label="Get started with image transformation"
            >
              <span className="mr-2">✨</span>
              Get Started
            </button>
          </Link>
          <button
            className="border border-green-400 text-green-400 px-8 py-3 rounded-full text-lg font-semibold hover:bg-green-400/10 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400"
            aria-label="Try image transformation for free"
          >
            Try for Free
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20" aria-label="Features section">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent animate-fade-in-down">
            Why Choose Us?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 md:px-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-[#1A1F2D] p-8 rounded-2xl border border-gray-800 hover:border-green-400/30 transition-all duration-300 group transform hover:-translate-y-2 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="mb-6">
                  <div className="p-4 bg-[#0A0F1D] rounded-xl w-max group-hover:bg-green-400/10 transition-colors duration-300 text-4xl">
                    {feature.emoji}
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-20 bg-gradient-to-br from-[#0A0F1D] to-[#1A1F2D]"
        aria-label="Call to action section"
      >
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto animate-scale-in">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Transform Your Images?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of creators who trust our enhancement tools
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="bg-green-400 text-[#0A0F1D] px-8 py-3 rounded-full text-lg font-semibold hover:bg-green-500 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400"
                aria-label="Start enhancing images now"
              >
                <span className="mr-2">✨</span>
                Start Enhancing Now
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
