import { TopographicPattern } from "@/components/topographic-pattern";
import Image from "next/image";
import type { ReactNode } from "react";

export function SignInPanel({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="relative flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
      <TopographicPattern
        tone="gold"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.14]"
      />
      <section className="relative w-full max-w-lg">
        <Image
          src="/images/winged-figure.png"
          alt="Classical winged figure, the emblem of Daedalus Health"
          width={864}
          height={1152}
          priority
          unoptimized
          className="mx-auto mb-8 h-auto w-[130px] sm:w-[150px]"
        />
        <p className="text-center text-xs font-semibold tracking-[0.28em] text-[#C4A574]">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-center font-serif text-3xl font-medium text-[#F9F8F3]">
          {title}
        </h1>
        <p className="mx-auto mt-3 mb-8 max-w-md text-center text-sm leading-6 text-[#F9F8F3]/65">
          {description}
        </p>
        {children}
      </section>
    </div>
  );
}
