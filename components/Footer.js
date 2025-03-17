import React from "react";

const Footer = () => {
  return (
    <footer className="w-full bg-[#0A0F1D] p-6 border-t border-gray-700 text-center text-sm font-light  text-gray-400 flex flex-col items-center">
      &copy; {new Date().getFullYear()} ToolsLibrary. All rights reserved.
    </footer>
  );
};

export default Footer;
