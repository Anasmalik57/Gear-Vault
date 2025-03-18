import Link from "next/link";
import React from "react";

const Navbar = () => {
  return (
    <nav className=" bg-[#0A0F1D] p-4 px-20 shadow-lg  border-b border-gray-700">
      <div className="container mx-auto flex justify-between items-center ">
        {/* Logo Section */}
        <Link href={"/"}>
          <div className="text-3xl font-extrabold text-green-400 tracking-wide">
            GearVault
          </div>
        </Link>

        {/* Nav Links */}
        <ul className="flex space-x-8 text-[#E2E8F0] text-lg font-semibold">
          {[
            { name: "Home", url: "/" },
            { name: "Tools", url: "/tools" },
            { name: "About", url: "/about" },
            { name: "Contact", url: "/contact" },
          ].map((item, index) => (
            <Link href={item.url}
              key={index}
              className="relative cursor-pointer px-4 py-1 translate-y-1 transition-all duration-300 hover:text-green-400 after:block after:content-[''] after:w-full after:h-1 after:bg-green-400 after:scale-x-0 after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100"
            >
              <span className="text-white">{item.name}</span>
            </Link>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
