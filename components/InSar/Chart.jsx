import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import {
  LineChart,
  Line,
  Label,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend
} from "recharts";
import { timeParse, timeFormat } from "d3-time-format";

const parseTime = timeParse("%Y-%m-%d");
const formatTime = timeFormat("%b %Y");

const InSARChart = ({ areaName, fromYear, toYear, fromMonth = 1, toMonth = 12 }) => {
  const [chartData, setChartData] = useState([]);
  const latestDate = chartData.length > 0
    ? chartData[chartData.length - 1].Date
    : null;

  useEffect(() => {
    const fileName = `TelferTSF_${areaName}.csv`;

    Papa.parse(`/data/INSAR/Data/Telfer/${fileName}`, {
      header: true,
      download: true,
      complete: (result) => {
        const startDate = new Date(fromYear, fromMonth - 1); // inclusive
        const endDate = new Date(toYear, toMonth); // exclusive

        const cleaned = result.data
          .map((row) => {
            const parsedDate = parseTime(row.Date);
            return {
              Date: parsedDate,
              Value: parseFloat(row.Value),
              Velocity: parseFloat(row.Velocity),
            };
          })
          .filter((row) => {
            if (!row.Date || isNaN(row.Value)) return false;
            return row.Date >= startDate && row.Date < endDate;
          });


        setChartData(cleaned);
      },
    });
  }, [areaName, fromYear, toYear, fromMonth, toMonth]);


  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const date = new Date(label).toLocaleString("en-GB", {
        day: "2-digit",
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
            let unit = item.dataKey === "Value" ? "mm" : "mm/day";
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

  return (
    <div
      style={{
        gridColumn: "2 / 4",
        gridRow: "2 / 3",
        background: "#262626",
        padding: "20px",
        color: "#fff",
        borderRadius: "10px",
        fontSize: "15px"
      }}
    >
      <h3 style={{ margin: "0 0 10px" }}>Analysis Charts</h3>
      <ResponsiveContainer width="100%" height="75%">
        <LineChart data={chartData}>
          <CartesianGrid stroke="#444" strokeDasharray="3 3" />
          <XAxis
            dataKey="Date"
            type="number"
            scale="time"
            domain={["auto", "auto"]}
            tickFormatter={formatTime}
            stroke="#ccc"
            fontSize={12}
          />
          <YAxis fontSize={12} yAxisId="left" stroke="#ccc">
            <Label
              value="Deformation (mm)"
              angle={-90}
              position="insideLeft"
              dy={40}
              style={{ fill: "#ccc", fontSize: "12px" }}
            />
          </YAxis>
          <YAxis fontSize={12} yAxisId="right" orientation="right" stroke="#ccc">
            <Label
              value="Velocity (mm/day)"
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
            dataKey="Value"
            stroke="#C00000"
            dot={{ r: 3 }}
            name="Deformation"
            strokeWidth={2.5}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="Velocity"
            stroke="#00BFFF"
            strokeDasharray="5 5"
            dot={{ r: 0 }}
            strokeWidth={2.5}
          />
        </LineChart>
      </ResponsiveContainer>
      {latestDate && (
              <div style={{ marginTop: "10px", fontSize: "12px", color: "#aaa", textAlign: "right", fontStyle: "italic" }}>
                Latest update: {latestDate.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </div>
            )}
    </div>
  );
};

export default InSARChart;
