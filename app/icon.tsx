import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 256, height: 256 };
export const contentType = "image/png";

const figureData = await readFile(
  join(process.cwd(), "public/images/winged-figure.png"),
);
const figureSrc = `data:image/png;base64,${figureData.toString("base64")}`;

export default function Icon() {
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
          style={{ width: "80%", height: "80%", objectFit: "contain" }}
        />
      </div>
    ),
    { ...size },
  );
}
