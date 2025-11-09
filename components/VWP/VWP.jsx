import React, { useEffect, useState, useRef } from "react";
import Papa from "papaparse";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ReferenceLine,
    ResponsiveContainer,
    Label,
} from "recharts";
import LogoSection from '@/components/Reusable/HeaderComponents/LogoSection';

const Viewer = ({ url, transform, setTransform }) => {
    const containerRef = useRef(null);
    const isDragging = useRef(false);
    const lastPos = useRef({ x: 0, y: 0 });

    const handleWheel = (e) => {
        e.preventDefault();
        const scaleFactor = 0.1;
        let newScale = transform.scale + (e.deltaY < 0 ? scaleFactor : -scaleFactor);
        newScale = Math.min(Math.max(newScale, 1), 5); // clamp between 1x and 5x
        setTransform({ ...transform, scale: newScale });
    };

    const handleMouseDown = (e) => {
        isDragging.current = true;
        lastPos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
        if (!isDragging.current) return;
        const dx = e.clientX - lastPos.current.x;
        const dy = e.clientY - lastPos.current.y;
        lastPos.current = { x: e.clientX, y: e.clientY };
        setTransform({
            ...transform,
            x: transform.x + dx,
            y: transform.y + dy,
        });
    };

    const handleMouseUp = () => {
        isDragging.current = false;
    };

    return (
        <div
            ref={containerRef}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
                backgroundColor: "#262626",
                borderRadius: "8px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                flex: 1,
                overflow: "hidden",
            }}>
            <div
                style={{
                    position: "relative",
                    display: "flex",
                    padding: "5px",
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                }}
            >
                <img
                    src={url}
                    style={{
                        transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                        transformOrigin: "center center",
                        transition: isDragging.current ? "none" : "transform 0.05s linear",
                        userSelect: "none",
                        pointerEvents: "none",
                        width: "100%",                       
                        objectFit: "cover",   // 👈 fill container, may crop
                        display: "block",
                    }}
                />

            </div>
        </div>
    )
};

