import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const TEAL = "#1F6A64";
const PARCHMENT = "#F9F8F3";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: PARCHMENT,
        }}
      >
        <svg
          viewBox="0 0 64 64"
          width="82%"
          height="82%"
          fill="none"
        >
          <circle cx="32" cy="32" r="30" stroke={TEAL} strokeWidth="1.5" />
          <circle cx="32" cy="32" r="22" stroke={TEAL} strokeWidth="0.75" />
          <path
            d="M32 6 35.1 28.9 58 32 35.1 35.1 32 58 28.9 35.1 6 32 28.9 28.9 32 6Z"
            fill={TEAL}
          />
          <g transform="rotate(45 32 32)" opacity="0.45">
            <path
              d="M32 14 33.8 30.2 50 32 33.8 33.8 32 50 30.2 33.8 14 32 30.2 30.2 32 14Z"
              fill={TEAL}
            />
          </g>
          <circle cx="32" cy="32" r="5" fill={PARCHMENT} />
          <circle cx="32" cy="32" r="5" stroke={TEAL} strokeWidth="1.25" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
