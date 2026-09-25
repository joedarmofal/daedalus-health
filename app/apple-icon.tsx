import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const figureData = await readFile(
  join(process.cwd(), "public/images/winged-figure.png"),
);
const figureSrc = `data:image/png;base64,${figureData.toString("base64")}`;

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
          background: "#1A2B3C",
        }}
      >
        <img
          src={figureSrc}
          alt=""
          style={{ width: "84%", height: "84%", objectFit: "contain" }}
        />
      </div>
    ),
    { ...size },
  );
}
