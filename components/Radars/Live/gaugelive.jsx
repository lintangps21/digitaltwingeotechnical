import React from "react";

const GaugeLive = ({
  downtime,
  isOff,
  strokeWidth = 20,
  maColor = "#3B7D23",
  uaColor = "#156082",
  ringBackgroundColor = "#262626",
}) => {
  if (!downtime) return null;

  // Extract ma and UA categories
  const ma = downtime["Mechanical Availability"] || {};
  const ua = downtime["Use of Availability"] || {};

  // Compute ma% and UA% = 100 - sum of downtime %
  let maPercentage =
    100 - Object.values(ma).reduce((sum, r) => sum + Number(r.percentage), 0);
  let uaPercentage =
    100 - Object.values(ua).reduce((sum, r) => sum + Number(r.percentage), 0);

  if (isOff) {
    maPercentage = 0;
    uaPercentage = 0;
  }


  const baseSize = 200;
  const radiusOuter = (baseSize - strokeWidth) / 2;
  const radiusInner = radiusOuter - strokeWidth * 1.5;

  const circumferenceOuter = 2 * Math.PI * radiusOuter;
  const circumferenceInner = 2 * Math.PI * radiusInner;

  const offsetOuter =
    circumferenceOuter - (maPercentage / 100) * circumferenceOuter;
  const offsetInner =
    circumferenceInner - (uaPercentage / 100) * circumferenceInner;

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px" }}>
      {/* Gauge */}
      <svg
        width="40%"
        height="40%"
        viewBox={`0 0 ${baseSize} ${baseSize}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Outer background */}
        <circle
          cx={baseSize / 2}
          cy={baseSize / 2}
          r={radiusOuter}
          stroke={ringBackgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Outer ma ring */}
        <circle
          cx={baseSize / 2}
          cy={baseSize / 2}
          r={radiusOuter}
          stroke={maColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumferenceOuter}
          strokeDashoffset={offsetOuter}
          strokeLinecap="square"
          transform={`rotate(-90 ${baseSize / 2} ${baseSize / 2})`}
        />

        {/* Inner background */}
        <circle
          cx={baseSize / 2}
          cy={baseSize / 2}
          r={radiusInner}
          stroke={ringBackgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Inner UA ring */}
        <circle
          cx={baseSize / 2}
          cy={baseSize / 2}
          r={radiusInner}
          stroke={uaColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumferenceInner}
          strokeDashoffset={offsetInner}
          strokeLinecap="square"
          transform={`rotate(-90 ${baseSize / 2} ${baseSize / 2})`}
        />

      </svg>

      {/* Legend */}
      <div style={{ fontSize: "14px", color: "#ccc", flex: 1 }}>
        {/* ma */}
        <div style={{ marginBottom: "5px", display: "flex", justifyContent: "space-between", padding: "5px 20px", borderRadius: "20px", backgroundColor: maColor, fontWeight: "bold" }}>
          Mechanical Availability
          <p style={{ margin: 0, fontSize: "16px" }}>{maPercentage.toFixed(0)}%</p>
        </div>
        {!isOff &&
          Object.entries(ma).map(([reason, { hours, percentage }]) => (
            <div key={reason} style={{ padding: "0 20px", fontSize: "12px", display: "flex", justifyContent: "space-between", color: hours > 0 ? "#fff" : "#595959", fontWeight: hours > 0 ? "bold" : "normal" }}>
              {reason}
              <p style={{ margin: 0 }}>{hours} h / {percentage}%</p>
            </div>
          ))}

        {/* UA */}
        <div style={{ margin: "10px 0 5px 0", display: "flex", justifyContent: "space-between", padding: "5px 20px", borderRadius: "20px", backgroundColor: uaColor, fontWeight: "bold" }}>
          Use of Availability
          <p style={{ margin: 0, fontSize: "16px" }}>{uaPercentage.toFixed(0)}%</p>
        </div>
        {!isOff &&
          Object.entries(ua).map(([reason, { hours, percentage }]) => (
            <div key={reason} style={{ padding: "0 20px", fontSize: "12px", display: "flex", justifyContent: "space-between", color: hours > 0 ? "#fff" : "#595959", fontWeight: hours > 0 ? "bold" : "normal" }}>
              {reason}
              <p style={{ margin: 0 }}>{hours} h / {percentage}%</p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default GaugeLive;
