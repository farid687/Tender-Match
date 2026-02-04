"use client";

import { useEffect, useRef, useState } from "react";

const TOOLTIP_EDGE_PADDING = 12;
const TOOLTIP_MAX_W = 220;
const TOOLTIP_MAX_H = 56;
const TOOLTIP_OFFSET = 14;

function updateTooltipPosition(e, containerRef, setTooltip, province) {
  const rect = containerRef.current?.getBoundingClientRect();
  if (!rect) return;
  let x = e.clientX - rect.left + TOOLTIP_OFFSET;
  let y = e.clientY - rect.top - TOOLTIP_OFFSET;
  if (x < TOOLTIP_EDGE_PADDING) x = TOOLTIP_EDGE_PADDING;
  else if (x + TOOLTIP_MAX_W > rect.width - TOOLTIP_EDGE_PADDING) x = rect.width - TOOLTIP_MAX_W - TOOLTIP_EDGE_PADDING;
  if (y < TOOLTIP_EDGE_PADDING) y = TOOLTIP_EDGE_PADDING;
  else if (y + TOOLTIP_MAX_H > rect.height - TOOLTIP_EDGE_PADDING) y = rect.height - TOOLTIP_MAX_H - TOOLTIP_EDGE_PADDING;
  setTooltip({ name: province, x, y });
}

export default function NLProvinceMap() {
  const containerRef = useRef(null);
  const objectRef = useRef(null);
  const [tooltip, setTooltip] = useState({ name: null, x: 0, y: 0 });

  useEffect(() => {
    const objectEl = objectRef.current;
    if (!objectEl) return;

    const initMap = () => {
      try {
        const doc = objectEl.contentDocument;
        if (!doc) return;

        const svg = doc.querySelector("svg");
        if (!svg) return;

        const paths = svg.querySelectorAll("path[id^='NL-']");

        paths.forEach((path) => {
          const province =
            path.getAttribute("title") ||
            path.id?.replace("NL-", "").replace(/-/g, " ") ||
            "Province";

          path.setAttribute("aria-label", province);
          path.style.cursor = "pointer";
          path.style.transition = "fill 0.15s ease";

          path.addEventListener("mouseenter", (e) => {
            path.style.fill = "var(--province-hover, #94a3b8)";
            updateTooltipPosition(e, containerRef, setTooltip, province);
          });

          path.addEventListener("mousemove", (e) => {
            updateTooltipPosition(e, containerRef, setTooltip, province);
          });

          path.addEventListener("mouseleave", () => {
            path.style.removeProperty("fill");
            setTooltip((prev) => ({ ...prev, name: null }));
          });
        });
      } catch (err) {
        console.warn("Could not init map hover:", err);
      }
    };

    if (objectEl.contentDocument?.querySelector("svg")) {
      initMap();
    } else {
      objectEl.addEventListener("load", initMap);
      return () => objectEl.removeEventListener("load", initMap);
    }
  }, []);

  return (
    <div ref={containerRef} className="nl-map relative w-full overflow-hidden flex justify-center">
      <object
        ref={objectRef}
        data="/maps/nl-provinces.svg"
        type="image/svg+xml"
        aria-label="Netherlands provinces map"
        className="block w-full h-auto max-w-[400px]"
      />
      {tooltip.name && (
        <div
          className="pointer-events-none absolute z-[9999] whitespace-nowrap transition-opacity duration-150"
          style={{
            left: tooltip.x,
            top: tooltip.y,
          }}
        >
          <div
            className="!px-3 text-sm font-semibold text-white rounded-md"
            style={{
              background: "linear-gradient(180deg, #334155 0%, #1e293b 100%)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.08) inset",
              letterSpacing: "0.02em",
            }}
          >
            {tooltip.name}
          </div>
        </div>
      )}
    </div>
  );
}
