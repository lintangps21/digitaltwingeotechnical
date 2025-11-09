import React, { useMemo } from "react";

const riskColors = {
  "Apparent Progressive": "red",
  "Creeping": "orange",
  "Apparent Regressive": "green",
  "Unspecified": "gray",
};

const RiskSummary = ({ data, selectedIDs }) => {
  // Aggregate RiskRating counts based on selected IDs
  const riskCounts = useMemo(() => {
    const counts = {};
    data
      .filter((item) => selectedIDs.includes(String(item.id)))
      .forEach((item) => {
        const risk = item.risk || "Unspecified";
        counts[risk] = (counts[risk] || 0) + 1;
      });
    return counts;
  }, [data, selectedIDs]);

  return (
    <div
      style={{
        background: "#262626",
        padding: "20px",
        color: "#14B8A6",
        borderRadius: "10px",
        fontSize: "15px",
        flex: 1,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "column",
          paddingRight: "5px",
          gap: 10,
        }}
      >
        <h3 style={{ margin: 0, textAlign: "left" }}>Summary</h3>
        {Object.keys(riskCounts).length > 0 ? (
          <div style={{ display: "grid", gap: 10 }}>
            {Object.keys(riskColors).map((risk) => {
              if (!riskCounts[risk]) return null; // skip if no count
              return (
                <div
                  key={risk}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderRadius: "10px",
                    backgroundColor: "#565353ff",
                    padding: 10,
                  }}
                >
                  {/* colored circle */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                      style={{
                        display: "inline-block",
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        backgroundColor: riskColors[risk],
                      }}
                    ></span>
                    <span style={{ color: "white" }}>{risk}</span>
                  </div>
                  <span style={{ color: "white", fontWeight: "bold" }}>
                    {riskCounts[risk]}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{color:"#aaa"}}>No data for selected prisms.</p>
        )}
      </div>
    </div>
  );
};

export default RiskSummary;
