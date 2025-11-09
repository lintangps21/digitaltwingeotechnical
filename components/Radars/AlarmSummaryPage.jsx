import { useEffect, useState } from "react";
import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
  LineChart, Line,
  ResponsiveContainer,
  Label, LabelList,
  ReferenceDot
} from "recharts";
import Header from "@/components/Reusable/Header";
import FilterButton from "@/components/Reusable/FilterButton";


function AlarmSummaryPage() {
  const [data, setData] = useState([]);
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedRadar, setSelectedRadar] = useState(["All Radars"]);
  const [showCumulative, setShowCumulative] = useState("Cumulative");
  const [viewMode, setViewMode] = useState("Total");
  const [reasonFilter, setReasonFilter] = useState("All");
  const [selectedArea, setSelectedArea] = useState(() => {
    return localStorage.getItem("selectedArea") || "All";
  });

  useEffect(() => {
    // Disable horizontal scrolling globally
    document.body.style.overflowX = "hidden";
    document.documentElement.style.overflowX = "hidden";

    const fetchData = async () => {
      if (selectedMonth === "All") {
        const url = `${import.meta.env.BASE_URL}data/RADAR/Alarm/Alarm_All.json`; // ✅ works in dev + prod
        // typically becomes "/Alarm_All.json"
        ;

        try {
          const res = await fetch(url);
          if (!res.ok) {
            console.warn("Alarm_All.json not found");
            setData([]);
            return;
          }
          const json = await res.json();

          setData(Array.isArray(json) ? json : []);
        } catch (err) {
          console.error("Error fetching Alarm_All.json:", err.message);
          setData([]);
        }

      } else {
        // fetch individual month
        const selectedMonthNumber = new Date(`${selectedMonth} 1, ${selectedYear}`).getMonth() + 1;
        const formattedMonth = `${selectedYear}-${selectedMonthNumber.toString().padStart(2, '0')}`;
        const url = `${import.meta.env.BASE_URL}data/RADAR/Alarm/Alarm_${formattedMonth}.json`;

        try {
          const res = await fetch(url);
          if (!res.ok) {
            console.warn(`File not found: ${formattedMonth}`);
            setData([]);
            return;
          }
          const json = await res.json();
          setData(Array.isArray(json) ? json : []);
        } catch (err) {
          console.error(`Error fetching ${formattedMonth}:`, err.message);
          setData([]);
        }
      }
    };

    fetchData();
  }, [selectedYear, selectedMonth]);


  const filteredData = data.filter(item => {
    const createdDate = new Date(item.AlarmTriggeredTime);
    if (isNaN(createdDate)) return false;

    const itemYear = createdDate.getFullYear();
    const itemMonth = createdDate.toLocaleString("default", { month: "long" });

    const matchesYear = selectedYear === "All" || itemYear === parseInt(selectedYear);
    const matchesMonth = selectedMonth === "All" || itemMonth === selectedMonth;
    const matchesRadar = selectedRadar.includes("All Radars") || selectedRadar.includes(item.field_1);


    const hasAlarm = item.AlarmTriggeredTime && item.AlarmTriggeredTime.trim() !== "";

    return hasAlarm && matchesYear && matchesMonth && matchesRadar;
  });

  const ssrCounts = {};
  const filteredReasonSource = reasonFilter === "All"
    ? filteredData
    : filteredData.filter(item =>
      reasonFilter === "Valid" ? item.field_9 === "Valid" : item.field_9 !== "Valid"
    );

  const reasonCounts = {};
  filteredReasonSource.forEach(item => {
    const reason = item.field_10 || "Unspecified";
    reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
  });

  //TOP REASON
  const [topReason, topCount] = Object.entries(reasonCounts)
    .reduce((max, curr) => (curr[1] > max[1] ? curr : max), ["", 0]);

  const allRadarNames = [...new Set(
    filteredReasonSource.map(item => item.field_1).filter(Boolean)
  )];

  const radarDateCounts = {};

  filteredReasonSource.forEach(item => {
    const ssr = item.field_1 || "Unknown";
    ssrCounts[ssr] = (ssrCounts[ssr] || 0) + 1;

    const reason = item.field_10 || "Unspecified";


    const utcDate = new Date(item.AlarmTriggeredTime);
    const localDate = new Date(utcDate.getTime() + 7 * 60 * 60 * 1000); // UTC+8
    const date = localDate.toISOString().split("T")[0]; // Correct date in UTC+8

    const radar = item.field_1 || "Unknown";

    if (!radarDateCounts[date]) {
      radarDateCounts[date] = {};
      allRadarNames.forEach(name => {
        radarDateCounts[date][name] = 0;
      });
    }

    radarDateCounts[date][radar]++;
  });

  // Only filter if specific radars are selected (not "All Radars")
  const isAllRadarsSelected = selectedRadar === "All Radars" ||
    (Array.isArray(selectedRadar) && selectedRadar.includes("All Radars"));
  // Alarm Regions
  const selectedRadarRegionCounts = {};

  filteredReasonSource.forEach(item => {
    const region = item.field_8 || "Unspecified";
    const radar = item.field_1;

    if (isAllRadarsSelected || selectedRadar.includes(radar)) {
      selectedRadarRegionCounts[region] = (selectedRadarRegionCounts[region] || 0) + 1;
    }
  });

  // Bar Chart Data
  const regionBarChartData = Object.entries(selectedRadarRegionCounts).map(([region, value]) => ({
    name: region,
    value
  }));

  //TOP REGION
  const [topRegion, topRegionCount] = Object.entries(selectedRadarRegionCounts)
    .reduce((max, curr) => (curr[1] > max[1] ? curr : max), ["", 0]);

  // Pie Chart Data
  const totalRegionAlarms = Object.values(selectedRadarRegionCounts).reduce((sum, v) => sum + v, 0);

  const regionPieChartData = Object.entries(selectedRadarRegionCounts).map(([region, count]) => {
    const percentage = parseFloat(((count / totalRegionAlarms) * 100).toFixed(1));
    return {
      name: region,
      count,
      percentage
    };
  });


  // Total alarms
  const totalAlarms = filteredReasonSource.length;

  // Valid alarms
  const validAlarms = filteredReasonSource.filter(item => item.field_9 === "Valid").length;
  const percentageValid = totalAlarms > 0 ? Math.round((validAlarms / totalAlarms) * 100) : 0;

  // False alarms
  const falseAlarms = filteredReasonSource.filter(item => item.field_9 === "False").length;
  const percentageFalse = totalAlarms > 0 ? Math.round((falseAlarms / totalAlarms) * 100) : 0;

  const ssrChartData = Object.entries(ssrCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const reasonChartData = Object.entries(reasonCounts).map(([name, value]) => ({ name, value }));
  const lineChartData = Object.entries(radarDateCounts).map(([date, radars]) => ({
    name: date,
    ...radars
  }));

  //TOP RADAR
  const [topRadar, topRadarCount] = Object.entries(ssrCounts)
    .reduce((max, curr) => (curr[1] > max[1] ? curr : max), ["", 0]);

  //Priority Chart
  const priorityLevelMap = {
    "Red Alarm": { label: "1", color: "#EF4444" },     // Red
    "Orange Alarm": { label: "2", color: "#F97316" },  // Orange
    "Yellow Alarm": { label: "3", color: "#EAB308" },  // Yellow
    "Purple Alarm": { label: "4", color: "#A855F7" },  // Purple
    "Blue Alarm": { label: "5", color: "#3B82F6" }     // Blue
  };

  const colorByLevel = Object.values(priorityLevelMap).reduce((acc, { label, color }) => {
    acc[label] = color;
    return acc;
  }, {});

  // fixed levels we care about
  const priorityOrder = ["1", "2", "3", "4", "5"];

  // derive: raw -> level (helper)
  const levelByRaw = Object.entries(priorityLevelMap).reduce((acc, [raw, { label }]) => {
    acc[raw] = label;
    return acc;
  }, {});

  // now count from data
  const counts = filteredReasonSource.reduce((acc, item) => {
    const level = levelByRaw[item.field_7]; // map "Red Alarm" -> "1"
    if (level) acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {});

  // build full chart data (includes zeros)
  const priorityChartData = priorityOrder.map((level) => ({
    name: level,
    value: counts[level] || 0,
    fill: colorByLevel[level] || "#9CA3AF",
  }));

  const PriorityLevelsBox = ({ data }) => {
    return (
      <div
        style={{ ...cardStyle, minWidth: 0 }}
      >
        <p style={{ ...cardTitleStyle, fontWeight: "bold" }}>Priority Levels</p>
        <ResponsiveContainer width="100%">
          <BarChart data={data} >
            <XAxis dataKey="name"
              stroke="#ccc" fontSize={12}
              scale="point"
              padding={{ left: 30, right: 30 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1B1B1B",
                border: "1px solid #5A6474",
                padding: "10px",
                borderRadius: "6px",
                fontSize: "12px",
              }}
              labelFormatter={(label) => (
                <span style={{ color: "white" }}>
                  Level {label}
                </span>
              )}
              formatter={(value, name, props) => {
                const color = props.payload.fill;
                return [
                  <span style={{ color }}>Alarms: {value}</span>,
                  null
                ];
              }}
            />
            <Bar dataKey="value" barSize={dynamicssrBarSize} radius={[5, 5, 0, 0]}>
              {priorityChartData.map((d, i) => (
                <Cell key={i} fill={d.fill} />
              ))}
              <LabelList
                dataKey="value"
                position="top"
                style={{ fontSize: 10, fontWeight: "bold" }}
                content={({ x, y, width, value, index }) => {
                  const color = priorityChartData[index].fill;
                  return (
                    <text
                      x={x + width / 2}
                      y={y - 1}
                      textAnchor="middle"
                      fill={color}
                      fontSize={10}
                      fontWeight="bold"
                    >
                      {value}
                    </text>
                  );
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Cumulative Radars
  const cumulativeDataMap = {};
  const sortedDates = Object.keys(radarDateCounts).sort();

  const cumulativeLineChartData = sortedDates.map(date => {
    const entry = { name: date };
    for (let radar of allRadarNames) {
      const dailyCount = radarDateCounts[date]?.[radar] || 0;
      cumulativeDataMap[radar] = (cumulativeDataMap[radar] || 0) + dailyCount;
      entry[radar] = cumulativeDataMap[radar];
    }
    return entry;
  });

  //Cumulative Regions
  const regionDateMap = {};

  filteredReasonSource.forEach(item => {
    if (!selectedRadar.includes(item.field_1)) return;

    const utcDate = new Date(item.AlarmTriggeredTime);
    const localDate = new Date(utcDate.getTime() + 7 * 60 * 60 * 1000); // UTC+8
    const date = localDate.toISOString().split("T")[0]; // Correct date in UTC+8

    const region = item.field_8 || "Unspecified";

    if (!regionDateMap[date]) regionDateMap[date] = {};
    regionDateMap[date][region] = (regionDateMap[date][region] || 0) + 1;
  });

  const allRegions = [...new Set(Object.values(regionDateMap).flatMap(r => Object.keys(r)))];

  const regionLineChartData = Object.entries(regionDateMap)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([date, counts]) => {
      const entry = { name: date };
      allRegions.forEach(region => {
        entry[region] = counts[region] || 0;
      });
      return entry;
    });

  const cumulativeMap = {};
  const cumulativeRegionLineChartData = regionLineChartData.map(entry => {
    const cumEntry = { name: entry.name };
    allRegions.forEach(region => {
      cumulativeMap[region] = (cumulativeMap[region] || 0) + (entry[region] || 0);
      cumEntry[region] = cumulativeMap[region];
    });
    return cumEntry;
  });

  const radarArray = Array.isArray(selectedRadar) ? selectedRadar : [selectedRadar];

  const isSingleRadar = radarArray.length === 1 && !isAllRadarsSelected;

  const isMultipleRadars = radarArray.length > 1 || isAllRadarsSelected;

  const chartDataToUse = isMultipleRadars
    ? (showCumulative ? cumulativeLineChartData : lineChartData)
    : (showCumulative ? cumulativeRegionLineChartData : regionLineChartData);


  const radarColors = [
    "#156082", "#E97132", "#196B24", "#0F9ED5", "#A02B93", "#EC4899", "#EF4444", "#8B5CF6"
  ];

  const fullRadarColorMap = {};
  allRadarNames.forEach((radar, index) => {
    fullRadarColorMap[radar] = radarColors[index % radarColors.length];
  });

  // Choose chart keys
  const chartKeys = isMultipleRadars
    ? allRadarNames
    : allRegions;

  const regionColors = [
    "#0EA5E9", "#F43F5E", "#6366F1", "#06B6D4", "#156082", "#EC4899", "#EF4444", "#8B5CF6"
  ];

  const regionColorMap = {};
  allRegions.forEach((region, index) => {
    regionColorMap[region] = regionColors[index % regionColors.length];
  });


  // Alarms per day
  let monthDays;

  if (selectedMonth === "All") {
    const uniqueYearMonthSet = new Set(
      filteredReasonSource.map(item => {
        const d = new Date(item.AlarmTriggeredTime);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      })
    );

    let total = 0;
    uniqueYearMonthSet.forEach(ym => {
      const [year, month] = ym.split("-");
      const daysInMonth = new Date(Number(year), Number(month), 0).getDate();
      total += daysInMonth;
    });

    monthDays = total;
  } else {
    const monthIndex = new Date(`${selectedMonth} 1, ${selectedYear}`).getMonth();
    monthDays = new Date(selectedYear, monthIndex + 1, 0).getDate();
  }
  const alarmsPerDay = totalAlarms > 0 ? Number(totalAlarms / monthDays).toFixed(1) : 0;

  // %Share (Radar)
  const ssrPercentageData = ssrChartData.map(item => {
    const percentage = parseFloat(((item.value / totalAlarms) * 100).toFixed(1));
    return {
      name: item.name,
      value: item.value,                // raw count
      percentage,                       // for tooltip and legend
      fill: fullRadarColorMap[item.name] || "#888"
    };
  });

  // Alarm Improvement Status
  const improvementStatusCounts = {
    Modified: 0,
    "Awaiting Feedback": 0,
    "Not Implemented": 0
  };

  filteredReasonSource.forEach(item => {
    const status = String(item.AlarmImprovementStatus0 || "").trim();
    ;
    if (improvementStatusCounts.hasOwnProperty(status)) {
      improvementStatusCounts[status]++;
    }
  });

  const dtgTotal = Object.values(improvementStatusCounts).reduce((sum, val) => sum + val, 0);

  const improvementMarkers = filteredReasonSource
    .filter(item => {
      const status = String(item.AlarmImprovementStatus0 || "").trim();
      return status !== "";
    })
    .map(item => {
      const utcDate = new Date(item.AlarmTriggeredTime);
      const localDate = new Date(utcDate.getTime() + 8 * 60 * 60 * 1000); // UTC+8
      const date = localDate.toISOString().split("T")[0]; // Correct date in UTC+8

      return {
        date,
        radar: item.field_1 || "Unknown",
        region: item.field_8 || "Unspecified",
        status: String(item.AlarmImprovementStatus0).trim()
      };
    });

  const statusColorMap = {
    "Modified": "#22C55E",           // Green
    "Awaiting Feedback": "#FACC15",  // Amber
    "Not Implemented": "#EF4444",    // Red
  };

  const statusLegendMap = {
    "Not Implemented": {
      color: "#EF4444",
      description: "Recommendation requested but site decided not to implement/no longer needed."
    },
    "Awaiting Feedback": {
      color: "#FACC15",
      description: "Recommendation requested but site has not replied."
    },
    "Modified": {
      color: "#22C55E",
      description: "Recommendation already applied by site."
    }
  };

  const pieColors = ["#0EA5E9", "#F43F5E", "#6366F1", "#06B6D4", "#156082", "#EC4899", "#EF4444", "#8B5CF6"];

  const dropdownStyle = {
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #7F7F7F",
    backgroundColor: "#08403D",
    color: "#fff",
    fontSize: "14px"
  }; const chartCard = {
    backgroundColor: "#262626",
    padding: "20px",
    borderRadius: "10px",
  };

  const chartTitle = {
    marginBottom: "10px",
    fontSize: "18px",
    color: "#f5f5f5",
    marginTop: 0
  };

  const yearOptions = [
    "All",
    ...new Set(
      data
        .map(item => {
          const date = new Date(item.AlarmTriggeredTime);
          return isNaN(date) ? null : date.getFullYear();
        })
        .filter(Boolean)
    ).values()
  ].sort((a, b) => {
    if (a === "All") return -1;
    if (b === "All") return 1;
    return b - a; // descending for years
  });

  const monthOptions = [
    "All",
    ...new Set(
      data
        .map(item => {
          const date = new Date(item.AlarmTriggeredTime);
          return isNaN(date)
            ? null
            : date.toLocaleString("default", { month: "long" });
        })
        .filter(Boolean)
    )
  ];

  const radarOptions = ["All Radars", ...new Set(data.map(d => d.field_1).filter(Boolean))];

  const cardStyle = {
    flex: "1",
    minWidth: "200px",
    backgroundColor: "#262626",
    borderRadius: "10px",
    padding: "20px",
    color: "#f5f5f5",
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  };

  const cardTitleStyle = {
    fontSize: "18px",
    margin: 0,
    marginBottom: "5px",
    color: "#f5f5f5"
  };

  const cardValueStyle = {
    fontSize: "28px",
    fontWeight: "bold",
    margin: 0
  };

  const CustomTooltip = ({ active, payload, label, markers }) => {
    if (!active || !payload || !payload.length) return null;

    const sortedPayload = [...payload].sort((a, b) => b.value - a.value);

    // Filter improvement markers for current label (date)
    const markersForDate = markers?.filter(marker => marker.date === label) || [];

    // Group markers by status
    const statusGrouped = {};
    markersForDate.forEach(marker => {
      const status = marker.status || "Unknown";
      if (!statusGrouped[status]) {
        statusGrouped[status] = [];
      }
      statusGrouped[status].push(marker);
    });

    return (
      <div style={{
        backgroundColor: "#1B1B1B",
        border: "1px solid #5A6474",
        padding: "10px",
        borderRadius: "6px",
        color: "#f5f5f5",
        fontSize: "12px",
        maxWidth: "320px"
      }}>
        <p style={{ marginBottom: "6px", fontWeight: "bold" }}>{label}</p>

        {/* Main chart values */}
        {sortedPayload.
          filter(entry => entry.value > 0)
          .map((entry, index) => (
            <div key={index} style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <span style={{
                width: 10,
                height: 10,
                backgroundColor: entry.color,
                borderRadius: "50%",
                display: "inline-block"
              }}></span>
              <span>{entry.name}: {entry.value}</span>
            </div>
          ))}

        {/* Spacer */}
        {markersForDate.length > 0 && <hr style={{ margin: "8px 0", borderColor: "#444" }} />}

        {/* Improvement Markers by Status */}
        {Object.entries(statusGrouped).map(([status, entries], idx) => (
          <div key={`status-${idx}`} style={{ marginBottom: "6px" }}>
            <div style={{
              fontWeight: "bold",
              color: statusColorMap[status] || "#fff"
            }}>
              {status} ({entries.length})
            </div>
            {(() => {
              const countMap = {};

              entries.forEach(e => {
                const key = isSingleRadar ? e.region : e.radar;
                if (!countMap[key]) {
                  countMap[key] = 0;
                }
                countMap[key]++;
              });

              return Object.entries(countMap).map(([key, count], i) => (
                <div key={i} style={{ marginLeft: "10px", fontSize: "11px", color: "#ccc" }}>
                  • {key}{count > 1 ? ` (${count})` : ""}
                </div>
              ));
            })()}

          </div>
        ))}
      </div>
    );
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, value, payload: entry } = payload[0];

      return (
        <div
          style={{
            backgroundColor: "#1B1B1B",
            border: "1px solid #5A6474",
            padding: "10px",
            borderRadius: "8px",
            color: "#f5f5f5",
            fontSize: "12px",
            minWidth: "100px",
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: "5px" }}>{name}</div>
          <div style={{ color: "#14B8A6" }}>Alarms: {value} ({entry.percentage}%)</div>
        </div>
      );
    }

    return null;
  };

  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
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
          <div style={{ fontWeight: "bold", marginBottom: "5px" }}>{label}</div>
          <div style={{ color: "#14B8A6" }}>
            Alarms : {payload[0].value}
          </div>
        </div>
      );
    }

    return null;
  };

  const totalReason = reasonChartData.reduce((sum, entry) => sum + entry.value, 0);
  const sortedReasonChartData = [...reasonChartData].sort((a, b) => b.value - a.value);

  const ssrChartCount = ssrChartData.length;
  const ssrPointPadding = Math.max(50, 200 / ssrChartCount);
  const dynamicssrBarSize = Math.max(14, 100 - ssrChartCount * 2);

  const regionChartCount = regionBarChartData.length;
  const regionPointPadding = Math.max(50, 200 / regionChartCount);
  const dynamicregionBarSize = Math.max(14, 100 - regionChartCount * 2);

  let chartContent;


  if (filteredReasonSource.length === 0) {
    chartContent = (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "250px",
          color: "#ccc",
          fontStyle: "italic",
        }}
      >
        {reasonFilter === "Valid"
          ? "No valid alarms by radar available."
          : reasonFilter === "False"
            ? "No false alarms by radar available."
            : "No alarms by radar available."}
      </div>
    );
  } else if (isMultipleRadars) {
    chartContent = (
      <ResponsiveContainer width="100%" height={300}>
        {viewMode === "Total" ? (
          <BarChart data={ssrChartData} margin={{ top: 20, right: 10, bottom: 0, left: 0 }}>
            <XAxis dataKey="name" tick={false} tickLine={false} stroke="#ccc" fontSize={12} scale="point" padding={{ left: ssrPointPadding, right: ssrPointPadding }} />
            <YAxis stroke="#ccc" fontSize={12}>
              <Label
                value="Total Alarms"
                angle={-90}
                position="insideLeft"
                dy={30}
                style={{ fill: "#ccc", fontSize: "12px" }}
              />
            </YAxis>
            <Tooltip
              content={<CustomBarTooltip />}
            />
            <Bar dataKey="value" barSize={dynamicssrBarSize} radius={[5, 5, 0, 0]} label={{ position: "top", fill: "#fff", fontSize: 10 }}>
              {ssrChartData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={isSingleRadar ? regionColorMap[entry.name] : fullRadarColorMap[entry.name] || "#999"}
                />
              ))}
            </Bar>
            <Legend
              content={() => {
                const radarsToShow = ssrChartData.map((d) => d.name);
                return (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "10px", color: "#aaa", justifyContent: "center", margin: 0 }}>
                    {radarsToShow.map((name) => (
                      <div key={name} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            backgroundColor: fullRadarColorMap[name] || "#999",
                          }}
                        />
                        <span>{name}</span>
                      </div>
                    ))}
                  </div>
                );
              }}
            />
          </BarChart>
        ) : (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div style={{ width: 300, height: 300 }}>
              <PieChart width={300} height={300}>
                <Tooltip content={<CustomPieTooltip />} />
                <Pie
                  data={ssrPercentageData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={120}
                  labelLine={false}
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = outerRadius - 20;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);

                    const percentage = percent * 100;

                    return (
                      <text
                        x={x}
                        y={y}
                        fill="white"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize="11px"
                      >
                        {percentage < 1 ? "<1%" : `${percentage.toFixed(1)}%`}
                      </text>
                    );
                  }}
                >
                  {ssrPercentageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={fullRadarColorMap[entry.name]} />
                  ))}
                </Pie>
              </PieChart>
            </div>

            <div style={{ minWidth: "200px", maxWidth: "300px", overflowWrap: "break-word" }}>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {ssrChartData.map((entry, index) => {
                  const percentage = ((entry.value / totalReason) * 100).toFixed(1);
                  return (
                    <li
                      key={`legend-${index}`}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "14px",
                        marginBottom: "20px",
                        color: "#f5f5f5",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          fontSize: "12px",
                          color: "#ccc",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            width: 12,
                            height: 12,
                            backgroundColor: fullRadarColorMap[entry.name],
                            borderRadius: "50%",
                            marginRight: 8,
                          }}
                        ></span>
                        {entry.name}
                      </div>
                      <div
                        style={{
                          minWidth: "80px",
                          textAlign: "right",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        {entry.value} ({percentage}%)
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </ResponsiveContainer>
    );
  } else if (isSingleRadar) {
    // Specific radar selected  show alarm region charts
    chartContent = (
      <div style={{ display: "flex", gap: "20px", width: "100%" }}>

        {regionBarChartData.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "#ccc",
              fontStyle: "italic",
              padding: "30px",
            }}
          >
            No region data available for {selectedRadar}.
          </div>
        ) : viewMode === "Total" ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={regionBarChartData} margin={{ top: 20, right: 10, bottom: 0, left: 0 }}>
              <XAxis dataKey="name"
                stroke="#ccc"
                fontSize={9}
                angle={-45}
                textAnchor="end"
                tick={false} tickLine={false}
                interval={0}
                dy={10}
                scale="point" padding={{ left: regionPointPadding, right: regionPointPadding }} />
              <YAxis stroke="#ccc" fontSize={12} />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="value" barSize={dynamicregionBarSize} fill="#14B8A6" radius={[5, 5, 0, 0]} label={{ position: "top", fill: "#fff", fontSize: 10 }}>
                {chartKeys.map((key, index) => (
                  <Cell key={key} fill={isSingleRadar ? regionColorMap[key] : fullRadarColorMap[key]} />))}
              </Bar>
              <Legend
                content={() => {
                  const regionToShow = regionBarChartData.map((d) => d.name);
                  return (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "10px", color: "#aaa", justifyContent: "center", margin: 0 }}>
                      {regionToShow.map((name) => (
                        <div key={name} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <div
                            style={{
                              width: 10,
                              height: 10,
                              backgroundColor: regionColorMap[name] || "#999",
                            }}
                          />
                          <span>{name}</span>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (<div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
          <div style={{ display: "flex", width: "50%" }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Tooltip content={<CustomPieTooltip />} />
                <Pie
                  data={regionPieChartData}
                  dataKey="count"
                  nameKey="name"
                  outerRadius={110}
                  labelLine={false}
                  label={({ cx, cy, midAngle, outerRadius, percent }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = outerRadius - 20;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);

                    const pct = percent * 100;
                    if (pct < 1) return null;
                    return (
                      <text
                        x={x}
                        y={y}
                        fill="#fff"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize="11px"
                      >
                        {pct < 1 ? "<1%" : `${pct.toFixed(1)}%`}
                      </text>
                    );
                  }}
                >
                  {regionPieChartData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ minWidth: "200px", maxWidth: "300px", overflowWrap: "break-word" }}>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {regionPieChartData.map((entry, index) => {
                return (
                  <li
                    key={`legend-${index}`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "14px",
                      marginBottom: "20px",
                      color: "#f5f5f5",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        fontSize: "10px",
                        color: "#ccc",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          width: 12,
                          height: 12,
                          backgroundColor: pieColors[index % pieColors.length],
                          borderRadius: "50%",
                          marginRight: 8,
                        }}
                      ></span>
                      {entry.name}
                    </div>
                    <div
                      style={{
                        minWidth: "80px",
                        textAlign: "right",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      {entry.count} ({entry.percentage}%)
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        )}
      </div>

    );
  };


  return (
  <div style={{ flex: 1, paddingTop: "10px" }}>

      <div style={{
        display: "flex",
        gap: "10px",
        height: "100%",
        flexWrap: "nowrap",
      }}>
        {/* Sidebar Metrixs Placeholder*/}
        <div style={{
          flex: "0 0 25%",
          minWidth: "200px",
          maxWidth: "350px",
          borderRadius: "10px",
          display: "flex",
          flexDirection: "column",
          gap: "10px"
        }}>

          <div style={{
            display: "flex",
            flex: 0.7
          }}>
            <FilterButton
              year={selectedYear}
              month={selectedMonth}
              radar={selectedRadar}
              area={selectedArea}
              yearOptions={yearOptions}
              monthOptions={monthOptions}
              radarOptions={radarOptions}
              onApply={({ year, month, radar, area }) => {
                setSelectedYear(year);
                setSelectedMonth(month);
                setSelectedRadar(radar);
                setSelectedArea(area)
              }}

              onReset={() => {
                setSelectedYear("All");
                setSelectedMonth("All");
                setSelectedRadar(["All Radars"]);
                setSelectedArea("All");
              }}
              onCancel={() => {
                setTmpYear(selectedYear);
                setTmpMonth(selectedMonth);
                setTmpRadar(selectedRadar);
              }}
              top={0}
              right={0}
              iconSize={14}
            />
          </div>

          {/*Total Alarms*/}
          <div style={{ ...cardStyle, minWidth: 0, flex: 0.15 }}>
            <p style={{ ...cardTitleStyle, fontWeight: "bold" }}>Total Alarms</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "40px", color: "#EC834E", fontWeight: "bold" }}> {filteredReasonSource.length}</h2>
                <p style={{ ...cardValueStyle, fontSize: "12px", color: "#ccc", margin: 0 }}>{alarmsPerDay} alarms/day</p>
              </div>
              <div style={{ display: "block", color: "#ccc" }}>
                <p style={{ fontSize: "12px", margin: 0 }}>
                  <span style={{ color: "green" }}>☑ </span>
                  <span style={{ fontWeight: "bold" }}>{percentageValid}%</span> Valid Alarms
                </p>
                <p style={{ fontSize: "12px", margin: 0 }}>
                  <span style={{ color: "red" }}>⮽ </span>
                  <span style={{ fontWeight: "bold" }}>{percentageFalse}%</span> False Alarms
                </p>
              </div>
            </div>
          </div>

          <div style={{
            display: "flex",
            gap: "10px",
            flex: 0.15
          }}>
            {/* Valid/False Alarm */}
            <div style={{ ...cardStyle, minWidth: 0 }}>
              <h4 style={{ ...cardTitleStyle, fontSize: "14px" }}>
                Frequent Alarm
              </h4>
              <p style={{ ...cardValueStyle, fontSize: "20px", color: "#EC834E" }}>{isSingleRadar ? topRegion : topRadar}</p>
            </div>
            <div style={{ ...cardStyle, minWidth: 0 }}>
              <h4 style={{ ...cardTitleStyle, fontSize: "14px" }}>
                Most Alarm Cause
              </h4>
              <p style={{ ...cardValueStyle, fontSize: "16px", color: "#EC834E" }}>{topReason}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {/* Chart Grid */}
        <div style={{
          flex: 1,
          minWidth: 0, // allows it to shrink properly
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          borderRadius: "10px",
          overflowX: "auto",
          overflowY: "hidden"
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 0.5fr",
            gap: "10px",
            flex: 1,
            width: "100%"
          }}>
            {/* Alarms by Radar */}
            <div style={{ ...chartCard }}>
              <div style={{ display: "flex", justifyContent: "space-between", paddingRight: "5px", alignItems: "center" }}>
                <h2 style={chartTitle}> {isMultipleRadars
                  ? viewMode === "Total"
                    ? "Total Alarms by Radar"
                    : "Alarm Share by Radar (%)"
                  : viewMode === "Total"
                    ? `Alarm Region Count  ${selectedRadar}`
                    : `Alarm Region Share (%)  ${selectedRadar}`}</h2>
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value)}
                  style={dropdownStyle}
                >
                  <option value="Total">Total</option>
                  <option value="Percentage">% Share</option>
                </select>
              </div>
              {chartContent}
            </div>

            {/* Alarm Causes - Pie Chart */}
            <div style={{ ...chartCard }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={chartTitle}>Alarm Causes</h2>
                <select
                  value={reasonFilter}
                  onChange={(e) => setReasonFilter(e.target.value)}
                  style={dropdownStyle}
                >
                  <option value="All">All</option>
                  <option value="Valid">Valid Only</option>
                  <option value="False">False Only</option>
                </select>
              </div>
              {filteredReasonSource.length === 0 ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "250px", // Match your chart height
                    color: "#ccc",
                    fontStyle: "italic",
                  }}
                >
                  {reasonFilter === "Valid"
                    ? "No valid alarms available"
                    : reasonFilter === "False"
                      ? "No false alarms available"
                      : "No alarm data available"}
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", width: "100%", maxWidth: "100%", marginTop: 10 }}>
                  <ResponsiveContainer width="60%" height={300}>
                    <PieChart>
                      <Pie
                        data={sortedReasonChartData}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        outerRadius={110}
                        innerRadius={70}
                      >
                        {sortedReasonChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${entry.name || index}`}
                            fill={pieColors[index % pieColors.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{
                        backgroundColor: "#1B1B1B",
                        border: "1px solid #5A6474",
                        padding: "10px",
                        borderRadius: "6px",
                        color: "#f5f5f5",
                        fontSize: "12px"
                      }}
                        itemStyle={{ color: "f5f5f5" }}
                        formatter={(value, _, props) => {
                          const total = reasonChartData.reduce((sum, entry) => sum + entry.value, 0);
                          const reasonName = props?.payload?.name || "Reason";
                          const percentage = ((value / total) * 100).toFixed(1);
                          return [`${value} (${percentage}%)`, reasonName];
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ marginLeft: "20px" }}>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {sortedReasonChartData.map((entry, index) => {
                        const percentage = ((entry.value / totalReason) * 100).toFixed(1);
                        return (
                          <li key={`legend-${index}`} style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontSize: "14px",
                            marginBottom: "6px",
                            color: "#f5f5f5",
                          }}>
                            {/* Left side: icon + reason name */}
                            <div style={{ display: "flex", alignItems: "center", fontSize: "12px", color: "#ccc" }}>
                              <span style={{
                                display: "inline-block",
                                width: 12,
                                height: 12,
                                backgroundColor: pieColors[index % pieColors.length],
                                borderRadius: "50%",
                                marginRight: 8
                              }}></span>
                              {entry.name}
                            </div>

                            {/* Right side: value + percentage */}
                            <div style={{ minWidth: "80px", textAlign: "right", fontSize: "12px", fontWeight: "bold" }}>
                              {entry.value} ({percentage}%)
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )}
            </div>
            {/* Priority Levels*/}
            <PriorityLevelsBox data={priorityChartData} />
          </div>

          {/* Alarm Trends - Line Chart */}
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", paddingRight: "5px", alignItems: "center" }}>
              <h2 style={chartTitle}>{isMultipleRadars
                ? showCumulative
                  ? "Cumulative Alarms by Radar"
                  : "Daily Alarm Trends"
                : showCumulative
                  ? `Cumulative Alarms by Region - ${selectedRadar}`
                  : `Daily Alarm Trends by Region - ${selectedRadar}`}</h2>
              <select
                value={showCumulative ? "Cumulative" : "Daily"}
                onChange={(e) => setShowCumulative(e.target.value === "Cumulative")}
                style={dropdownStyle
                }>
                <option value="Daily">Daily</option>
                <option value="Cumulative">Cumulative</option>
              </select>
            </div>
            {filteredReasonSource.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "250px", // Match your chart height
                  color: "#ccc",
                  fontStyle: "italic",
                }}
              >
                {reasonFilter === "Valid"
                  ? "No valid alarms over time to display."
                  : reasonFilter === "False"
                    ? "No false alarms over time to display."
                    : "No alarms over time to display."}
              </div>
            ) : (
              <div style={{ width: "100%", maxWidth: "100%", overflow: "visible" }}>
                <div style={{ width: "100%", minWidth: 0 }}>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartDataToUse} margin={{ left: 10, right: 10, top: 10 }}>
                      <CartesianGrid stroke="#444" strokeDasharray="3 3" />
                      <XAxis dataKey="name" stroke="#ccc" fontSize={12} />
                      <YAxis stroke="#ccc" fontSize={12} margin={0}>
                        <Label
                          value={showCumulative ? "Cumulative Alarms" : "Daily Alarms"}
                          angle={-90}
                          position="insideLeft"
                          dy={40}
                          style={{ fill: "#ccc", fontSize: "12px" }}
                        />
                      </YAxis>
                      <Tooltip content={<CustomTooltip markers={improvementMarkers} />} />
                      {chartKeys.map((key, index) => (
                        <Line
                          key={key}
                          type="monotone"
                          dataKey={key}
                          stroke={isSingleRadar ? regionColorMap[key] : fullRadarColorMap[key]}
                          strokeWidth={2}
                          dot={{ r: 2 }}
                        />
                      ))}
                      {isMultipleRadars
                        ? improvementMarkers.map((m, index) => (
                          <ReferenceDot
                            key={`dot-${index}`}
                            x={m.date}
                            y={
                              showCumulative
                                ? cumulativeLineChartData.find(d => d.name === m.date)?.[m.radar] || 0
                                : lineChartData.find(d => d.name === m.date)?.[m.radar] || 0
                            }

                            r={6}
                            fill={statusColorMap[m.status] || "#ccc"}
                            ifOverflow="visible"
                          />
                        ))
                        : improvementMarkers
                          .filter(m =>
                            Array.isArray(selectedRadar)
                              ? selectedRadar.includes(m.radar)
                              : m.radar === selectedRadar
                          )

                          .map((m, index) => (
                            <ReferenceDot
                              key={`dot-${index}`}
                              x={m.date}
                              y={
                                showCumulative
                                  ? cumulativeRegionLineChartData.find(d => d.name === m.date)?.[m.region] || 0
                                  : regionDateMap[m.date]?.[m.region] || 0
                              }
                              r={6}
                              fill={statusColorMap[m.status] || "#ccc"}
                              ifOverflow="visible"
                            />
                          ))}
                    </LineChart>
                  </ResponsiveContainer>

                </div>
              </div>
            )}
            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: "10px",
              marginTop: "10px",
              fontSize: "12px",
              color: "#ccc"
            }}>
              {Object.entries(statusLegendMap).map(([status, { color, description }]) => (
                <div key={status} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: color
                  }} />
                  <div>
                    {description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
export default AlarmSummaryPage;




