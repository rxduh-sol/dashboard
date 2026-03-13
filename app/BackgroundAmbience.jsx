"use client";
export const BackgroundAmbience = () => (
  <div className="fixed inset-0 z-0 pointer-events-none">
    <video autoPlay loop muted playsInline className="absolute min-w-full min-h-full object-cover opacity-50">
      <source src="/bg.mp4" type="video/mp4" />
    </video>
    <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]" />
  </div>
);