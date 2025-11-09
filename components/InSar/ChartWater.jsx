import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import {
  ComposedChart,
  Bar,
  Line,
  Label,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from "recharts";

const WaterChart = ({ selectedMonth, selectedYear, onStatusChange }) => {
  const [chartData, setChartData] = useState([]);
  const latestDate = chartData.length > 0
    ? chartData[chartData.length - 1].Date
    : null;

  useEffect(() => {
    Papa.parse("/data/INSAR/Data/Telfer/WaterBodySummary.csv", {
      header: true,
      download: true,
      complete: (result) => {
        const cleaned = result.data
          .filter((row) => row.Date && row.TSF7 && row.TSF8)
          .map((row) => ({
            Date: new Date(row.Date).getTime(), // <— numeric timestamp
            TSF7: parseFloat(row.TSF7),
            TSF8: parseFloat(row.TSF8),
            Rainfall: parseFloat(row.Rainfall),
          }))

          .sort((a, b) => a.Date - b.Date);

        // ✅ Add status fields by comparing with previous month
        const withStatus = cleaned.map((item, index, arr) => {
          if (index === 0)
            return { ...item, TSF7_Status: "N/A", TSF8_Status: "N/A" };

          const prev = arr[index - 1];
          const getStatus = (curr, prev) => {
            if (curr === 0) return "Dry";
            if (curr < prev) return "Decreasing";
            if (curr > prev) return "Increasing";
            return "Stable";
          };

          return {
            ...item,
            TSF7_Status: getStatus(item.TSF7, prev.TSF7),
            TSF8_Status: getStatus(item.TSF8, prev.TSF8),
          };
        });

        setChartData(withStatus);
      },
    });
  }, []);

  // ✅ Whenever selectedMonth changes, find that month’s record and report status
  useEffect(() => {
    if (!selectedMonth || chartData.length === 0) return;

    const selectedRecord = chartData.find((d) => {
      const dateObj = new Date(d.Date); // ✅ convert timestamp back to Date

      const monthName = dateObj.toLocaleString("en-US", { month: "long" });
      const monthKey =
        dateObj.getFullYear() +
        "-" +
        String(dateObj.getMonth() + 1).padStart(2, "0");

      return (
        monthName.toLowerCase() === selectedMonth.toLowerCase() ||
        monthKey === selectedMonth
      );
    });

    if (selectedRecord && onStatusChange) {
      onStatusChange([
        ["TSF-7", selectedRecord.TSF7_Status],
        ["TSF-8", selectedRecord.TSF8_Status],
      ]);
    }
  }, [selectedMonth, chartData, onStatusChange]);


  const monthMap = {
    January: "01",
    February: "02",
    March: "03",
    April: "04",
    May: "05",
    June: "06",
    July: "07",
    August: "08",
    September: "09",
    October: "10",
    November: "11",
    December: "12"
  };
  
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
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
            minWidth: "100px",
          }}
        >
          <div><strong>{date}</strong></div>
          {payload.map((item) => {
            let unit = item.dataKey === "Rainfall" ? "mm" : "km²";
            return (
              <div key={item.dataKey}>
                {item.name}: <span style={{ color: item.color }}>{item.value} {unit}</span>
              </div>
            );
          })}
        </div>
      );
    }

    return null;
  };

  const renderLabel = ({ x, y, width, height, value, stroke }) => {
    if (value == null) return null;
    const text = String(value); const paddingX = 4; const paddingY = 2; const textWidth = text.length * 6; const boxWidth = textWidth + paddingX * 2; const boxHeight = 14;
    const isBar = width != null && height != null;
    const labelX = isBar ? x + width / 2 : x;
    const labelY = isBar ? y + height / 2 : y; return (<g> {/* background box */} <rect x={labelX - boxWidth / 2} y={labelY - boxHeight / 2} width={boxWidth} height={boxHeight} fill="#262626" rx={3} ry={3} /> {/* text */} <text x={labelX} y={labelY + 3} textAnchor="middle" fill={stroke || "#fff"} fontSize="10" fontWeight="bold" > {text} </text> </g>);
  };

  return (
    <div
      style={{
        background: "#262626",
        padding: "20px",
        color: "#fff",
        borderRadius: "10px",
        fontSize: "15px",
        flex: 1,
        display: "flex",
        flexDirection: "column"
      }}
    >
      <h3 style={{ margin: "0 0 10px" }}>WATER BODY MAPPING</h3>
      <ResponsiveContainer width="100%" height="80%">
        <ComposedChart data={chartData}>
          <defs>
            <pattern
              id="rainPattern"
              patternUnits="userSpaceOnUse"
              width="6"
              height="6"
              patternTransform="rotate(45)"
            >
              <rect width="6" height="6" fill="rgba(74,144,226,0.2)" />  {/* light background */}
              <line x1="0" y1="0" x2="0" y2="6" stroke="#4A90E2" strokeWidth="2" />
            </pattern>
          </defs>

          <CartesianGrid stroke="#444" strokeDasharray="3 3" />
          <XAxis
            dataKey="Date"
            stroke="#ccc"
            fontSize={12}
            tickFormatter={(timestamp) =>
              new Date(timestamp).toLocaleDateString("en-GB", {
                month: "short",
                year: "2-digit",
              })
            }
          />

          <YAxis fontSize={12} yAxisId="left" stroke="#ccc">
            <Label
              value="Water Area (km²)"
              angle={-90}
              position="insideLeft"
              dy={40}
              style={{ fill: "#ccc", fontSize: "12px" }}
            />
          </YAxis>
          <YAxis
            fontSize={12}
            yAxisId="right"
            orientation="right"
            stroke="#ccc"
            scale="log"
            domain={[0.1, 1000]} // avoid log(0)
            allowDataOverflow
          >
            <Label
              value="Rainfall (mm)"
              angle={90}
              position="insideRight"
              dy={40}
              style={{ fill: "#ccc", fontSize: "12px" }}
            />
          </YAxis>

          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: "12px" }} />

          <Line
            yAxisId="left"
            type="monotone"
            dataKey="TSF7"
            stroke="#FFC000"
            label={(props) => renderLabel({ ...props, stroke: "#FFC000" })}
            dot={false}
            name="TSF-7"
            strokeWidth={2}
            strokeDasharray="5 5"
          />

          <Line
            yAxisId="left"
            type="monotone"
            dataKey="TSF8"
            stroke="#FFFF00"
            label={(props) => renderLabel({ ...props, stroke: "#FFFF00" })}
            dot={false}
            name="TSF-8"
            strokeWidth={2}
            strokeDasharray="5 5"
          />
          <Bar yAxisId="right" dataKey="Rainfall" fill="url(#rainPattern)" name="Monthly Rain" label={(props) => renderLabel({ ...props, stroke: "#4A90E2" })} />
        </ComposedChart>
      </ResponsiveContainer>
      {latestDate && (
        <div
          style={{
            marginTop: "10px",
            fontSize: "12px",
            color: "#aaa",
            textAlign: "right",
            fontStyle: "italic",
          }}
        >
          Latest update:{" "}
          {new Date(latestDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
          })}
        </div>
      )}

    </div>
  );
};

export default WaterChart;
