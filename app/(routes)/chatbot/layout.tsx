"use client";
import React from "react";
import "./chatbot.css";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import AppHeader from "./components/AppHeader";

function ChatbotLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen">
      <AppHeader />
      {children}
      <Footer />
    </div>
  );
}

export default ChatbotLayout;
