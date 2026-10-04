"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

function FigureLayer({ className }: { className: string }) {
  return (
    <Image
      src="/images/winged-figure.png"
      alt=""
      width={864}
      height={1152}
      priority
      unoptimized
      aria-hidden="true"
      className={className}
    />
  );
}

export function HeroFigure({
  className = "",
}: {
  className?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const [stirring, setStirring] = useState(false);
  const [glancing, setGlancing] = useState(false);
  const [entering, setEntering] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setReducedMotion(media.matches);
      if (media.matches) setEntering(false);
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reducedMotion || !entering) return;
    const timer = window.setTimeout(() => setEntering(false), 2800);
    return () => window.clearTimeout(timer);
  }, [entering, reducedMotion]);

  useEffect(() => {
    if (reducedMotion || entering || hovered) return;

    let stirTimer = 0;
    let settleTimer = 0;
    let glanceTimer = 0;
    let glanceSettle = 0;

    const scheduleStir = () => {
      stirTimer = window.setTimeout(
        () => {
          setStirring(true);
          settleTimer = window.setTimeout(() => {
            setStirring(false);
            scheduleStir();
          }, 2400);
        },
        5000 + Math.random() * 6000,
      );
    };

    const scheduleGlance = () => {
      glanceTimer = window.setTimeout(
        () => {
          setGlancing(true);
          glanceSettle = window.setTimeout(() => {
            setGlancing(false);
            scheduleGlance();
          }, 2000);
        },
        2800 + Math.random() * 5000,
      );
    };

    scheduleStir();
    scheduleGlance();

    return () => {
      window.clearTimeout(stirTimer);
      window.clearTimeout(settleTimer);
      window.clearTimeout(glanceTimer);
      window.clearTimeout(glanceSettle);
    };
  }, [entering, hovered, reducedMotion]);

  function flourish() {
    if (reducedMotion || entering) return;
    setStirring(true);
    setGlancing(true);
    window.setTimeout(() => setStirring(false), 1800);
    window.setTimeout(() => setGlancing(false), 2000);
  }

  return (
    <div
      className={`hero-figure ${entering ? "is-entering" : ""} ${hovered ? "is-hovered" : ""} ${stirring ? "is-stirring" : ""} ${glancing ? "is-glancing" : ""} ${className}`.trim()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={flourish}
      role="img"
      aria-label="Classical winged figure, the emblem of Daedalus Health"
    >
      <div className="hero-figure-flight">
        <div className="hero-figure-stage">
          <FigureLayer className="hero-figure-body" />
          <FigureLayer className="hero-figure-wing" />
          <FigureLayer className="hero-figure-wing-far" />
          <FigureLayer className="hero-figure-joint" />
          <FigureLayer className="hero-figure-head" />
          <FigureLayer className="hero-figure-neck" />
        </div>
      </div>
    </div>
  );
}
