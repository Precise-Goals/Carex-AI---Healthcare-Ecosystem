"use client";

import { Icons } from "@/components/icons";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
// import "./Header.css"; // Import your custom CSS file

export default function Header() {
  const [addBorder, setAddBorder] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user, isLoaded: userLoaded } = useUser();

  useEffect(() => {
    const handleScroll = () => {
      setAddBorder(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (userLoaded) {
      setIsLoaded(true);
    }
  }, [userLoaded]);

  // Don't render user-dependent content until loaded to prevent hydration mismatch
  if (!isLoaded) {
    return (
      <header className="navbar">
        <div className="header-container">
          <Link href="/" title="brand-logo" className="brand">
            <Icons.logo className="logo" />
            <span className="logoname">{siteConfig.name}</span>
          </Link>

          <div className="desktop-menu">
            <div className="menu-items">
              <Link href="/sign-in" className="btn-outline">
                Login
              </Link>
              <Link href="/sign-up" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={`navbar ${addBorder ? "with-border" : ""}`}>
      <div className="header-container">
        <Link href="/" title="brand-logo" className="brand">
          <Icons.logo className="logo" />
          <span className="logoname">{siteConfig.name}</span>
        </Link>

        <div className="desktop-menu">
          <div className="menu-items">
            <Link href={"/chatbot"} className="btn-outline">Chatbot</Link>
            <Link href={"/appointment"} className="btn-outline">Appointment</Link>
            <Link
              href={user ? "/dashboard" : "/sign-in"}
              className="btn-outline"
            >
              {user ? "Dashboard" : "Login"}
            </Link>
            {user && <UserButton />}
            {!user && (
              <Link href="/sign-up" className="btn-primary">
                Get Started
              </Link>
            )}
          </div>
        </div>

        {/* <div className="mobile-menu">
          <div className="menu-items">
            <Link
              href={user ? "/dashboard" : "/sign-in"}
              className="btn-outline"
            >
              {user ? "Dashboard" : "Login"}
            </Link>
            <UserButton />
          </div>
        </div> */}
      </div>
        </header>
  );
}
