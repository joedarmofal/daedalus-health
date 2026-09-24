const VALUES = [
  { letter: "S", word: "Safety" },
  { letter: "H", word: "Humanity" },
  { letter: "I", word: "Integrity" },
  { letter: "E", word: "Excellence" },
  { letter: "L", word: "Longevity" },
  { letter: "D", word: "Duty" },
];

/** A shield outline (in the brand's gold) with the SHIELD acronym listed
 * inside it, each value's leading letter set off in gold. */
export function CoreValuesShield({ className }: { className?: string }) {
  return (
    <div className={`relative mx-auto aspect-[10/12] w-[240px] sm:w-[280px] ${className ?? ""}`}>
      <svg
        viewBox="0 0 200 240"
        fill="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <path
          d="M20 22 H180 V122 C180 178 148 214 100 232 C52 214 20 178 20 122 Z"
          stroke="#C4A574"
          strokeWidth="2"
        />
        <path
          d="M29 30 H171 V120 C171 170 144 202 100 218 C56 202 29 170 29 120 Z"
          stroke="#C4A574"
          strokeWidth="0.75"
          strokeOpacity="0.45"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center pb-6">
        <ul className="flex w-fit flex-col gap-3">
          {VALUES.map((v) => (
            <li
              key={v.letter}
              className="flex items-baseline gap-2.5 text-[15px] font-medium tracking-wide text-[#F9F8F3]"
            >
              <span className="w-5 shrink-0 text-center font-serif text-xl font-semibold text-[#C4A574]">
                {v.letter}
              </span>
              <span>{v.word}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
