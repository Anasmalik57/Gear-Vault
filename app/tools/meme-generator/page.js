"use client";

import { useState, useRef } from "react";
import domtoimage from "dom-to-image";
import Head from "next/head";

export default function MemeGenerator() {
  const [image, setImage] = useState("/default-meme.jpg");
  const [texts, setTexts] = useState([
    { id: 1, content: "TOP TEXT", pos: { x: 50, y: 10 }, fontSize: 40, color: "#ffffff", fontFamily: "Impact", align: "center", bgColor: "#00000000", shadow: true, opacity: 1, rotate: 0 },
    { id: 2, content: "BOTTOM TEXT", pos: { x: 50, y: 80 }, fontSize: 40, color: "#ffffff", fontFamily: "Impact", align: "center", bgColor: "#00000000", shadow: true, opacity: 1, rotate: 0 },
  ]);
  const [selectedTextId, setSelectedTextId] = useState(null);
  const [inputText, setInputText] = useState("");
  const memeRef = useRef(null);
  const [zoom, setZoom] = useState(1);

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  // Add new text field
  const addTextField = () => {
    if (!inputText.trim()) return;
    const newId = texts.length > 0 ? Math.max(...texts.map(t => t.id)) + 1 : 1;
    setTexts([...texts, { id: newId, content: inputText.toUpperCase(), pos: { x: 50, y: 50 }, fontSize: 40, color: "#ffffff", fontFamily: "Impact", align: "center", bgColor: "#00000000", shadow: true, opacity: 1, rotate: 0 }]);
    setSelectedTextId(newId);
    setInputText("");
  };

  // Update selected text properties
  const updateSelectedText = (updates) => {
    setTexts((prev) => prev.map((t) => (t.id === selectedTextId ? { ...t, ...updates } : t)));
  };

  // Handle text selection
  const handleTextSelect = (id) => {
    setSelectedTextId(id);
    const selectedText = texts.find((t) => t.id === id);
    if (selectedText) setInputText(selectedText.content);
  };

  // Smooth drag handler for text (percentage-based)
  const handleTextDrag = (id) => (e) => {
    e.preventDefault();
    const container = memeRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;
    let lastX = startX;
    let lastY = startY;

    const handleMouseMove = (moveEvent) => {
      moveEvent.preventDefault();
      const newX = moveEvent.clientX - rect.left;
      const newY = moveEvent.clientY - rect.top;
      const deltaX = ((newX - lastX) / rect.width) * 100 / zoom;
      const deltaY = ((newY - lastY) / rect.height) * 100 / zoom;
      setTexts((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                pos: {
                  x: Math.max(0, Math.min(100, t.pos.x + deltaX)),
                  y: Math.max(0, Math.min(100, t.pos.y + deltaY)),
                },
              }
            : t
        )
      );
      lastX = newX;
      lastY = newY;
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Convert color to RGB
  const convertToRgb = (hex) => {
    if (!hex) return "rgb(0, 0, 0)";
    let color = hex.replace("#", "");
    if (color.length === 3) color = color.split('').map(c => c + c).join('');
    if (color.length !== 6) return "rgb(0, 0, 0)";
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);
    return `rgb(${r}, ${g}, ${b})`;
  };

  // Download meme
  const downloadMeme = () => {
    if (!memeRef.current) {
      alert("Meme not ready for download!");
      return;
    }

    // Clone the meme container
    const memeClone = memeRef.current.cloneNode(true);
    document.body.appendChild(memeClone);

    // Remove container background, border, and extra styles
    memeClone.style.background = "transparent";
    memeClone.style.border = "none";
    memeClone.style.overflow = "visible";
    memeClone.style.width = `${memeRef.current.offsetWidth}px`;
    memeClone.style.height = `${memeRef.current.offsetHeight}px`;

    // Apply styles to text elements with converted RGB colors and percentage positioning
    const textElements = memeClone.querySelectorAll(".text-shadow");
    texts.forEach((text, index) => {
      if (textElements[index]) {
        textElements[index].style.color = convertToRgb(text.color);
        textElements[index].style.backgroundColor = convertToRgb(text.bgColor);
        textElements[index].style.opacity = text.opacity;
        textElements[index].style.textShadow = text.shadow
          ? "2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000"
          : "none";
        textElements[index].style.transform = `translate(-50%, -50%) rotate(${text.rotate}deg) scale(${1 / zoom})`; // Adjust for zoom
        textElements[index].style.left = `${text.pos.x}%`;
        textElements[index].style.top = `${text.pos.y}%`;
        textElements[index].style.fontSize = `${text.fontSize}px`;
        textElements[index].style.fontFamily = text.fontFamily;
        textElements[index].style.textAlign = text.align;
        textElements[index].style.padding = "5px 10px";
        textElements[index].style.borderRadius = "5px";
        textElements[index].style.position = "absolute";
      }
    });

    // Ensure image is loaded and apply zoom
    const imgElement = memeClone.querySelector("img");
    if (imgElement && imgElement.complete === false) {
      imgElement.onload = () => {
        domtoimage
          .toPng(memeClone, {
            quality: 1,
            width: memeRef.current.offsetWidth,
            height: memeRef.current.offsetHeight,
            style: {
              transform: `scale(${zoom})`,
              transformOrigin: "center",
            },
          })
          .then((dataUrl) => {
            const link = document.createElement("a");
            link.download = "meme.png";
            link.href = dataUrl;
            link.click();
          })
          .catch((error) => {
            console.error("Error generating meme:", error);
            alert("Failed to download meme! Check console for details.");
          })
          .finally(() => {
            document.body.removeChild(memeClone);
          });
      };
    } else {
      domtoimage
        .toPng(memeClone, {
          quality: 1,
          width: memeRef.current.offsetWidth,
          height: memeRef.current.offsetHeight,
          style: {
            transform: `scale(${zoom})`,
            transformOrigin: "center",
          },
        })
        .then((dataUrl) => {
          const link = document.createElement("a");
          link.download = "meme.png";
          link.href = dataUrl;
          link.click();
        })
        .catch((error) => {
          console.error("Error generating meme:", error);
          alert("Failed to download meme! Check console for details.");
        })
        .finally(() => {
          document.body.removeChild(memeClone);
        });
    }
  };

  return (
    <>
      <Head>
        <title>Free Meme Generator - Create Memes Online Free</title>
        <meta name="description" content="Create funny memes for free with our online meme generator. Customize text, colors, and fonts, and download instantly!" />
      </Head>

      <div className="min-h-screen bg-[#0A0F1D] text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
          Free Meme Generator
        </h1>

        <div className="w-full max-w-6xl flex flex-col md:flex-row gap-6">
          {/* Left Sidebar - Controls */}
          <div className="w-full md:w-1/4 bg-[#1A1F2D] p-4 rounded-lg shadow-lg sticky top-4 h-[calc(100vh-2rem)] overflow-y-auto">
            <h2 className="text-2xl font-semibold mb-4 text-green-400">Controls</h2>

            {/* Image Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Upload Image</label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-gray-300 bg-[#2A2F3D] border border-gray-700 rounded-lg p-2" />
            </div>

            {/* Text Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Enter Text</label>
              <input
                type="text"
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  if (selectedTextId) updateSelectedText({ content: e.target.value.toUpperCase() });
                }}
                className="w-full text-gray-300 bg-[#2A2F3D] border border-gray-700 rounded-lg p-2"
                placeholder="Type your text here..."
              />
              <button onClick={addTextField} className="w-full bg-green-500 text-white px-2 py-1 rounded-lg hover:bg-green-600 transition mt-2">
                Add Text
              </button>
            </div>

            {/* Text List */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Select Text</label>
              {texts.map((text) => (
                <button
                  key={text.id}
                  onClick={() => handleTextSelect(text.id)}
                  className={`w-full text-left p-2 mb-1 rounded-lg ${selectedTextId === text.id ? "bg-green-500" : "bg-[#2A2F3D]"}`}
                >
                  Text {text.id}: {text.content}
                </button>
              ))}
            </div>

            {/* Font Size */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Font Size</label>
              <input
                type="range"
                min="20"
                max="80"
                value={selectedTextId ? texts.find((t) => t.id === selectedTextId)?.fontSize : 40}
                onChange={(e) => updateSelectedText({ fontSize: parseInt(e.target.value) })}
                className="w-full"
              />
              <span>{selectedTextId ? texts.find((t) => t.id === selectedTextId)?.fontSize : 40}px</span>
            </div>

            {/* Font Family */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Font Family</label>
              <select
                value={selectedTextId ? texts.find((t) => t.id === selectedTextId)?.fontFamily : "Impact"}
                onChange={(e) => updateSelectedText({ fontFamily: e.target.value })}
                className="w-full text-gray-300 bg-[#2A2F3D] border border-gray-700 rounded-lg p-2"
              >
                <option value="Impact">Impact</option>
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
              </select>
            </div>

            {/* Text Align */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Text Align</label>
              <select
                value={selectedTextId ? texts.find((t) => t.id === selectedTextId)?.align : "center"}
                onChange={(e) => updateSelectedText({ align: e.target.value })}
                className="w-full text-gray-300 bg-[#2A2F3D] border border-gray-700 rounded-lg p-2"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>

            {/* Text Color */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Text Color</label>
              <input
                type="color"
                value={selectedTextId ? texts.find((t) => t.id === selectedTextId)?.color : "#ffffff"}
                onChange={(e) => updateSelectedText({ color: e.target.value })}
                className="w-full h-10 rounded-lg"
              />
            </div>

            {/* Background Color */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Background Color</label>
              <input
                type="color"
                value={selectedTextId ? texts.find((t) => t.id === selectedTextId)?.bgColor : "#00000000"}
                onChange={(e) => updateSelectedText({ bgColor: e.target.value })}
                className="w-full h-10 rounded-lg"
              />
            </div>

            {/* Shadow */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Shadow</label>
              <input
                type="checkbox"
                checked={selectedTextId ? texts.find((t) => t.id === selectedTextId)?.shadow : true}
                onChange={(e) => updateSelectedText({ shadow: e.target.checked })}
                className="mr-2"
              />
              <span>Enable Shadow</span>
            </div>

            {/* Opacity */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Opacity</label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={selectedTextId ? texts.find((t) => t.id === selectedTextId)?.opacity : 1}
                onChange={(e) => updateSelectedText({ opacity: parseFloat(e.target.value) })}
                className="w-full"
              />
              <span>{((selectedTextId ? texts.find((t) => t.id === selectedTextId)?.opacity : 1) * 100).toFixed(0)}%</span>
            </div>

            {/* Rotate */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Rotate Text</label>
              <input
                type="range"
                min="0"
                max="360"
                value={selectedTextId ? texts.find((t) => t.id === selectedTextId)?.rotate : 0}
                onChange={(e) => updateSelectedText({ rotate: parseInt(e.target.value) })}
                className="w-full"
              />
              <span>{selectedTextId ? texts.find((t) => t.id === selectedTextId)?.rotate : 0}°</span>
            </div>

            {/* Zoom */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Zoom Image</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full"
              />
              <span>{(zoom * 100).toFixed(0)}%</span>
            </div>
          </div>

          {/* Right Side - Meme Preview */}
          <div className="w-full md:w-3/4">
            <div className="relative w-full h-[500px] bg-transparent rounded-lg overflow-hidden border-none" ref={memeRef}>
              <img
                src={image}
                alt="Meme background"
                className="w-full h-full object-contain select-none"
                style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
              />
              {texts.map((text) => (
                <div
                  key={text.id}
                  className="absolute text-shadow uppercase select-none cursor-move"
                  style={{
                    left: `${text.pos.x}%`,
                    top: `${text.pos.y}%`,
                    transform: `translate(-50%, -50%) rotate(${text.rotate}deg)`,
                    fontSize: `${text.fontSize}px`,
                    color: text.color,
                    fontFamily: text.fontFamily,
                    textAlign: text.align,
                    backgroundColor: text.bgColor,
                    opacity: text.opacity,
                    textShadow: text.shadow ? "2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000" : "none",
                    padding: "5px 10px",
                    borderRadius: "5px",
                  }}
                  onMouseDown={handleTextDrag(text.id)}
                  onClick={() => handleTextSelect(text.id)}
                >
                  {text.content}
                </div>
              ))}
            </div>
            <button
              onClick={downloadMeme}
              className="mt-4 bg-gradient-to-tl from-green-500 to-emerald-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-600 transition-all duration-300"
            >
              Download Meme
            </button>
          </div>
        </div>
      </div>
    </>
  );
}