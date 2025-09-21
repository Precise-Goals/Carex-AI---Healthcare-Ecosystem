"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import { Icons } from "@/components/icons";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import SplineRat from "./SplineRat";
import SplineRatWith3D from "./SplineRatWith3D";
import Spline from "@splinetool/react-spline";

function HeroTitles() {
  return (
    <div className="flex w-full max-w-2xl flex-col space-y-1 overflow-hidden pt-8">
      <motion.h1
        className="heroh1 text-center text-4xl font-medium leading-tight text-foreground sm:text-5xl md:text-6xl"
        initial={{ filter: "blur(10px)", opacity: 0, y: 50 }}
        animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
        transition={{
          duration: 1,
          ease: [0.16, 1, 0.3, 1],
          staggerChildren: 0.2,
        }}
      >
        {["Carex", "AI"].map((text, index) => (
          <motion.span
            key={index}
            className="inline-block px-1 md:px-2 text-balance font-semibold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: index * 0.2,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {text}
          </motion.span>
        ))}
      </motion.h1>
      <motion.p
        className="mx-auto max-w-2xl text-center text-lg leading-7 text-muted-foreground sm:text-xl sm:leading-9 text-balance"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.6,
          duration: 0.8,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        Experience real-time voice conversations with an AI medical assistant.
      </motion.p>
    </div>
  );
}

function HeroCTA() {
  const [isLoaded, setIsLoaded] = useState(false);
  const { user, isLoaded: userLoaded } = useUser();

  useEffect(() => {
    if (userLoaded) {
      setIsLoaded(true);
    }
  }, [userLoaded]);

  // Don't render user-dependent content until loaded to prevent hydration mismatch
  if (!isLoaded) {
    return (
      <>
        <motion.div
          className="mx-auto mt-6 flex w-full max-w-2xl flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            href="/signin"
            className={cn(
              buttonVariants({ variant: "default" }),
              "w-full sm:w-auto text-background flex gap-2"
            )}
          >
            <Icons.logo className="h-6 w-6" />
            Start a consultation
          </Link>
        </motion.div>
        <motion.p
          className="mt-5 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.8 }}
        ></motion.p>
      </>
    );
  }

  return (
    <>
      <motion.div
        className="dbtn mx-auto mt-6 flex w-full max-w-2xl flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <Link
          href={user ? "/dashboard" : "/signin"}
          className={cn(
            buttonVariants({ variant: "default" }),
            "safas  w-full sm:w-auto text-background flex gap-2 coolbtn"
          )}
        >
          <Icons.logo className="h-6 w-6" />
          {user ? "Dashboard" : "Start a consultation"}
        </Link>
      </motion.div>
      <motion.p
        className="mt-5 text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.8 }}
      >
        {/* 10 credits free. No credit card required. */}
      </motion.p>
    </>
  );
}

function HeroImage() {
  return (
    <motion.div
      className="relative mx-auto flex w-full items-center justify-center"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
    ></motion.div>
  );
}

export default function Hero2() {
  return (
    // <section id="hero">
    <div className="Herodv position-relative">
      {/* <HeroPill /> */}
      {/* <HeroTitles /> */}

      {/* <SplineRatWith3D /> */}
      <div className="scensade">
        <Spline scene="/carex.splinecode" />
      </div>
      <HeroCTA />
      <HeroImage />
      <div className="herodvs"></div>
    </div>
    // </section>
  );
}
