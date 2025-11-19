import React, { useEffect, useRef, useState, useMemo } from "react";
import "cesium/Build/Cesium/Widgets/widgets.css";
import { useRouter, useParams } from "next/navigation";
import LogoSection from "@/components/Reusable/HeaderComponents/LogoSection";
import WaterChart from "@/components/InSar/ChartWater";
import "cesium-navigation-es6/dist/styles/cesium-navigation.css";
import Papa from "papaparse";
import MonthSlider from "@/components/Reusable/Slider";
import { FaFilter } from "react-icons/fa";
import InSARCard from "@/components/InSar/CardLeft";
import NavSection from "@/components/Reusable/HeaderComponents/NavSection";
import { insarMenuItems } from "@/config/menuConfig";

const Viewer = ({ title, url, transform, setTransform }) => {
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
      <div style={{
        background: "linear-gradient(to bottom, #0B514E, #3A3A3A)",
        color: "#fff",
        padding: "4px 8px",
        borderRadius: "4px",
        fontWeight: "bold",
        fontSize: "14px",
        width: "100%",
        display: "flex",
        justifyContent: "center"
      }}>
        {title}
      </div>
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
            maxWidth: "100%",
            maxHeight: "100%",
          }} />
      </div>
    </div>
  )
};

const WB_insar = () => {
  const { client } = useParams();
  const [year, setYear] = useState("2025");
  const [month, setMonth] = useState("September");
  const [latestDate, setLatestDate] = useState(null);
  const [summaryData, setSummaryData] = useState([]);
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [rows, setRows] = useState([]);

  const basePath = `/data/INSAR/Water/${year}`;

  // -------- Left cards --------
  useEffect(() => {
    fetch("/data/INSAR/Data/InSAR_Summary.csv")
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => setSummaryData(result.data || []),
        });
      });
  }, []);

  // Choose the row to render
  const rowToRender =
    summaryData.length > 0
      ? summaryData[1]
      : null;

  const cardStyle = {
    backgroundColor: "#262626",
    borderRadius: "10px",
    padding: "10px 20px",
    color: "#f5f5f5",
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  };

  const cardTitleStyle = {
    fontSize: "18px",
    margin: 0,
    color: "#f5f5f5"
  };

  const selectStyle = {
    width: "100%",
    padding: "6px 8px",
    borderRadius: "6px",
    backgroundColor: "#0B514E",
    color: "#fff",
    fontSize: "14px",
    border: "none",
    outline: "none"
  };

  const getStatusColor = (status) => {
    if (status === "Increasing") return "#FFFF00";
    if (status === "Decreasing") return "#FFFF00";
    if (status === "Dry") return "#F59E0B";
    return "#ccc";
  };

  const monthOptions = [
    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
  ];

  const yearOptions = [
    "2025"
  ];

  return (
    <div style={{ flex: 1, paddingTop: "10px" }}>
      <div style={{ display: "flex", flexDirection: "column", background: "#050910" }}>
      </div>
      <div style={{
        display: "flex",
        gap: "10px",
        height: "100%",
        flexWrap: "nowrap",
      }}>
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
          {/*Maps */}
          <div style={{ borderRadius: "10px", flex: 1, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px" }}>
            <Viewer
              title="False Color Map"
              url={`${basePath}/False Color/${month}_False Color.png`}
              transform={transform}
              setTransform={setTransform}
            />
            <Viewer
              title="True Color Map"
              url={`${basePath}/True Color/${month}_True Color.png`}
              transform={transform}
              setTransform={setTransform}
            />
            <Viewer
              title="MNDWI Color Map"
              url={`${basePath}/MNDWI/${month}_MNDWI.png`}
              transform={transform}
              setTransform={setTransform}
            />
          </div>

          <WaterChart selectedMonth={month} selectedYear={year} onStatusChange={setRows} />

        </div>
        {/* RIGHT: Filters & cards */}
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
            flexDirection: "column",
            backgroundColor: "#073331",
            padding: "16px",
            minWidth: 0,
            borderRadius: "10px",
            justifyContent: "space-between"
          }}>
            <div style={{ marginBottom: "12px", fontWeight: "bold", color: "#f5f5f5", fontSize: "18px", gap: "10px", display: "flex", alignItems: "-moz-initial" }}>
              <FaFilter size={18} color="#E97132" />
              IMAGE SELECTION
            </div>

            {/* Date Picker */}
            <label style={{ display: "block", marginBottom: "10px", padding: "10px", border: "1px solid #0C7266", borderRadius: "10px" }}>
              <span style={{ display: "block", marginBottom: "4px", color: "#ccc", fontSize: "14px" }}>Period Selection</span>
              <div style={{ display: "flex", gap: "10px" }}>
                <img
                  src="/icons/Calendar.svg"
                  style={{
                    width: "30px",
                    height: "30px",
                    objectFit: "contain",
                  }} />
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  style={selectStyle}
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  style={selectStyle}
                >
                  {monthOptions.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </label>
          </div>

          {/* Status Card */}
          <div style={{ ...cardStyle, flex: 0.2 }}>
            <h4 style={cardTitleStyle}>Status</h4>
            {rows.length > 0 && (
              <div style={{ marginTop: "20px" }}>
                {rows.map(([label, value], index) => (
                  <div key={index} style={{ display: "flex" }}>
                    <div
                      style={{
                        width: "100px",
                        textAlign: "left",
                        paddingRight: "8px",
                        fontSize: "18px",
                        color: "#bbb",
                        fontWeight: "bold",
                      }}
                    >
                      {label}
                    </div>
                    <div style={{ paddingRight: "4px" }}>:</div>
                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: "bold",
                        color: getStatusColor(value),
                      }}
                    >
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {rowToRender && (
            <InSARCard summarydata={rowToRender} />
          )}
        </div>

      </div>
    </div>
  );
};

export default WB_insar;
