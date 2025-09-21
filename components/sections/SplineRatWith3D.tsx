"use client";

import React, { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";

// Load Spline component with proper error boundary
const SplineComponent = dynamic(
  () =>
    import("@splinetool/react-spline").then((mod) => ({ default: mod.default })),
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

// Fallback component
const FallbackComponent: React.FC = () => (
  <div className="relative w-full h-[400px] bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
    <div className="text-center">
      <div className="text-6xl mb-4">🏥</div>
      <h3 className="text-2xl font-bold text-gray-800 mb-2">
        Carex AI Medical Assistant
      </h3>
      <p className="text-gray-600 mb-4">
        Experience real-time voice conversations with an AI medical assistant
      </p>
      <div className="flex justify-center space-x-4">
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
        <div
          className="w-3 h-3 bg-green-500 rounded-full animate-pulse"
          style={{ animationDelay: "0.2s" }}
        ></div>
        <div
          className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"
          style={{ animationDelay: "0.4s" }}
        ></div>
      </div>
    </div>
  </div>
);

// Error boundary component
class SplineErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Spline Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

const SplineRatWith3D: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Set a timeout to show fallback if Spline doesn't load
    // const timer = setTimeout(() => {
    //   if (!hasError) {
    //     console.warn("Spline loading timeout - showing fallback");
    //     setHasError(true);
    //   }
    // }, 80000); // Increased timeout

    // return () => clearTimeout(timer);
  }, [hasError]);

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
    return <FallbackComponent />;
  }

  return (
    <div className="relative w-full h-[400px]">
      <SplineErrorBoundary fallback={<FallbackComponent />}>
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-indigo-100">
              <div className="text-center">
                <div className="text-4xl mb-4">🎨</div>
                <div className="text-gray-500">Loading 3D Scene...</div>
              </div>
            </div>
          }
        >
          <SplineComponent
            scene="/carex.splinecode"
            onLoad={() => {
              console.log("Spline scene loaded successfully");
            }}
            onError={(error: any) => {
              console.error("Spline loading error:", error);
              setHasError(true);
            }}
          />
        </Suspense>
      </SplineErrorBoundary>
    </div>
  );
};

export default SplineRatWith3D;
