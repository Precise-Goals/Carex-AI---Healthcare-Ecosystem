"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Use the Next.js entrypoint to avoid Vercel export errors
const SplineWithFallback = dynamic(
  () =>
    import("@splinetool/react-spline/next") // <-- use the correct path
      .then((mod) => ({ default: mod.default || mod }))
      .catch(() => ({ default: () => null })), // Return a null component on failure
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="text-4xl mb-4">🎨</div>
          <div className="text-gray-500">Loading 3D Scene...</div>
        </div>
      </div>
    ),
  }
);

const SplineRat: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLoad = () => {
    console.log("Spline scene loaded successfully");
  };

  const handleError = (error: any) => {
    console.error("Spline loading error:", error);
    setHasError(true);
  };

  if (!isMounted) {
    return (
      <div className="relative w-full h-[400px] bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🎨</div>
          <div className="text-gray-500">Initializing...</div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="relative w-full h-[400px] bg-gradient-to-br from-red-50 to-pink-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            3D Scene Unavailable
          </h3>
          <p className="text-gray-500">
            The interactive 3D scene is currently unavailable.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[400px]">
      <SplineWithFallback
        scene="/carex.splinecode"
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
};

export default SplineRat;
