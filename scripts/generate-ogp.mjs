import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = join(__dirname, "..", "public", "ogp.png");

const WIDTH = 1200;
const HEIGHT = 630;

// Noto Sans JP Bold
const NOTO_SANS_JP_BOLD_URL =
  "https://fonts.gstatic.com/s/notosansjp/v56/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFPYk75s.ttf";

const fetchFont = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch font: ${res.statusText}`);
  return res.arrayBuffer();
};

// Colors
const colors = {
  bg: "#0f172a",
  cardBg: "#1e293b",
  cardBorder: "#334155",
  blue: "#3b82f6",
  lightBlue: "#93c5fd",
  green: "#22c55e",
  greenBg: "#14532d",
  greenText: "#86efac",
  orange: "#f97316",
  red: "#ef4444",
  redBg: "#7f1d1d",
  redText: "#fca5a5",
  white: "#f8fafc",
  gray: "#94a3b8",
  dimGray: "#64748b",
  barBg: "#334155",
};

// Sample data: 3000(680) + 2500(620), pattern A→B→A
// Kill 1: A killed, remaining=3000, health=680 (full)
// Kill 2: B killed, remaining=500, health=130 (overcost), EX activatable
// Kill 3: A killed, defeat
const sampleRows = [
  { kill: 1, unit: "A", remaining: 3000, health: 680, status: "normal", barColor: colors.orange },
  { kill: 2, unit: "B", remaining: 500, health: 130, status: "overcost", barColor: colors.red },
  { kill: 3, unit: "A", remaining: null, health: null, status: "defeat", barColor: null },
];

const costBarRow = (row) => {
  if (row.status === "defeat") {
    return {
      type: "div",
      props: {
        style: {
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          flex: 1,
        },
        children: [
          {
            type: "div",
            props: {
              style: { fontSize: "20px", color: colors.redText, fontWeight: 700, textAlign: "right" },
              children: "-",
            },
          },
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                height: "10px",
                borderRadius: "5px",
                backgroundColor: colors.barBg,
                overflow: "hidden",
                width: "100%",
              },
            },
          },
        ],
      },
    };
  }

  const barWidth = Math.max(0, (row.remaining / 6000) * 100);

  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        flex: 1,
      },
      children: [
        {
          type: "div",
          props: {
            style: { fontSize: "20px", color: colors.white, fontWeight: 700, textAlign: "right" },
            children: String(row.remaining),
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              height: "10px",
              borderRadius: "5px",
              backgroundColor: colors.barBg,
              overflow: "hidden",
              width: "100%",
            },
            children: {
              type: "div",
              props: {
                style: {
                  width: `${barWidth}%`,
                  height: "100%",
                  borderRadius: "5px",
                  backgroundColor: row.barColor,
                },
              },
            },
          },
        },
      ],
    },
  };
};

const statusCell = (row) => {
  const statusConfig = {
    normal: { text: "✓", color: "#4ade80" },
    overcost: { text: "⚠", color: "#facc15" },
    defeat: { text: "敗北", color: colors.redText },
  };
  const config = statusConfig[row.status];
  return {
    type: "div",
    props: {
      style: {
        width: "60px",
        fontSize: "20px",
        fontWeight: 700,
        color: config.color,
        textAlign: "center",
      },
      children: config.text,
    },
  };
};

const tableRow = (row) => ({
  type: "div",
  props: {
    style: {
      display: "flex",
      alignItems: "center",
      padding: "8px 16px",
      gap: "16px",
      borderBottom: `1px solid ${colors.cardBorder}`,
      backgroundColor:
        row.status === "defeat"
          ? "rgba(127, 29, 29, 0.4)"
          : row.status === "overcost"
            ? "rgba(113, 63, 18, 0.2)"
            : "transparent",
    },
    children: [
      // Kill count
      {
        type: "div",
        props: {
          style: { width: "40px", fontSize: "20px", color: colors.gray },
          children: String(row.kill),
        },
      },
      // Unit
      {
        type: "div",
        props: {
          style: {
            width: "40px",
            fontSize: "22px",
            fontWeight: 700,
            color: row.unit === "A" ? colors.blue : colors.green,
          },
          children: row.unit,
        },
      },
      // Cost bar
      costBarRow(row),
      // Health
      {
        type: "div",
        props: {
          style: {
            width: "80px",
            fontSize: "20px",
            fontWeight: 700,
            color: row.health != null ? colors.white : "transparent",
            textAlign: "right",
          },
          children: row.health != null ? String(row.health) : "-",
        },
      },
      // Status
      statusCell(row),
    ],
  },
});

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
      backgroundColor: "#0f172a",
      padding: "32px 60px",
    },
    children: [
      // Header: site name
      {
        type: "div",
        props: {
          style: {
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          },
          children: [
            {
              type: "div",
              props: {
                style: { fontSize: "28px", fontWeight: 700, color: colors.white },
                children: "EXVS2 コスト計算機",
              },
            },
            {
              type: "div",
              props: {
                style: { fontSize: "22px", color: colors.dimGray },
                children: "3000 (680) + 2500 (620)",
              },
            },
          ],
        },
      },

      // Card
      {
        type: "div",
        props: {
          style: {
            display: "flex",
            flexDirection: "column",
            width: "100%",
            backgroundColor: colors.cardBg,
            borderRadius: "12px",
            borderLeft: `6px solid ${colors.blue}`,
            overflow: "hidden",
          },
          children: [
            // Card header: rank + pattern + EX badge
            {
              type: "div",
              props: {
                style: {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 20px",
                },
                children: [
                  {
                    type: "div",
                    props: {
                      style: { display: "flex", alignItems: "center", gap: "16px" },
                      children: [
                        // Rank
                        {
                          type: "div",
                          props: {
                            style: { fontSize: "36px", fontWeight: 700, color: colors.blue },
                            children: "#1",
                          },
                        },
                        // Pattern: A → B → A
                        {
                          type: "div",
                          props: {
                            style: { display: "flex", alignItems: "center", gap: "8px", fontSize: "28px" },
                            children: [
                              { type: "span", props: { style: { color: colors.blue, fontWeight: 700 }, children: "A" } },
                              { type: "span", props: { style: { color: colors.dimGray }, children: "→" } },
                              { type: "span", props: { style: { color: colors.green, fontWeight: 700 }, children: "B" } },
                              { type: "span", props: { style: { color: colors.dimGray }, children: "→" } },
                              { type: "span", props: { style: { color: colors.blue, fontWeight: 700 }, children: "A" } },
                            ],
                          },
                        },
                      ],
                    },
                  },
                  // EX badge
                  {
                    type: "div",
                    props: {
                      style: {
                        backgroundColor: colors.greenBg,
                        color: colors.greenText,
                        padding: "6px 16px",
                        borderRadius: "6px",
                        fontSize: "18px",
                        fontWeight: 700,
                      },
                      children: "EXオーバーリミット発動可",
                    },
                  },
                ],
              },
            },

            // Total health
            {
              type: "div",
              props: {
                style: {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  padding: "14px 20px",
                  margin: "12px 16px",
                  backgroundColor: "#334155",
                  borderRadius: "8px",
                },
                children: [
                  // 総耐久の範囲
                  {
                    type: "div",
                    props: {
                      style: { display: "flex", flexDirection: "column", alignItems: "center", flex: 1 },
                      children: [
                        {
                          type: "div",
                          props: {
                            style: { fontSize: "14px", color: colors.dimGray },
                            children: "総耐久の範囲",
                          },
                        },
                        {
                          type: "div",
                          props: {
                            style: { fontSize: "28px", fontWeight: 700, color: colors.white },
                            children: "1980〜2270",
                          },
                        },
                      ],
                    },
                  },
                  // 総耐久の範囲
                  {
                    type: "div",
                    props: {
                      style: { display: "flex", flexDirection: "column", alignItems: "center", flex: 1 },
                      children: [
                        {
                          type: "div",
                          props: {
                            style: { fontSize: "14px", color: colors.dimGray },
                            children: "総耐久",
                          },
                        },
                        {
                          type: "div",
                          props: {
                            style: { fontSize: "28px", fontWeight: 700, color: colors.white },
                            children: "2210",
                          },
                        },
                      ],
                    },
                  },
                  // 最短敗北耐久
                  {
                    type: "div",
                    props: {
                      style: { display: "flex", flexDirection: "column", alignItems: "center", flex: 1 },
                      children: [
                        {
                          type: "div",
                          props: {
                            style: { fontSize: "14px", color: colors.dimGray },
                            children: "最短敗北耐久",
                          },
                        },
                        {
                          type: "div",
                          props: {
                            style: { fontSize: "28px", fontWeight: 700, color: colors.white },
                            children: "1360",
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },

            // Table rows
            ...sampleRows.map(tableRow),

          ],
        },
      },

      // Footer
      {
        type: "div",
        props: {
          style: {
            display: "flex",
            width: "100%",
            justifyContent: "flex-end",
            marginTop: "16px",
          },
          children: {
            type: "div",
            props: {
              style: { fontSize: "20px", color: colors.dimGray },
              children: "dowo.dev",
            },
          },
        },
      },
    ],
  },
};

const main = async () => {
  console.log("Fetching font...");
  const boldFont = await fetchFont(NOTO_SANS_JP_BOLD_URL);
  console.log("Font fetched successfully.");

  console.log("Generating SVG with satori...");
  const svg = await satori(element, {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      {
        name: "Noto Sans JP",
        data: boldFont,
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
