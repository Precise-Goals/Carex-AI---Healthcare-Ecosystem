"use client";
import React from "react";
import AppHeader from "./_components/AppHeader";
import Footer from "@/components/sections/footer";

function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <AppHeader />
      <div className="px-10 md:px-20 lg:px-24 py-10">{children}</div>
      <Footer />
    </div>
  );
}

export default DashboardLayout;
