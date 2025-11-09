import React, { useEffect, useState, useMemo } from "react";
import Papa from "papaparse";
import {
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

export default function RainChart() {
    const [rainData, setRainData] = useState([]);

    useEffect(() => {
        fetch("/data/INSAR/Data/Telfer/RainFall.csv") // adjust to your CSV path
            .then((res) => res.text())
            .then((text) => {
                const result = Papa.parse(text, { header: true, skipEmptyLines: true });
                const parsed = (result.data || []).map((row) => ({
                    Month: row.Month,
                    Rain: parseFloat(row.Rain) || 0,
                }));
                setRainData(parsed);
            });
    }, []);

    const chartData = useMemo(() => {
        let cumulative = 0;
        return rainData.map((d) => {
            cumulative += d.Rain;
            return {
                Month: d.Month,
                Rain: d.Rain,
                Accumulated: cumulative,
            };
        });
    }, [rainData]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            // Format label as Month Year
            const date = new Date(label).toLocaleString("en-GB", {
                month: "short",
                year: "numeric"
            });

            return (
                <div
                    style={{
                        backgroundColor: "#1B1B1B",
                        border: "1px solid #5A6474",
                        padding: "10px",
                        borderRadius: "6px",
                        color: "#f5f5f5",
                        fontSize: "12px",
                        minWidth: "120px",
                    }}
                >
                    <div><strong>{date}</strong></div>
                    {payload.map((item) => {
                        let unit = "mm"; // Both values are in mm
                        return (
                            <div key={item.dataKey}>
                                {item.name}: <span style={{ color: item.color }}>{item.value.toFixed(1)} {unit}</span>
                            </div>
                        );
                    })}
                </div>
            );
        }
        return null;
    };


    return (
        <ResponsiveContainer width="100%" height={120}>
            <ComposedChart data={chartData} margin={{ top: 0, right: 10, bottom: 10, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Month" angle={-45} textAnchor="end" fontSize={10} />
                <YAxis yAxisId="left" label={{ value: "Rain (mm)", dy: 20, dx: 20, angle: -90, position: "insideLeft", fontSize: 10, margin: 0 }} fontSize={10} />
                <YAxis
                    yAxisId="right"
                    fontSize={10}
                    orientation="right"
                    label={{ value: "Accumulated (mm)", dy: 40, dx: -20, angle: 90, position: "insideRight", fontSize: 10 }}
                />
                <Tooltip content={CustomTooltip}/>
                <Legend verticalAlign="top"
                    wrapperStyle={{
                        fontSize: "10px",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        maxWidth: "100%",
                        paddingBottom: "10px"
                    }} />
                <Bar yAxisId="left" dataKey="Rain" fill="#4A90E2" name="Monthly Rain" />
                <Line yAxisId="right" type="monotone" dataKey="Accumulated" stroke="#FF7300" strokeWidth={2} name="Accumulated Rain" />
            </ComposedChart>
        </ResponsiveContainer>
    );
}
