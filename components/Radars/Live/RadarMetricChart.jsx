import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip
} from "recharts";
import { buildRadarData } from "./radarChart";
import React from "react";

function RadarMetricsChart({ record }) {
    const data = buildRadarData(record);
    /* --------------------------------------------------
     Color Maps
  -------------------------------------------------- */
    const COLORS = {
        green: "#13501B",
        yellow: "#b18503ff",
        orange: "#80350E",
        red: "#8b0202ff",
        grey: "#aaa",
        purple: "#D86ECC"
    };

    // Overall scale
    const overallstatusColor = (val) => {
        switch ((val || "").toLowerCase()) {
            case "optimal":
                return COLORS.green;
            case "acceptable":
                return COLORS.yellow;
            case "sub-optimal":
            case "suboptimal":
                return COLORS.orange;
            case "critical":
                return COLORS.red;
            default:
                return COLORS.grey;
        }
    };

    const dotColor = (val) => {
        switch ((val || "").toLowerCase()) {
            case "optimal":
                return "#47D45A";
            case "acceptable":
                return "#FFC000";
            case "sub-optimal":
            case "suboptimal":
                return "#E97132";
            case "critical":
                return "#C00000";
            default:
                return COLORS.grey;
        }
    };

    const PARAMETER_LABELS = {
        SystemHealth: "System Health",
        ScanArea: "Scan Area",
        AtmosphericCorrection: "Atm. Correction",
        // add others as needed
    };

    const formatParameterLabel = (name) => {
        const str = String(name || ""); // make sure it's always a string
        return PARAMETER_LABELS[str] || str.replace(/([a-z])([A-Z])/g, "$1 $2");
    };


    return (
        <ResponsiveContainer width="100%" height="80%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                <PolarGrid radialLines={false} stroke="#393939" />
                <PolarAngleAxis dataKey="subject" fontSize="12px" tickFormatter={(name) => formatParameterLabel(name)} />
                <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
                <Radar
                    name="Metrics"
                    dataKey="score"
                    stroke={overallstatusColor(record.parameters.Overall?.value)}
                    strokeWidth={3}
                    fill="none"
                    dot={({ cx, cy, index }) => (
                        <circle
                            cx={cx}
                            cy={cy}
                            r={3}
                            fill={dotColor(data[index].status)}
                            filter={`drop-shadow(0 0 8px #fff)`}
                        />
                    )}
                />
            </RadarChart>
        </ResponsiveContainer>
    );
}

export default RadarMetricsChart;
