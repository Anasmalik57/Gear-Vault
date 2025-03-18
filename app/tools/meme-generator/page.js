"use client";

import { useState, useRef, useEffect } from "react";
import domtoimage from "dom-to-image";
import Head from "next/head";

export default function MemeGenerator() {
  // States
  const [image, setImage] = useState("/default-meme.jpg"); // Default image set
  const [texts, setTexts] = useState([
    { id: 1, content: "TOP TEXT", pos: { x: 50, y: 10 }, fontSize: 40, color: "#ffffff", fontFamily: "Impact", align: "center", bgColor: "#00000000", shadow: true, opacity: 1, rotate: 0, effect: "none" },
    { id: 2, content: "BOTTOM TEXT", pos: { x: 50, y: 80 }, fontSize: 40, color: "#ffffff", fontFamily: "Impact", align: "center", bgColor: "#00000000", shadow: true, opacity: 1, rotate: 0, effect: "none" },
  ]);
  const [stickers, setStickers] = useState([]);
  const [selectedTextId, setSelectedTextId] = useState(null);
  const [selectedStickerId, setSelectedStickerId] = useState(null);
  const [inputText, setInputText] = useState("");
  const [zoom, setZoom] = useState(1);
  const [filter, setFilter] = useState("none");
  const [layers, setLayers] = useState([]);
  const memeRef = useRef(null);


  // Predefined Stickers (11 Types)
  const stickerOptions = [
    { id: 1, src: "https://img.icons8.com/?size=100&id=t7OubmkKRI50&format=png&color=000000 ", alt: "Crying" },
    { id: 2, src: "https://img.icons8.com/?size=100&id=C4AKNdLONtrW&format=png&color=000000", alt: "Laughing" },
    { id: 3, src: "https://img.icons8.com/?size=100&id=QV5JEtrTP6nH&format=png&color=000000", alt: "Fire" },
    { id: 4, src: "https://img.icons8.com/?size=100&id=oEc1O2tvXKUb&format=png&color=000000", alt: "Heart" },
    { id: 5, src: "https://img.icons8.com/?size=100&id=FYJ9HNSqf_uK&format=png&color=000000", alt: "Thumbs Up" },
    { id: 6, src: "https://img.icons8.com/?size=100&id=XBMnwwJYQvfN&format=png&color=000000", alt: "Star" },
    { id: 7, src: "https://img.icons8.com/?size=100&id=0ZNXJnXqu3Lh&format=png&color=000000", alt: "Lightning" },
    { id: 8, src: "https://img.icons8.com/?size=100&id=Q2m4bLp5g5kF&format=png&color=000000", alt: "Car" },
    { id: 11, src: "https://img.icons8.com/?size=100&id=TquwKm18epOW&format=png&color=000000", alt: "Cloud" },
    { id: 12, src: "https://img.icons8.com/?size=100&id=ACi0kAlgSTlE&format=png&color=000000", alt: "Party Popper" },
  ];

  // Load saved project from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("memeProject");
    if (saved) {
      const project = JSON.parse(saved);
      setImage(project.image || "/default-meme.jpg");
      setTexts(project.texts || []);
      setStickers(project.stickers || []);
      setZoom(project.zoom || 1);
      setFilter(project.filter || "none");
    }
  }, []);

  // Save project to localStorage
  const saveProject = () => {
    const project = { image, texts, stickers, zoom, filter };
    localStorage.setItem("memeProject", JSON.stringify(project));
    alert("Project saved successfully!");
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setImage(URL.createObjectURL(file));
    } else {
      alert("Please drop a valid image file!");
    }
  };

  // Add new text field
  const addTextField = () => {
    if (!inputText.trim()) return;
    const newId = texts.length > 0 ? Math.max(...texts.map(t => t.id)) + 1 : 1;
    const newText = { id: newId, content: inputText.toUpperCase(), pos: { x: 50, y: 50 }, fontSize: 40, color: "#ffffff", fontFamily: "Impact", align: "center", bgColor: "#00000000", shadow: true, opacity: 1, rotate: 0, effect: "none" };
    setTexts([...texts, newText]);
    setSelectedTextId(newId);
    setInputText("");
    updateLayers();
  };

  // Add new sticker
  const addSticker = (stickerSrc, alt) => {
    const newId = stickers.length > 0 ? Math.max(...stickers.map(s => s.id)) + 1 : 1;
    setStickers([...stickers, { id: newId, src: stickerSrc, alt, pos: { x: 50, y: 50 }, size: 50, rotate: 0 }]);
    setSelectedStickerId(newId);
    updateLayers();
  };

  // Update selected text properties
  const updateSelectedText = (updates) => {
    setTexts((prev) => prev.map((t) => (t.id === selectedTextId ? { ...t, ...updates } : t)));
    updateLayers();
  };

  // Update selected sticker properties
  const updateSelectedSticker = (updates) => {
    setStickers((prev) => prev.map((s) => (s.id === selectedStickerId ? { ...s, ...updates } : s)));
    updateLayers();
  };

  // Handle selection
  const handleTextSelect = (id) => {
    setSelectedTextId(id);
    setSelectedStickerId(null);
    const selectedText = texts.find((t) => t.id === id);
    if (selectedText) setInputText(selectedText.content);
  };

  const handleStickerSelect = (id) => {
    setSelectedStickerId(id);
    setSelectedTextId(null);
  };

  // Drag handler (for text and stickers)
  const handleDrag = (id, isText) => (e) => {
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
      if (isText) {
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
      } else {
        setStickers((prev) =>
          prev.map((s) =>
            s.id === id
              ? {
                  ...s,
                  pos: {
                    x: Math.max(0, Math.min(100, s.pos.x + deltaX)),
                    y: Math.max(0, Math.min(100, s.pos.y + deltaY)),
                  },
                }
              : s
          )
        );
      }
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

  // Update layers
  const updateLayers = () => {
    setLayers([...texts.map(t => ({ id: t.id, type: "text", visible: true })), ...stickers.map(s => ({ id: s.id, type: "sticker", visible: true }))]);
  };

  // Toggle layer visibility
  const toggleLayerVisibility = (id) => {
    setLayers((prev) =>
      prev.map((layer) => (layer.id === id ? { ...layer, visible: !layer.visible } : layer))
    );
  };

  // Move layer up/down
  const moveLayer = (id, direction) => {
    const index = layers.findIndex((l) => l.id === id);
    if (direction === "up" && index < layers.length - 1) {
      const newLayers = [...layers];
      [newLayers[index], newLayers[index + 1]] = [newLayers[index + 1], newLayers[index]];
      setLayers(newLayers);
    } else if (direction === "down" && index > 0) {
      const newLayers = [...layers];
      [newLayers[index], newLayers[index - 1]] = [newLayers[index - 1], newLayers[index]];
      setLayers(newLayers);
    }
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

    const memeClone = memeRef.current.cloneNode(true);
    document.body.appendChild(memeClone);

    memeClone.style.background = "transparent";
    memeClone.style.border = "none";
    memeClone.style.overflow = "visible";
    memeClone.style.width = `${memeRef.current.offsetWidth}px`;
    memeClone.style.height = `${memeRef.current.offsetHeight}px`;

    const textElements = memeClone.querySelectorAll(".text-shadow");
    texts.forEach((text, index) => {
      if (textElements[index]) {
        textElements[index].style.color = convertToRgb(text.color);
        textElements[index].style.backgroundColor = convertToRgb(text.bgColor);
        textElements[index].style.opacity = text.opacity;
        textElements[index].style.textShadow = text.shadow
          ? "2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000"
          : "none";
        textElements[index].style.transform = `translate(-50%, -50%) rotate(${text.rotate}deg) scale(${1 / zoom})`;
        textElements[index].style.left = `${text.pos.x}%`;
        textElements[index].style.top = `${text.pos.y}%`;
        textElements[index].style.fontSize = `${text.fontSize}px`;
        textElements[index].style.fontFamily = text.fontFamily;
        textElements[index].style.textAlign = text.align;
        textElements[index].style.padding = "5px 10px";
        textElements[index].style.borderRadius = "5px";
        textElements[index].style.position = "absolute";
        if (text.effect === "wavy") textElements[index].style.animation = "wavy 0.5s infinite";
        else if (text.effect === "neon") textElements[index].style.textShadow = "0 0 10px #fff, 0 0 20px #0ff, 0 0 30px #0ff";
        else if (text.effect === "bounce") textElements[index].style.animation = "bounce 0.5s infinite";
        else if (text.effect === "pulse") textElements[index].style.animation = "pulse 1s infinite";
        else if (text.effect === "shake") textElements[index].style.animation = "shake 0.5s infinite";
        else if (text.effect === "fade") textElements[index].style.animation = "fade 1s infinite";
        else if (text.effect === "flip") textElements[index].style.animation = "flip 1s infinite";
        else if (text.effect === "spin") textElements[index].style.animation = "spin 1s infinite";
        else if (text.effect === "slide") textElements[index].style.animation = "slide 1s infinite";
        else if (text.effect === "glow") textElements[index].style.textShadow = "0 0 5px #fff, 0 0 10px #f0f, 0 0 15px #f0f";
      }
    });

    const stickerElements = memeClone.querySelectorAll(".sticker");
    stickers.forEach((sticker, index) => {
      if (stickerElements[index]) {
        stickerElements[index].style.transform = `translate(-50%, -50%) rotate(${sticker.rotate}deg) scale(${1 / zoom})`;
        stickerElements[index].style.left = `${sticker.pos.x}%`;
        stickerElements[index].style.top = `${sticker.pos.y}%`;
        stickerElements[index].style.width = `${sticker.size}px`;
        stickerElements[index].style.height = `${sticker.size}px`;
        stickerElements[index].style.position = "absolute";
      }
    });

    const imgElement = memeClone.querySelector("img");
    if (imgElement) {
      imgElement.style.filter = filter;
      if (imgElement.complete === false) {
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
    }
  };

  return (
    <>
      <Head>
        <title>Free Meme Generator - Create Memes Online Free</title>
        <meta name="description" content="Create funny memes for free with our online meme generator. Customize text, colors, fonts, stickers, filters, and more, and download instantly!" />
        <style>{`
          @keyframes wavy {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-15px); }
          }
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          @keyframes shake {
            0% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            50% { transform: translateX(5px); }
            75% { transform: translateX(-5px); }
            100% { transform: translateX(0); }
          }
          @keyframes fade {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @keyframes flip {
            0% { transform: rotateY(0); }
            50% { transform: rotateY(180deg); }
            100% { transform: rotateY(0); }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes slide {
            0% { transform: translateX(-10px); }
            50% { transform: translateX(10px); }
            100% { transform: translateX(-10px); }
          }
        `}</style>
      </Head>

      <div className="min-h-screen bg-[#0A0F1D] text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
          Free Meme Generator
        </h1>

        <div className="w-full max-w-6xl flex flex-col md:flex-row gap-6">
          {/* Left Sidebar - Controls */}
          <div className="w-full md:w-1/4 bg-[#1A1F2D] p-4 rounded-lg shadow-lg sticky top-4 h-[calc(100vh-2rem)] overflow-y-auto">
            <h2 className="text-2xl font-semibold mb-4 text-green-400">Controls</h2>

            {/* Template Selection Commented Out */}
            {/* <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Select Template or Upload Image</label>
              <p className="text-xs text-gray-400 mb-2">Alternatively, drag and drop an image or use the upload option below.</p>
              <select
                value={template?.id || ""}
                onChange={(e) => {
                  const selected = templates.find(t => t.id === parseInt(e.target.value));
                  setTemplate(selected);
                  setImage(selected?.src || "/default-meme.jpg");
                }}
                className="w-full text-gray-300 bg-[#2A2F3D] border border-gray-700 rounded-lg p-2"
              >
                <option value="">None (Default Image)</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div> */}

            {/* Image Upload with Drag and Drop - Updated Instruction */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Upload or Drag & Drop Image</label>
              <p className="text-xs text-gray-400 mb-2">Use your own image by dragging it here or choosing from your system. Default image will remain unless changed.</p>
              <div
                className="w-full text-gray-300 bg-[#2A2F3D] border border-gray-700 rounded-lg p-4 text-center cursor-pointer hover:bg-[#3A3F4D] transition"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="imageUpload"
                />
                <label htmlFor="imageUpload" className="cursor-pointer">
                  Drag and drop an image here, or click to choose from your system
                </label>
              </div>
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
                disabled={!selectedTextId && texts.length === 0}
              />
              <button onClick={addTextField} className="w-full bg-green-500 text-white px-2 py-1 rounded-lg hover:bg-green-600 transition mt-2">
                Add Text
              </button>
            </div>

            {/* Sticker Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Add Sticker</label>
              <div className="flex flex-wrap">
                {stickerOptions.map((sticker) => (
                  <button
                    key={sticker.id}
                    onClick={() => addSticker(sticker.src, sticker.alt)}
                    className="mr-2 mb-2 bg-[#2A2F3D] p-2 rounded-lg hover:bg-green-600"
                    title={sticker.alt}
                  >
                    <img src={sticker.src} alt={sticker.alt} className="w-6 h-6" />
                  </button>
                ))}
              </div>
            </div>

            {/* Layers Management */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Layers</label>
              {layers.map((layer) => {
                const item = [...texts, ...stickers].find((item) => item.id === layer.id);
                return (
                  <div key={layer.id} className="flex justify-between items-center mb-2">
                    <span>{layer.type === "text" ? `Text ${layer.id}` : `Sticker ${layer.id}`}</span>
                    <div>
                      <button
                        onClick={() => toggleLayerVisibility(layer.id)}
                        className="bg-gray-700 text-white px-2 py-1 rounded mr-1 hover:bg-gray-600"
                      >
                        {layer.visible ? "Hide" : "Show"}
                      </button>
                      <button
                        onClick={() => moveLayer(layer.id, "up")}
                        className="bg-gray-700 text-white px-2 py-1 rounded mr-1 hover:bg-gray-600"
                        disabled={layers.indexOf(layer) === layers.length - 1}
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveLayer(layer.id, "down")}
                        className="bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-600"
                        disabled={layers.indexOf(layer) === 0}
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Text/Sticker Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Select Item</label>
              {texts.map((text) => (
                <button
                  key={text.id}
                  onClick={() => handleTextSelect(text.id)}
                  className={`w-full text-left p-2 mb-1 rounded-lg ${selectedTextId === text.id ? "bg-green-500" : "bg-[#2A2F3D]"}`}
                >
                  Text {text.id}: {text.content}
                </button>
              ))}
              {stickers.map((sticker) => (
                <button
                  key={sticker.id}
                  onClick={() => handleStickerSelect(sticker.id)}
                  className={`w-full text-left p-2 mb-1 rounded-lg ${selectedStickerId === sticker.id ? "bg-green-500" : "bg-[#2A2F3D]"}`}
                >
                  Sticker {sticker.id}
                </button>
              ))}
            </div>

            {/* Font Size (for Text) */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Font Size</label>
              <input
                type="range"
                min="20"
                max="80"
                value={selectedTextId ? texts.find((t) => t.id === selectedTextId)?.fontSize : 40}
                onChange={(e) => updateSelectedText({ fontSize: parseInt(e.target.value) })}
                className="w-full"
                disabled={!selectedTextId}
              />
              <span>{selectedTextId ? texts.find((t) => t.id === selectedTextId)?.fontSize : 40}px</span>
            </div>

            {/* Sticker Size */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Sticker Size</label>
              <input
                type="range"
                min="20"
                max="100"
                value={selectedStickerId ? stickers.find((s) => s.id === selectedStickerId)?.size : 50}
                onChange={(e) => updateSelectedSticker({ size: parseInt(e.target.value) })}
                className="w-full"
                disabled={!selectedStickerId}
              />
              <span>{selectedStickerId ? stickers.find((s) => s.id === selectedStickerId)?.size : 50}px</span>
            </div>

            {/* Font Family (for Text) */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Font Family</label>
              <select
                value={selectedTextId ? texts.find((t) => t.id === selectedTextId)?.fontFamily : "Impact"}
                onChange={(e) => updateSelectedText({ fontFamily: e.target.value })}
                className="w-full text-gray-300 bg-[#2A2F3D] border border-gray-700 rounded-lg p-2"
                disabled={!selectedTextId}
              >
                <option value="Impact">Impact</option>
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="Georgia">Georgia</option>
                <option value="Verdana">Verdana</option>
                <option value="Trebuchet MS">Trebuchet MS</option>
                <option value="Comic Sans MS">Comic Sans MS</option>
                <option value="Garamond">Garamond</option>
              </select>
            </div>

            {/* Text Align (for Text) */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Text Align</label>
              <select
                value={selectedTextId ? texts.find((t) => t.id === selectedTextId)?.align : "center"}
                onChange={(e) => updateSelectedText({ align: e.target.value })}
                className="w-full text-gray-300 bg-[#2A2F3D] border border-gray-700 rounded-lg p-2"
                disabled={!selectedTextId}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
                <option value="justify">Justify</option>
              </select>
            </div>

            {/* Text Effects */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Text Effect</label>
              <select
                value={selectedTextId ? texts.find((t) => t.id === selectedTextId)?.effect : "none"}
                onChange={(e) => updateSelectedText({ effect: e.target.value })}
                className="w-full text-gray-300 bg-[#2A2F3D] border border-gray-700 rounded-lg p-2"
                disabled={!selectedTextId}
              >
                <option value="none">None</option>
                <option value="wavy">Wavy</option>
                <option value="neon">Neon</option>
                <option value="bounce">Bounce</option>
                <option value="pulse">Pulse</option>
                <option value="shake">Shake</option>
                <option value="fade">Fade</option>
                <option value="flip">Flip</option>
                <option value="spin">Spin</option>
                <option value="slide">Slide</option>
                <option value="glow">Glow</option>
              </select>
            </div>

            {/* Text Color (for Text) */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Text Color</label>
              <input
                type="color"
                value={selectedTextId ? texts.find((t) => t.id === selectedTextId)?.color : "#ffffff"}
                onChange={(e) => updateSelectedText({ color: e.target.value })}
                className="w-full h-10 rounded-lg"
                disabled={!selectedTextId}
              />
            </div>

            {/* Background Color (for Text) */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Background Color</label>
              <input
                type="color"
                value={selectedTextId ? texts.find((t) => t.id === selectedTextId)?.bgColor : "#00000000"}
                onChange={(e) => updateSelectedText({ bgColor: e.target.value })}
                className="w-full h-10 rounded-lg"
                disabled={!selectedTextId}
              />
            </div>

            {/* Shadow (for Text) */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Shadow</label>
              <input
                type="checkbox"
                checked={selectedTextId ? texts.find((t) => t.id === selectedTextId)?.shadow : true}
                onChange={(e) => updateSelectedText({ shadow: e.target.checked })}
                className="mr-2"
                disabled={!selectedTextId}
              />
              <span>Enable Shadow</span>
            </div>

            {/* Opacity (for Text) */}
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
                disabled={!selectedTextId}
              />
              <span>{((selectedTextId ? texts.find((t) => t.id === selectedTextId)?.opacity : 1) * 100).toFixed(0)}%</span>
            </div>

            {/* Rotate (for Text/Sticker) */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Rotate</label>
              <input
                type="range"
                min="0"
                max="360"
                value={selectedTextId ? texts.find((t) => t.id === selectedTextId)?.rotate : selectedStickerId ? stickers.find((s) => s.id === selectedStickerId)?.rotate : 0}
                onChange={(e) => selectedTextId ? updateSelectedText({ rotate: parseInt(e.target.value) }) : updateSelectedSticker({ rotate: parseInt(e.target.value) })}
                className="w-full"
                disabled={!selectedTextId && !selectedStickerId}
              />
              <span>{selectedTextId ? texts.find((t) => t.id === selectedTextId)?.rotate : selectedStickerId ? stickers.find((s) => s.id === selectedStickerId)?.rotate : 0}°</span>
            </div>

            {/* Filters */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Image Filter</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full text-gray-300 bg-[#2A2F3D] border border-gray-700 rounded-lg p-2"
              >
                <option value="none">None</option>
                <option value="grayscale(100%)">Grayscale</option>
                <option value="sepia(100%)">Sepia</option>
                <option value="blur(5px)">Blur</option>
                <option value="contrast(200%)">Contrast</option>
                <option value="brightness(150%)">Brightness</option>
                <option value="hue-rotate(90deg)">Hue Rotate</option>
                <option value="saturate(200%)">Saturate</option>
                <option value="invert(100%)">Invert</option>
                <option value="opacity(70%)">Opacity</option>
                <option value="drop-shadow(5px 5px 5px gray)">Drop Shadow</option>
              </select>
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

            {/* Actions */}
            <div className="mb-4">
              <button onClick={saveProject} className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 mb-2">
                Save Project
              </button>
              <button onClick={downloadMeme} className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 mb-2">
                Download Meme
              </button>
            </div>
          </div>

          {/* Right Side - Meme Preview */}
          <div className="w-full md:w-3/4">
            <div
              className="relative w-full h-[500px] bg-transparent rounded-lg overflow-hidden border-none border-2 border-dashed border-gray-600"
              ref={memeRef}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <img
                src={image}
                alt="Meme background"
                className="w-full h-full object-contain select-none"
                style={{ transform: `scale(${zoom})`, transformOrigin: "center", filter }}
              />
              {layers
                .filter((layer) => layer.visible)
                .map((layer) => {
                  if (layer.type === "text") {
                    const text = texts.find((t) => t.id === layer.id);
                    return text ? (
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
                          textShadow: text.shadow
                            ? "2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000"
                            : "none",
                          padding: "5px 10px",
                          borderRadius: "5px",
                          animation: text.effect === "wavy" ? "wavy 0.5s infinite" :
                                   text.effect === "bounce" ? "bounce 0.5s infinite" :
                                   text.effect === "pulse" ? "pulse 1s infinite" :
                                   text.effect === "shake" ? "shake 0.5s infinite" :
                                   text.effect === "fade" ? "fade 1s infinite" :
                                   text.effect === "flip" ? "flip 1s infinite" :
                                   text.effect === "spin" ? "spin 1s infinite" :
                                   text.effect === "slide" ? "slide 1s infinite" :
                                   text.effect === "glow" ? "none" : "none",
                          ...(text.effect === "neon" && {
                            textShadow: "0 0 10px #fff, 0 0 20px #0ff, 0 0 30px #0ff",
                          }),
                          ...(text.effect === "glow" && {
                            textShadow: "0 0 5px #fff, 0 0 10px #f0f, 0 0 15px #f0f",
                          }),
                        }}
                        onMouseDown={handleDrag(text.id, true)}
                        onClick={() => handleTextSelect(text.id)}
                      >
                        {text.content}
                      </div>
                    ) : null;
                  } else if (layer.type === "sticker") {
                    const sticker = stickers.find((s) => s.id === layer.id);
                    return sticker ? (
                      <img
                        key={sticker.id}
                        src={sticker.src}
                        alt={sticker.alt}
                        className="absolute sticker select-none cursor-move"
                        style={{
                          left: `${sticker.pos.x}%`,
                          top: `${sticker.pos.y}%`,
                          transform: `translate(-50%, -50%) rotate(${sticker.rotate}deg)`,
                          width: `${sticker.size}px`,
                          height: `${sticker.size}px`,
                        }}
                        onMouseDown={handleDrag(sticker.id, false)}
                        onClick={() => handleStickerSelect(sticker.id)}
                      />
                    ) : null;
                  }
                  return null;
                })}
              {image === "/default-meme.jpg" && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-lg bg-black bg-opacity-50">
                  Drag and drop an image here or click to choose from your system!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}