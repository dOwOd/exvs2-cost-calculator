import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = join(__dirname, "..", "public", "ogp.png");

const WIDTH = 1200;
const HEIGHT = 630;

const NOTO_SANS_JP_BOLD_URL =
  "https://fonts.gstatic.com/s/notosansjp/v56/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFPYk75s.ttf";

const fetchFont = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch font: ${res.statusText}`);
  return res.arrayBuffer();
};

const element = {
  type: "div",
  props: {
    style: {
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
      position: "relative",
    },
    children: [
      // Top accent bar
      {
        type: "div",
        props: {
          style: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "linear-gradient(90deg, #3b82f6, #60a5fa, #3b82f6)",
          },
        },
      },
      // Main title
      {
        type: "div",
        props: {
          style: {
            fontSize: "80px",
            fontWeight: 700,
            color: "#f8fafc",
            letterSpacing: "0.02em",
          },
          children: "EXVS2 コスト計算機",
        },
      },
      // Divider
      {
        type: "div",
        props: {
          style: {
            width: "300px",
            height: "3px",
            background: "linear-gradient(90deg, transparent, #3b82f6, transparent)",
            margin: "24px 0",
            borderRadius: "2px",
          },
        },
      },
      // Subtitle
      {
        type: "div",
        props: {
          style: {
            fontSize: "32px",
            fontWeight: 700,
            color: "#93c5fd",
            letterSpacing: "0.05em",
          },
          children: "撃墜順・EXオーバーリミット最適パターン計算",
        },
      },
      // URL
      {
        type: "div",
        props: {
          style: {
            fontSize: "24px",
            color: "#64748b",
            marginTop: "40px",
            letterSpacing: "0.1em",
          },
          children: "dowo.dev",
        },
      },
      // Bottom accent bar
      {
        type: "div",
        props: {
          style: {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "linear-gradient(90deg, #3b82f6, #60a5fa, #3b82f6)",
          },
        },
      },
    ],
  },
};

const main = async () => {
  console.log("Fetching Noto Sans JP font...");
  const fontData = await fetchFont(NOTO_SANS_JP_BOLD_URL);
  console.log("Font fetched successfully.");

  console.log("Generating SVG with satori...");
  const svg = await satori(element, {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      {
        name: "Noto Sans JP",
        data: fontData,
        weight: 700,
        style: "normal",
      },
    ],
  });

  console.log("Converting SVG to PNG with resvg...");
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: WIDTH },
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  writeFileSync(OUTPUT_PATH, pngBuffer);
  console.log(`OGP image generated: ${OUTPUT_PATH}`);
};

main().catch((err) => {
  console.error("Error generating OGP image:", err);
  process.exit(1);
});
