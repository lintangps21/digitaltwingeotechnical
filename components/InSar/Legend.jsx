import React from "react";

const ColorBar = ({ min = -20, max = 60, units = "mm", gradient }) => {
    // Compute intermediate values (e.g., for ticks)
    const mid = (min + max) / 2;
    const step = (max - min) / 4;
    const tickValues = [max, max - step, mid, min + step, min];

    return (
        <div
            style={{
                padding: "10px 20px 10px 0",
                background: "rgba(0,0,0,0.6)",
                borderRadius: "8px",
                fontSize: "12px",
                color: "white",
                width: "60px",
                textAlign: "center",
            }}
        >
            <div style={{ marginBottom: "5px", fontWeight: "bold" }}>{units}</div>

            <div
                style={{
                    height: "150px",
                    width: "20px",
                    margin: "0 auto",
                    background: gradient,
                    border: "1px solid #ccc",
                    position: "relative",
                }}
            >
                {tickValues.map((val, i) => {
                    const pct = ((max - val) / (max - min)) * 100;
                    return (
                        <div
                            key={i}
                            style={{
                                position: "absolute",
                                top: `${pct}%`,
                                left: "24px",
                                transform: "translateY(-50%)",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {val.toFixed(1)}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ColorBar;
