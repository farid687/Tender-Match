"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const TOOLTIP_EDGE_PADDING = 12;
const TOOLTIP_MAX_W = 220;
const TOOLTIP_MAX_H = 56;
const TOOLTIP_OFFSET = 14;
const SELECTED_FILL = "var(--province-selected, #3b82f6)";
const HOVER_FILL = "var(--province-hover, #94a3b8)";

function getProvinceName(path) {
  return (
    path.getAttribute("title") ||
    path.id?.replace("NL-", "").replace(/-/g, " ") ||
    "Province"
  );
}

function normalizeName(name) {
  return String(name ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

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

export default function NLProvinceMap({ preferredRegions = [], onChange }) {
  const containerRef = useRef(null);
  const objectRef = useRef(null);
  const [tooltip, setTooltip] = useState({ name: null, x: 0, y: 0 });
  const pathListenersRef = useRef(null);
  const preferredRegionsRef = useRef(preferredRegions);
  const onChangeRef = useRef(onChange);
  preferredRegionsRef.current = preferredRegions;
  onChangeRef.current = onChange;

  const applySelectionStyles = useCallback((doc, selected) => {
    if (!doc) return;
    const paths = doc.querySelectorAll("path[id^='NL-']");
    paths.forEach((path) => {
      const name = getProvinceName(path);
      const key = normalizeName(name);
      path.style.fill = selected.has(key) ? SELECTED_FILL : "";
    });
  }, []);

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
        const initialSelected = new Set((preferredRegionsRef.current || []).map((n) => normalizeName(n)));
        applySelectionStyles(doc, initialSelected);

        const cleanupFns = [];

        paths.forEach((path) => {
          const province = getProvinceName(path);
          path.setAttribute("aria-label", `${province} (click to select)`);
          path.style.cursor = "pointer";
          path.style.transition = "fill 0.15s ease";

          const onEnter = (e) => {
            const selected = new Set((preferredRegionsRef.current || []).map((n) => normalizeName(n)));
            const key = normalizeName(province);
            path.style.fill = selected.has(key) ? SELECTED_FILL : HOVER_FILL;
            updateTooltipPosition(e, containerRef, setTooltip, province);
          };
          const onMove = (e) => updateTooltipPosition(e, containerRef, setTooltip, province);
          const onLeave = () => {
            const selected = new Set((preferredRegionsRef.current || []).map((n) => normalizeName(n)));
            const key = normalizeName(province);
            path.style.fill = selected.has(key) ? SELECTED_FILL : "";
            setTooltip((prev) => ({ ...prev, name: null }));
          };
          const onClick = () => {
            const cb = onChangeRef.current;
            if (typeof cb !== "function") return;
            const current = preferredRegionsRef.current || [];
            const key = normalizeName(province);
            const next = current.some((n) => normalizeName(n) === key)
              ? current.filter((n) => normalizeName(n) !== key)
              : [...current, province];
            cb(next);
          };

          path.addEventListener("mouseenter", onEnter);
          path.addEventListener("mousemove", onMove);
          path.addEventListener("mouseleave", onLeave);
          path.addEventListener("click", onClick);
          cleanupFns.push(() => {
            path.removeEventListener("mouseenter", onEnter);
            path.removeEventListener("mousemove", onMove);
            path.removeEventListener("mouseleave", onLeave);
            path.removeEventListener("click", onClick);
          });
        });

        pathListenersRef.current = () => cleanupFns.forEach((fn) => fn());
      } catch (err) {
        console.warn("Could not init map:", err);
      }
    };

    if (objectEl.contentDocument?.querySelector("svg")) {
      initMap();
    } else {
      objectEl.addEventListener("load", initMap);
      return () => objectEl.removeEventListener("load", initMap);
    }
    return () => pathListenersRef.current?.();
  }, [applySelectionStyles]);

  useEffect(() => {
    const objectEl = objectRef.current;
    const doc = objectEl?.contentDocument;
    if (!doc) return;
    const selected = new Set((preferredRegions || []).map((n) => normalizeName(n)));
    applySelectionStyles(doc, selected);
  }, [preferredRegions, applySelectionStyles]);

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
