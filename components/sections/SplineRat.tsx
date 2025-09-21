"use client";

import React from "react";
import dynamic from "next/dynamic";

const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
});

const SplineRat: React.FC = () => {
  return (
    <div className="relative w-full h-[400px]">
      <Spline scene="/carex.splinecode" />
    </div>
  );
};

export default SplineRat;
