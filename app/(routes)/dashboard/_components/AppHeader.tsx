"use client";

import React, { useEffect, useState } from "react";
import { Icons } from "@/components/icons";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Drawer from "./drawer";
import { UserButton } from "@clerk/nextjs";
import dynamic from "next/dynamic";

const menuItems = [
  {
    id: 1,
    label: "Home",
    href: "/",
  },
  {
    id: 2,
    label: "Chatbot",
    href: "/chatbot",
  },
  {
    id: 3,
    label: "Appointment",
    href: "/appointment",
  },
];

function AppHeader() {
  const [addBorder, setAddBorder] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setAddBorder(true);
      } else {
        setAddBorder(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const Spline = dynamic(() => import("../SplineWrapper"), {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="text-4xl mb-4">🎨</div>
          <div className="text-gray-500">Loading 3D Scene...</div>
        </div>
      </div>
    ),
  });

  return (
    <header className={`navbar ${addBorder ? "with-border" : ""}`}>
      <div className="header-container">
        <Link
          href="/"
          title="brand-logo"
          className="relative mr-6 flex items-center space-x-2 px-0 "
        >
          <Icons.logo className="logo" />
          <span className="logoname">{siteConfig.name}</span>
        </Link>

        <div className="desktop-menu">
          <div className="menu-items ">
            <nav>
              {menuItems.map((item) => (
                <Link key={item.id} href={item.href} className="btn-outline">
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="btn-primary">
              <UserButton />
            </div>
          </div>
        </div>

        {/* <div className="mt-2 cursor-pointer block lg:hidden">
          <Drawer />
        </div> */}
      </div>
      <hr
        className={cn(
          "absolute w-full bottom-0 transition-opacity duration-300 ease-in-out",
          addBorder ? "opacity-100" : "opacity-0"
        )}
      />
    </header>
  );
}

export default AppHeader;