function VWP() {
    const [data, setData] = useState([]);
    const [summary, setSummary] = useState({
        lastUpdate: "",
        highestWVP: { point: "", value: 0 },
        status: "No Significant",
        location: { site: "Demo Pit", mine: "Demo Mine", lat: "--48.917", lon: "115.111" },
        levels: {},
    });
    const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });


    useEffect(() => {
        Papa.parse("/data/VWP/vwp_data.csv", {
            download: true,
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const parsed = results.data.map((row) => ({
                    Date: row["Date"],
                    Reservoir: parseFloat(row["Reservoir (ft)"]),
                    "PZ-21B": parseFloat(row["PZ-21B (ft)"]),
                    "PZ-22C": parseFloat(row["PZ-22C (ft)"]),
                    "PZ-23A": parseFloat(row["PZ-23A (ft)"]),
                    "PZ-24B": parseFloat(row["PZ-24B (ft)"]),
                    TARP2: parseFloat(row["TARP Level 2"] || 7650),
                    TARP3: parseFloat(row["TARP Level 3"] || 7660),
                }));

                setData(parsed);

                if (parsed.length > 0) {
                    const lastRow = parsed[parsed.length - 1];
                    const date = lastRow.Date;

                    // Find the highest piezometer reading
                    const piezometers = ["PZ-21B", "PZ-22C", "PZ-23A", "PZ-24B"];
                    const values = piezometers.map((p) => ({
                        point: p,
                        value: lastRow[p],
                    }));
                    const highest = values.reduce((a, b) => (a.value > b.value ? a : b));

                    // Determine status based on thresholds
                    let level = "LEVEL 1";
                    if (highest.value >= lastRow.TARP3) level = "LEVEL 3";
                    else if (highest.value >= lastRow.TARP2) level = "LEVEL 2";

                    const levels = {};
                    piezometers.forEach((p) => {
                        const val = lastRow[p];
                        if (val >= lastRow.TARP3) levels[p] = "LEVEL 3";
                        else if (val >= lastRow.TARP2) levels[p] = "LEVEL 2";
                        else levels[p] = "LEVEL 1";
                    });

                    setSummary({
                        lastUpdate: date,
                        highestWVP: highest,
                        status: level === "LEVEL 1" ? "No Significant" : level,
                        location: {
                            site: "Demo Pit",
                            mine: "Demo Mine",
                            lat: "--48.917",
                            lon: "115.111",
                        },
                        levels,
                    });
                }
            },
        });
    }, []);

    const cardStyle = {
        flex: "1",
        minWidth: "200px",
        backgroundColor: "#1B1B1B",
        borderRadius: "10px",
        padding: "20px",
        color: "#f5f5f5",
        textAlign: "left",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
    };

    const cardTitleStyle = {
        fontSize: "15px",
        margin: 0,
        marginBottom: "5px",
        color: "#14B8A6"
    };

    const cardValueStyle = {
        fontSize: "28px",
        fontWeight: "bold",
        margin: 0
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload || !payload.length) return null;

        // Sort payload by value descending
        const sortedPayload = [...payload].sort((a, b) => b.value - a.value);

        return (
            <div style={{
                backgroundColor: "#1B1B1B",
                border: "1px solid #5A6474",
                padding: "10px",
                borderRadius: "6px",
                color: "#f5f5f5",
                fontSize: "12px"
            }}>
                <p style={{ marginBottom: "6px" }}>{label}</p>
                {sortedPayload.map((entry, index) => (
                    <div key={index} style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        <span style={{
                            width: 10,
                            height: 10,
                            backgroundColor: entry.color,
                            borderRadius: "50%",
                            display: "inline-block"
                        }}></span>
                        <span>{entry.name}: {entry.value} ft</span>
                    </div>
                ))}
            </div>
        );
    };

    const container = { display: "flex", flexDirection: "column", color: "white", fontFamily: "Arial", borderRadius: 5, height: "100%" };
    const sectionTitle = { fontWeight: "bold", fontSize: 18, marginBottom: 6 };
    const card = { backgroundColor: "#073331", padding: 10, borderRadius: 5, marginBottom: 8 };
    const labelBox = {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 5,
    };
    const label = { padding: "4px 8px", borderRadius: 5, fontSize: 13 };
    const valueBox = {
        backgroundColor: "#009c66",
        color: "white",
        fontWeight: "bold",
        padding: "4px 10px",
        borderRadius: 5,
        fontSize: 13,
        minWidth: 120,
        textAlign: "center",
    };
    const tableHeader = { display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: 18, marginTop: 10 };
    const row = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 };
    const statusBox = (level) => ({
        backgroundColor:
            level === "LEVEL 3" ? "red" : level === "LEVEL 2" ? "orange" : "#00ff00",
        color: "black",
        fontWeight: "bold",
        padding: "4px 12px",
        borderRadius: 5,
        fontSize: 13,
        textAlign: "center",
        minWidth: 100,
    });

    return (
        <div style={{
            width: "100vw",
            height: "100vh",
            boxSizing: "border-box",
            overflowY: "hidden",
            overflowX: "hidden",
            backgroundColor: "#050910",
            color: "#f5f5f5",
            fontFamily: "Inter, sans-serif",
            display: "flex",
            flexDirection: "column",
            padding: "10px",
            gap: "10px"
        }}>

            {/* Header */}
            <div style={{ flexShrink: 0 }}>
                <LogoSection Subtitle="Vibrating Wire Piezometer (VWP)" />
                <div style={{
                    height: "4px",
                    borderRadius: "20px",
                    background: "linear-gradient(to bottom, #1E1E1E, #3A3A3A)"
                }} />
            </div>

            {/* Main Content */}
            <div style={{
                display: "flex",
                gap: "10px",
                height: "100%",
                flexWrap: "nowrap",
            }}>
                {/* Sidebar */}
                <div style={{
                    flex: "0 0 25%",
                    minWidth: "200px",
                    maxWidth: "350px",
                    borderRadius: "10px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px"
                }}>

                    <div style={container}>
                        {/* === Summary === */}
                        <div style={card}>
                            <div style={sectionTitle}>Summary</div>
                            <div style={labelBox}>
                                <div style={label}>Last Update on</div>
                                <div style={valueBox}>{summary.lastUpdate || "--"}</div>
                            </div>

                            <div style={labelBox}>
                                <div style={label}>Last Read (ft) in Highest VWP</div>
                                <div style={valueBox}>
                                    {summary.highestWVP.value?.toFixed(3)} - {summary.highestWVP.point}
                                </div>
                            </div>
                            <div style={labelBox}>
                                <div style={label}>Highest Level</div>
                                <div style={statusBox(summary.status.includes("LEVEL") ? summary.status : "LEVEL 1")}>
                                    {summary.status.includes("LEVEL") ? summary.status : "LEVEL 1"}
                                </div>
                            </div>
                            <div style={{ textAlign: "center", fontWeight: "bold", fontSize: 22, margin: "12px 0" }}>
                                “{summary.status}”
                            </div>
                        </div>

                        {/* === Location === */}
                        <div style={{ ...card, backgroundColor: "#1B1B1B" }}>
                            <div style={sectionTitle}>Location</div>
                            <div style={{ color: "#ff9966", fontWeight: "bold", marginBottom: 4 }}>
                                {summary.location.site} - {summary.location.mine}
                            </div>
                            <div style={{ fontSize: 14, color: "#ccc" }}>
                                Lat: {summary.location.lat}, Lon: {summary.location.lon}
                            </div>
                        </div>

                        {/* === Point / Status Table === */}
                        <div style={{ ...card, backgroundColor: "#1B1B1B", flex: 1 }}>
                            <div style={tableHeader}>
                                <div>Point</div>
                                <div>Status</div>
                            </div>

                            {Object.entries(summary.levels).map(([pz, level]) => (
                                <div key={pz} style={row}>
                                    <div style={{ fontSize: 16 }}>{pz}</div>
                                    <div style={statusBox(level)}>{level}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>


                <div style={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    borderRadius: "10px",
                    overflowX: "auto",
                    overflowY: "hidden"
                }}>
                    {/*Maps */}
                    <Viewer
                        url="/VWP_demomap.jpg"
                        transform={transform}
                        setTransform={setTransform}
                    />
                    <div style={cardStyle}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data} margin={{ top: 20, right: 40, left: 20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="Date" tick={{ fontSize: 14 }} />

                                <YAxis
                                    yAxisId="left"
                                    domain={["dataMin - 20", "dataMax + 60"]}
                                    label={{
                                        value: "Reservoir Elevation (ft)",
                                        angle: -90,
                                        position: "insideLeft",
                                        dy: 50,
                                        style: { fill: "#ccc", fontSize: 14 }, // optional for dark mode
                                    }}
                                    tickFormatter={(value) => Math.round(value)}
                                    tick={{ fill: "#ccc", fontSize: 12 }}
                                />

                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    domain={["dataMin - 20", "dataMax + 60"]}
                                    label={{
                                        value: "Piezometer Elevation (ft)",
                                        angle: 90,
                                        position: "insideRight",
                                        dy: 50,
                                        style: { fill: "#ccc", fontSize: 14 },
                                    }}
                                    tickFormatter={(value) => Math.round(value)}
                                    tick={{ fill: "#ccc", fontSize: 12 }}
                                />


                                <Tooltip content={CustomTooltip} />
                                <Legend verticalAlign="bottom" height={36} />

                                {/* Lines */}
                                <Line yAxisId="left" type="monotone" dataKey="Reservoir" stroke="#0000FF" dot={false} strokeWidth={2} />
                                <Line yAxisId="right" type="monotone" dataKey="PZ-21B" stroke="#00B050" dot={false} strokeWidth={2} />
                                <Line yAxisId="right" type="monotone" dataKey="PZ-22C" stroke="#A6A6A6" dot={false} strokeWidth={2} />
                                <Line yAxisId="right" type="monotone" dataKey="PZ-23A" stroke="#7030A0" dot={false} strokeWidth={2} />
                                <Line yAxisId="right" type="monotone" dataKey="PZ-24B" stroke="#00B0F0" dot={false} strokeWidth={2} />

                                {/* TARP Levels */}
                                <Line yAxisId="left" type="monotone" dataKey="TARP2" stroke="gold" strokeWidth={3} dot={false} />
                                <Line yAxisId="left" type="monotone" dataKey="TARP3" stroke="red" strokeWidth={3} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>


                </div>


            </div>
        </div >
    );
}
export default VWP;




