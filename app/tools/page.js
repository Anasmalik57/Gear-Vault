import Link from "next/link";
import React from "react";

const tools = [
  {
    title: "Image Enhancer",
    description:
      "Automatically enhance brightness, contrast, and sharpness with AI.",
    link_url: "/tools/image-enhancer",
  },
  {
    title: "Meme Generator",
    description: "Increase image resolution without losing quality.",
    link_url: "/tools/meme-generator",
  },
  {
    title: "Background Remover",
    description: "Remove image backgrounds instantly with precision AI.",
    link_url: "/tools/bg-remover",
  },
  
  
];

export default function ToolsPage() {
  return (
    <div className="min-h-[80.5vh] bg-gray-900 text-white py-16 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-green-400">
          Our AI-Powered Tools
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          Explore our powerful suite of tools designed to enhance your images
          effortlessly.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 max-w-6xl mx-auto">
        {tools.map((tool, index) => (
          <Link href={tool.link_url} key={index}>
            <div
              key={index}
              className="p-6 cursor-pointer bg-gray-800 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl text-center hover:bg-gray-700"
            >
              <h3 className="text-xl font-semibold mt-4 text-white">{tool.title}</h3>
              <p className="text-gray-400 mt-2">{tool.description}</p>
              <button className="mt-4  cursor-pointer bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all duration-300 hover:scale-110">
                Try Now
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
