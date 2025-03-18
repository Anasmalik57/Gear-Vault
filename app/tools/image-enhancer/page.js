"use client";

import { useState, useRef, useEffect } from "react";

export default function ImageEnhancer() {
  const [originalImage, setOriginalImage] = useState(null);
  const [enhancedImage, setEnhancedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dividerPosition, setDividerPosition] = useState(50); // Percentage
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const dropdownRef = useRef(null);

  // Handle file upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setOriginalImage(URL.createObjectURL(file));
    setEnhancedImage(null);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("format", "jpeg");

    try {
      const response = await fetch("/api/enhance", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to enhance image");

      const data = await response.json();
      console.log("Enhanced Image Data:", data.enhancedImage); // Debugging
      setEnhancedImage(data.enhancedImage);
    } catch (error) {
      console.error("Error enhancing image:", error);
      alert("Failed to enhance image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle divider drag
  const handleMouseDown = (e) => {
    e.preventDefault(); // Prevent text selection
    const container = containerRef.current;
    if (!container) return;

    const containerWidth = container.offsetWidth;
    const startX = e.clientX;

    const handleMouseMove = (moveEvent) => {
      moveEvent.preventDefault(); // Prevent text selection during drag
      const deltaX = moveEvent.clientX - startX;
      const newPosition = (deltaX / containerWidth) * 100 + dividerPosition;
      setDividerPosition(Math.max(0, Math.min(100, newPosition)));
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // Handle format selection and trigger download
  const handleFormatSelect = async (format) => {
    setIsDropdownOpen(false);

    const formData = new FormData();
    const response = await fetch(originalImage);
    const blob = await response.blob();
    const file = new File([blob], "image", { type: blob.type });
    formData.append("image", file);
    formData.append("format", format);

    try {
      setIsLoading(true);
      const enhanceResponse = await fetch("/api/enhance", {
        method: "POST",
        body: formData,
      });

      if (!enhanceResponse.ok) throw new Error("Failed to enhance image");

      const data = await enhanceResponse.json();
      const enhancedBase64 = data.enhancedImage;

      const base64Data = enhancedBase64.split(",")[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const mimeType = format === "png" ? "image/png" : "image/jpeg";
      const blob = new Blob([byteArray], { type: mimeType });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `enhanced-image.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading image:", error);
      alert("Failed to download image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full min-h-[80.5vh] *:w-full text-white flex flex-col items-center justify-center py-2 px-4">
      {/* Upload Section */}
      {!originalImage && (
        <section
          className="text-center animate-fade-in-down max-w-lg mx-auto"
          aria-label="Upload image section"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            Enhance Your Image
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8">
            Upload an image to see the power of AI enhancement in action.
          </p>
          <label
            htmlFor="image-upload"
            className="cursor-pointer text-white bg-green-400 px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-500 transition-all duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <span className="mr-2">📸</span>
            Upload Image
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            aria-label="Upload image to enhance"
          />
        </section>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center animate-pulse">
          <p className="text-xl md:text-2xl text-gray-300">
            Processing your image...
          </p>
        </div>
      )}

      {/* Before and After Comparison */}
      {originalImage && enhancedImage && !isLoading && (
        <section
          className="w-full max-w-5xl bg-[#1A1F2D] rounded-2xl shadow-2xl p-6"
          aria-label="Before and after comparison"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent flex justify-between items-center">
            <span>Before & After</span>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="bg-gradient-to-tl from-green-500 to-emerald-500 cursor-pointer text-[#fff] px-4 py-2 rounded-full text-lg font-semibold hover:bg-green-500 transition-all duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400 flex items-center gap-1.5"
                aria-label="Download enhanced image"
              >
                Download
                <span className="font-bold w-[18px]">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m7 10l5 5l5-5m-5 5V3m10 12v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4"
                    />
                  </svg>
                </span>
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#1A1F2D] rounded-lg shadow-xl border border-gray-800 z-10 animate-fade-in-down">
                  <ul className="absolute right-0 z-50 mt-2 w-48 md:w-56 bg-gray-800 text-white rounded-lg shadow-lg overflow-hidden *:cursor-pointer *:transition-all *:duration-100 *:ease-in">
                    {["png", "jpg", "jpeg"].map((format) => (
                      <li
                        key={format}
                        onClick={() => handleFormatSelect(format)}
                        className="text-white px-4 md:px-5 py-2 md:py-2.5 text-sm hover:bg-gray-700"
                      >
                        {format.toUpperCase()}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </h2>

          <div
            className="relative w-full h-[400px] md:h-[450px] overflow-hidden border border-gray-700"
            ref={containerRef}
            style={{ userSelect: "none" }} // Prevent text selection
          >
            {/* Original Image (Before) */}
            <img
              src={originalImage}
              alt="Original image before enhancement"
              className="absolute inset-0 w-full h-full object-contain select-none"
              ref={imageRef}
            />
            {/* Enhanced Image (After) */}
            <img
              src={enhancedImage}
              alt="Enhanced image after processing"
              className="absolute inset-0 w-full h-full object-contain select-none"
              style={{ clipPath: `inset(0 ${100 - dividerPosition}% 0 0)` }}
            />
            {/* Draggable Divider */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-green-400 cursor-ew-resize shadow-lg"
              style={{ left: `${dividerPosition}%` }}
              onMouseDown={handleMouseDown}
              role="slider"
              aria-label="Drag to compare before and after images"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={dividerPosition}
            >
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-400 rounded-full w-10 h-10 flex items-center justify-center shadow-md">
                <span className="text-white text-lg">↔</span>
              </div>
            </div>
            {/* Labels */}
            <div className="absolute top-4 left-4 bg-[#0A0F1D] px-4 py-2 rounded-lg text-sm font-semibold text-gray-300 shadow-md">
              Before
            </div>
            <div className="absolute top-4 right-4 bg-[#0A0F1D] px-4 py-2 rounded-lg text-sm font-semibold text-gray-300 shadow-md">
              After
            </div>
          </div>
        </section>
      )}
    </div>
  );
}