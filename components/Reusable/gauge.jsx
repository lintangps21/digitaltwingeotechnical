import React from "react";

/**
 * RadarGauge: Circular SVG gauge with a center image and optional label.
 *
 * @param {number} percentage - Value between 0–100.
 * @param {string} imageSrc - Path to the center image.
 * @param {number} size - Width & height of the gauge in pixels.
 * @param {number} strokeWidth - Thickness of the progress ring.
 * @param {string} color - Color of the progress arc.
 * @param {string} ringBackgroundColor - Background ring color.
 * @param {string} label - Optional label below the gauge.
 * @param {number} fontSize - Font size of label (px).
 */
const Gauge = ({
  percentage = 75,
  imageSrc = "/s/default.png",
  size = 80,
  strokeWidth = 10,
  color = "#3B7D23", // Tailwind green-600
  ringBackgroundColor = "none",
  label = "",
  fontSize = 12,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width={size} height={size}>
        {/* Background Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ringBackgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="butt"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        {/* Center image */}
        <image
          href={imageSrc}
          x={size * 0.25}
          y={size * 0.25}
          width={size * 0.5}
          height={size * 0.5}
          preserveAspectRatio="xMidYMid meet"
        />
      </svg>

      {/* Optional Label */}
      {label && (
        <div
          style={{
            marginTop: "4px",
            fontSize: fontSize,
            color: "#fff",
            textAlign: "center",
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};

export default Gauge;
