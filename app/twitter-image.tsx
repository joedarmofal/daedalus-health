import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Daedalus Health — AI Leadership for Life";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const figureData = await readFile(
  join(process.cwd(), "public/images/winged-figure.png"),
);
const figureSrc = `data:image/png;base64,${figureData.toString("base64")}`;

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#1A2B3C",
        }}
      >
        <img
          src={figureSrc}
          alt=""
          style={{ height: 320, width: 240, objectFit: "contain" }}
        />
        <div
          style={{
            marginTop: 28,
            fontSize: 60,
            fontWeight: 600,
            letterSpacing: 10,
            color: "#C4A574",
          }}
        >
          DAEDALUS HEALTH
        </div>
        <div
          style={{
            marginTop: 14,
            fontSize: 22,
            fontWeight: 500,
            letterSpacing: 4,
            color: "rgba(249, 248, 243, 0.72)",
          }}
        >
          YOUR NORTH STAR FOR ETHICAL AI
        </div>
      </div>
    ),
    { ...size },
  );
}
