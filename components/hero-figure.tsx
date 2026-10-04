"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function HeroFigure({
  className = "",
}: {
  className?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const [stirring, setStirring] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reducedMotion || hovered) return;

    let stirTimer = 0;
    let settleTimer = 0;

    const schedule = () => {
      stirTimer = window.setTimeout(
        () => {
          setStirring(true);
          settleTimer = window.setTimeout(() => {
            setStirring(false);
            schedule();
          }, 2400);
        },
        6500 + Math.random() * 7500,
      );
    };

    schedule();

    return () => {
      window.clearTimeout(stirTimer);
      window.clearTimeout(settleTimer);
    };
  }, [hovered, reducedMotion]);

  function flourish() {
    if (reducedMotion) return;
    setStirring(true);
    window.setTimeout(() => setStirring(false), 1800);
  }

  return (
    <div
      className={`hero-figure ${hovered ? "is-hovered" : ""} ${stirring ? "is-stirring" : ""} ${className}`.trim()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={flourish}
      role="img"
      aria-label="Classical winged figure, the emblem of Daedalus Health"
    >
      <div className="hero-figure-stage">
        <Image
          src="/images/winged-figure.png"
          alt=""
          width={864}
          height={1152}
          priority
          unoptimized
          aria-hidden="true"
          className="hero-figure-body"
        />
        <Image
          src="/images/winged-figure.png"
          alt=""
          width={864}
          height={1152}
          priority
          unoptimized
          aria-hidden="true"
          className="hero-figure-wing"
        />
        <Image
          src="/images/winged-figure.png"
          alt=""
          width={864}
          height={1152}
          priority
          unoptimized
          aria-hidden="true"
          className="hero-figure-joint"
        />
      </div>
    </div>
  );
}
