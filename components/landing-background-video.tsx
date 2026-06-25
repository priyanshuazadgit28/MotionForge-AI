"use client";

import { useEffect, useRef } from "react";

export function LandingBackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let fadeReq: number;
    const updateOpacity = () => {
      if (!video) return;
      const t = video.currentTime;
      const d = video.duration;
      
      if (!d || isNaN(d)) {
        fadeReq = requestAnimationFrame(updateOpacity);
        return;
      }

      let opacity = 1;
      const fadeDur = 0.5;
      
      if (t < fadeDur) {
        opacity = t / fadeDur;
      } else if (d - t < fadeDur) {
        opacity = (d - t) / fadeDur;
      }

      video.style.opacity = Math.max(0, Math.min(1, opacity)).toString();
      fadeReq = requestAnimationFrame(updateOpacity);
    };

    const onEnded = () => {
      video.style.opacity = "0";
      setTimeout(() => {
        video.currentTime = 0;
        video.play().catch(console.error);
      }, 100);
    };

    video.addEventListener("ended", onEnded);
    video.play().catch(console.error);
    fadeReq = requestAnimationFrame(updateOpacity);

    return () => {
      video.removeEventListener("ended", onEnded);
      cancelAnimationFrame(fadeReq);
    };
  }, []);

  return (
    <>
      <div className="fixed inset-0 w-full h-full z-0 bg-[hsl(260_87%_3%)] pointer-events-none" />
      <video
        ref={videoRef}
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_065045_c44942da-53c6-4804-b734-f9e07fc22e08.mp4"
        playsInline
        muted
        autoPlay
        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none mix-blend-screen"
        style={{ opacity: 0 }}
      />
    </>
  );
}
