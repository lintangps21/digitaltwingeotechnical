"use client";
import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  Viewer as CesiumViewer,
  IonImageryProvider,
  Ion,
  KmlDataSource,
  ImageMaterialProperty,
  Color,
  BoundingSphere
} from "cesium";
import { useRouter, useParams } from "next/navigation";
import LogoSection from "@/components/Reusable/HeaderComponents/LogoSection";
import InSARChart from "@/components/InSar/Chart";
import CesiumNavigation from "cesium-navigation-es6";
import Papa from "papaparse";
import MonthSlider from "@/components/Reusable/Slider";
import { DateTime } from "luxon";
import { FaFilter } from "react-icons/fa";
import InSARCard from "@/components/InSar/CardLeft";
import ColorBar from "@/components/InSar/Legend";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import RainChart from "@/components/InSar/RainChart";
import NavSection from "@/components/Reusable/HeaderComponents/NavSection";
import { insarMenuItems } from "@/config/menuConfig";

const Def_insar = () => {
  const viewerRef = useRef(null);
  const { client } = useParams();
  const [polygonLayers, setPolygonLayers] = useState({});
  const currentDataSource = useRef(null);
    // Keep a list of loaded sources instead of just one
  const activeDataSources = useRef([]);

  // 🛠 Keep the two datasets separate
  const [areaSummary, setAreaSummary] = useState([]); // from AreaSummary.csv (for stacked bar)
  const [tsData, setTsData] = useState([]);           // from TelferTSF_<area>.csv (for slider/line)

  const [monthRange, setMonthRange] = useState([0, 12]);
  const [monthData, setMonthData] = useState([]);
  const [yearRange, setYearRange] = useState([2021, 2025]);
  const [selectedType, setSelectedType] = useState("Def");
  const [latestDate, setLatestDate] = useState(null);
  const [startDate, setStartDate] = useState(
    DateTime.fromISO("2025-03-09", { zone: "Australia/Perth" }).toJSDate()
  );
  const [endDate, setEndDate] = useState(
    DateTime.now().setZone("Australia/Perth").toJSDate()
  );
  const [summaryData, setSummaryData] = useState([]);
  const [areaOptions, setAreaOptions] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [opacity, setOpacity] = useState(0.6);

  // -------- Load AreaSummary (names, totals, month counts) --------
  useEffect(() => {
    const csvFile = "/data/INSAR/Data/Telfer/AreaSummary.csv";

    fetch(csvFile)
      .then((res) => res.text())
      .then((text) => {
        const result = Papa.parse(text, { header: true, skipEmptyLines: true });
        const parsed = result.data || [];

        // Save for chart use
        setAreaSummary(parsed);

        // Options for buttons
        const options = parsed.map((row) => ({
          label: row.Name,
          area: (row.Name || "").replace(/\s+/g, ""), // remove spaces
          size: parseFloat(row.Area || 0), // fallback if GRDHSummary has no Area column
          status: row.Status,
        }));

        setAreaOptions(options);
        if (options.length > 0) setSelectedArea(options[0]);
      });
  }, [selectedType]); // <-- re-run when selectedType changes

  // -------- Keys for stacked bar (YYYY-MM from _Used columns) --------
  const monthKeys = useMemo(() => {
    if (areaSummary.length === 0) return [];
    return [...new Set(
      Object.keys(areaSummary[0])
        .filter((key) => key.endsWith("_Used")) // only take used columns
        .map((key) => key.replace("_Used", "")) // remove suffix
    )].sort();
  }, [areaSummary]);

  // -------- Chart data for selected area --------
  const chartData = useMemo(() => {
    if (!selectedArea?.area || areaSummary.length === 0) return [];

    const row = areaSummary.find(
      (r) => (r?.Name || "").replace(/\s+/g, "") === selectedArea.area
    );
    if (!row) return [];

    return monthKeys.map((month) => ({
      month,
      Used: parseInt(row[`${month}_Used`] || 0, 10),
      Unused: parseInt(row[`${month}_Unused`] || 0, 10),
    }));
  }, [selectedArea, areaSummary, monthKeys]);

  // -------- Load time-series for selected area (separate state) --------
  useEffect(() => {
    if (!selectedArea?.area) return;
    const fileName = `TelferTSF_${selectedArea.area}.csv`;

    Papa.parse(`/data/INSAR/Data/Telfer/${fileName}`, {
      header: true,
      download: true,
      complete: (result) => {
        const parsed = (result.data || [])
          .map((row) => ({
            Date: row.Date,
            Value: parseFloat(row.Value),
            Velocity: parseFloat(row.Velocity),
          }))
          .filter((d) => d.Date && !isNaN(d.Value) && !isNaN(d.Velocity));

        // 🛠 this no longer overwrites AreaSummary
        setTsData(parsed);

        // months for slider
        const months = [...new Set(parsed.map(d =>
          new Date(d.Date).toISOString().slice(0, 7)
        ))].sort();

        setMonthData(months);
        setMonthRange([0, Math.max(months.length - 1, 0)]);

        if (parsed.length) {
          const latest = parsed.reduce((a, b) =>
            new Date(a.Date) > new Date(b.Date) ? a : b
          );
          setLatestDate(new Date(latest.Date));
        } else {
          setLatestDate(null);
        }
      },
    });
  }, [selectedArea]);

  // -------- Year range derived from month slider --------
  useEffect(() => {
    if (!monthData.length || monthRange[0] == null || monthRange[1] == null) return;
    const fromYear = parseInt(monthData[monthRange[0]].split("-")[0], 10);
    const toYear = parseInt(monthData[monthRange[1]].split("-")[0], 10);
    setYearRange([fromYear, toYear]);
  }, [monthRange, monthData]);

  // -------- Cesium init --------
  Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkMzI2NjliNi01NDlhLTQ3NDAtYTk2YS1iOGM2OTQ3NDVjNmMiLCJpZCI6MzI0ODUwLCJpYXQiOjE3NTMzNzQ0OTV9.g809L12-53tF168G_1ot11iSlTLJaQToQTzucRcCN2E";

  useEffect(() => {
    let viewer;

    const initCesium = async () => {
      viewer = new CesiumViewer(viewerRef.current, {
        imageryProvider: false,
        baseLayerPicker: false,
        timeline: false,
        animation: false,
        homeButton: false,
        sceneModePicker: false
      });
      if (!viewer) return;
      if (!viewer.scene) return;


      // Add your TIFF as basemap from Cesium Ion
      const layer = viewer.imageryLayers.addImageryProvider(
        await IonImageryProvider.fromAssetId(3647427),
      );

      viewer.scene.globe.baseColor = Color.BLACK

      viewerRef.current.cesiumViewer = viewer;

      new CesiumNavigation(viewer, {
        enableCompass: true,
        enableDistanceLegend: true,
        enableCompassOuterRing: true,
        enableZoomControls: false
      });

      const baseUrl = window.location.origin;

      const sources = {
        EasternEmbankment: `${baseUrl}/data/INSAR/KMZ/Telfer/EasternEmbankment.kmz`,
        EasternSharedWall: `${baseUrl}/data/INSAR/KMZ/Telfer/EasternSharedWall.kmz`,
        NorthernSharedWall: `${baseUrl}/data/INSAR/KMZ/Telfer/NorthernSharedWall.kmz`,
        SouthernSharedWall: `${baseUrl}/data/INSAR/KMZ/Telfer/SouthernSharedWall.kmz`,
        WesternSharedWall: `${baseUrl}/data/INSAR/KMZ/Telfer/WesternSharedWall.kmz`,
      };


      const layerMap = {};
      for (const [name, path] of Object.entries(sources)) {
        try {
          const ds = await KmlDataSource.load(path);
          ds.name = name;
          viewer.dataSources.add(ds);
          layerMap[name] = ds;
        } catch (err) {
          console.warn(`Could not load KMZ for ${name}:`, err);
        }
      }
      setPolygonLayers(layerMap);

      try {
        const defPath = `${window.location.origin}/data/INSAR/KMZ/Telfer/2025/Def05.kmz`;
        const defDS = await KmlDataSource.load(defPath, {
          camera: viewer.scene.camera,
          canvas: viewer.scene.canvas,
        });
        viewer.dataSources.add(defDS);

        // ✅ Track this default datasource too
        activeDataSources.current.push(defDS);
        currentDataSource.current = defDS;
      } catch (err) {
        console.error("Failed to load default Def05:", err);
      }

      // ---------- Focus on Polygon (EasternEmbankment) ----------
      if (layerMap["EasternEmbankment"]) {
        viewer.zoomTo(layerMap["EasternEmbankment"]);
      }
    };
    initCesium();

    return () => {
      if (viewer) {
        viewer.dataSources.removeAll();
        viewer.destroy();
      }
    };
  }, []);

  // -------- Load monthly KMZ for selected month/type --------
  useEffect(() => {
    const viewer = viewerRef.current?.cesiumViewer;
    const selectedMonthStr = monthData[monthRange[1]];
    if (!viewer) return;

    // ✅ Clear ALL previously loaded layers
    activeDataSources.current.forEach(ds => {
      viewer.dataSources.remove(ds, true);
    });
    activeDataSources.current = [];

    if (!selectedMonthStr) return; // nothing to load

    const [year, month] = selectedMonthStr.split("-");
    const kmzPath = `/data/INSAR/KMZ/Telfer/${year}/${selectedType}${month}.kmz`;

    KmlDataSource.load(kmzPath, {
      camera: viewer.scene.camera,
      canvas: viewer.scene.canvas,
    })
      .then((ds) => {
        viewer.dataSources.add(ds);
        activeDataSources.current.push(ds);

        ds.entities.values.forEach(entity => {
          if (entity.rectangle) {
            entity.rectangle.material = new ImageMaterialProperty({
              image: entity.rectangle.material.image,
              color: Color.WHITE.withAlpha(opacity) // adjust opacity
            });
          }
        });
      })
      .catch((err) => {
        console.warn("No KMZ for this month:", kmzPath, err);

      });

  }, [monthRange[1], selectedType, monthData]);



  // -------- Highlight selected area polygon --------
  useEffect(() => {
    const viewer = viewerRef.current?.cesiumViewer;
    if (!viewer || !polygonLayers) return;

    if (!selectedArea?.area) return;

    Object.entries(polygonLayers).forEach(([areaKey, ds]) => {
      const highlight = areaKey === selectedArea.area;
      ds.show = highlight;

      ds.entities.values.forEach((entity) => {
        if (entity.polygon && highlight) {
          entity.polygon.material = Color.WHITE.withAlpha(0.5);
          entity.polygon.outline = true;
          entity.polygon.outlineColor = Color.BLACK;
          entity.polygon.outlineWidth = 2;
        }
      });
    });

    if (polygonLayers[selectedArea.area]) {
      viewer.zoomTo(polygonLayers[selectedArea.area]);
    }
  }, [selectedArea, polygonLayers, selectedType]);


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
      ? summaryData[0]
      : null;

  // -------- Legend scales --------
  const kmzDefScales = {
    "2021-03": { min: 0, max: 40 },
    "2021-04": { min: 0, max: 50 },
    "2021-05": { min: 0, max: 40 },
    "2021-06": { min: 0, max: 50 },
    "2021-07": { min: -40, max: 30 },
    "2021-08": { min: -40, max: 30 },
    "2021-09": { min: -40, max: 30 },
    "2021-10": { min: -20, max: 60 },
    "2021-11": { min: -20, max: 60 },
    "2021-12": { min: 0, max: 70 },
    "2025-05": { min: -10, max: 40 }
  };

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
    fontSize: "12px",
    margin: 0,
    color: "#f5f5f5"
  };

  const getStatusColor = (status) => {
    if (status === "No Significant") return "#10B981";
    if (status === "Regressive") return "#10B981";
    if (status === "Linear") return "#F59E0B";
    if (status === "Progressive") return "#EF4444";
    return "#ccc";
  };

  const cardValueStyle = {
    fontSize: "18px",
    fontWeight: "bold",
    margin: 0
  };

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
            return (
              <div key={item.dataKey}>
                {item.name}: <span style={{ color: item.color }}>{item.value}</span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: "100vw", height: "100vh", boxSizing: "border-box", overflow: "hidden", backgroundColor: "#050910", color: "#f5f5f5", fontFamily: "Inter, sans-serif", display: "flex", flexDirection: "column", padding: "10px", gap: "10px" }}>
      <div style={{ flexShrink: 0 }}>
        <LogoSection Subtitle="InSAR" />
        <NavSection menuItems={insarMenuItems} />

      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "340px 1fr 400px",
        gridTemplateRows: "1fr 300px",
        gap: "10px"
      }}>

        {/* LEFT: Filters & cards */}
        <div style={{ gridRow: "1 / 3", gridColumn: "1 / 2", borderRadius: "10px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", height: "100%" }}>
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
                ADVANCED FILTERING
              </div>

              <label style={{ display: "block", marginBottom: "10px", padding: "10px", border: "1px solid #0C7266", borderRadius: "10px" }}>
                <span style={{ display: "block", marginBottom: "4px", color: "#ccc", fontSize: "14px" }}>Area Selection</span>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <img src="/icons/Location.svg" style={{ width: "35px", height: "35px", objectFit: "contain" }} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "10px", flex: 1 }}>
                    {areaOptions.map((item) => (
                      <button
                        key={item.label}
                        type="button"

                        onClick={() => setSelectedArea(item)}
                        style={{
                          backgroundColor:
                            selectedArea?.area === item.area
                              ? "#14B8A6"
                              : "#08403D",
                          color: selectedArea?.area === item.area ? "#fff" : "#ccc",
                          borderRadius: "6px",
                          padding: "6px",
                          fontSize: "12px",
                          cursor: "pointer",
                          border: "none",
                          outline: "none"
                        }}
                      >
                        {item.label}
                      </button>

                    ))}
                  </div>
                </div>
              </label>
            </div>

            {rowToRender && (
              <InSARCard summarydata={rowToRender} selectedType={selectedType} />
            )}
          </div>
        </div>

        {/* CENTER: Map */}
        <div style={{ gridRow: "1 / 2", gridColumn: "2 / 3", position: "relative" }}>
          <div ref={viewerRef} style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }} />

          <div style={{ position: "absolute", top: "20px", left: "20px", fontSize: "10px", color: "#ccc", borderRadius: "6px", zIndex: 999 }}>
            {["Def", "Coh"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedType(t)}
                style={{
                  flex: 1, border: "none", textAlign: "center", cursor: "pointer",
                  textTransform: "uppercase", fontSize: "12px",
                  fontWeight: selectedType === t ? "bold" : "normal",
                  background: selectedType === t ? "linear-gradient(to bottom, #004C4C, #008080)" : "rgba(0,0,0,0.5)",
                  color: "#fff", padding: "10px"
                }}
              >
                {t === "Def" ? "Deformation" : "Coherence"}
              </button>
            ))}
          </div>

          <div style={{ position: "absolute", top: "60px", left: "20px", fontSize: "10px", color: "#ccc", borderRadius: "6px", zIndex: 999 }}>
            {selectedType === "Def" ? (
              monthData[monthRange[1]] && (
                <ColorBar
                  min={kmzDefScales[monthData[monthRange[1]]]?.min ?? -10}
                  max={kmzDefScales[monthData[monthRange[1]]]?.max ?? 40}
                  gradient="linear-gradient(to bottom, red, yellow, lightgreen, lightblue, blue)"
                  units="(mm)"
                />
              )
            ) : selectedType === "Coh" ? (
              <ColorBar
                min={0.2}
                max={0.9}
                gradient="linear-gradient(to top, black, white)"
                units=""
              />
            ) : (
              <div
                style={{
                  padding: "10px",
                  background: "rgba(0,0,0,0.6)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "white",
                  alignItems: "center",
                  display: "flex",
                  gap: 10
                }}
              >
                <span style={{
                  display: "inline-block",
                  width: 50,
                  height: 20,
                  backgroundColor: "#0003F6"
                }}></span>
                <p>InSAR GRDH Result</p>
              </div>
            )}
          </div>

          {/* Slider Opacity*/}
          <div
            style={{
              position: "absolute",
              bottom: "80px",
              right: "10px",
              height: "200px", // define slider height
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10px",
              color: "#ccc",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              padding: "10px",
              borderRadius: "6px",
              zIndex: 999,
            }}
          >
            <span style={{ marginBottom: "8px" }}>Opacity</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={opacity}
              onChange={(e) => {
                const newOpacity = parseFloat(e.target.value);
                setOpacity(newOpacity);

                const viewer = viewerRef.current?.cesiumViewer;
                if (!viewer) return;

                // Apply opacity to all loaded data sources
                activeDataSources.current.forEach((ds) => {
                  ds.entities.values.forEach((entity) => {
                    if (entity.rectangle) {
                      entity.rectangle.material.color = Color.WHITE.withAlpha(newOpacity);
                    }
                    if (entity.polygon) {
                      // Optional: apply opacity to polygons if needed
                      entity.polygon.material = entity.polygon.material.withAlpha(newOpacity);
                    }
                  });
                });
              }}
              style={{
                writingMode: "bt-lr", // vertical bottom-to-top
                WebkitAppearance: "slider-vertical",
                width: "8px",
                height: "150px",
                accentColor: "#14B8A6",
                background: "linear-gradient(to top, rgba(255,255,255,0.1), rgba(255,255,255,1))",
                borderRadius: "5px",
                outline: "none",
              }}
            />
          </div>


          {/* Slider Timeline*/}
          <div style={{
            position: "absolute",
            bottom: "5px",
            right: "40px",
            width: "300px",
            maxWidth: "90vw",
            fontSize: "10px",
            color: "#ccc",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            padding: "0px 20px 0px 10px",
            borderRadius: "6px",
            zIndex: 999,
          }}>
            <MonthSlider
              data={monthData}
              value={monthRange}
              onRangeChange={setMonthRange}
            />
          </div>
        </div>

        {/* RIGHT: KPI + Stacked bar */}
        <div style={{ gridRow: "1 / 2", gridColumn: "3 / 4", borderRadius: "10px", color: "#f5f5f5", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gridTemplateColumns: "1fr 1fr", gap: "10px", flex: 1 }}>
            <div style={cardStyle}>
              <p style={cardTitleStyle}>Status</p>
              <p style={{ ...cardValueStyle, color: getStatusColor(selectedArea?.status) }}>{selectedArea?.status || "-"}</p>
            </div>
            <div style={cardStyle}>
              <p style={cardTitleStyle}>Coverage Area</p>
              <p style={{ ...cardValueStyle, color: "#EC834E" }}>
                {selectedArea?.size ? (
                  `${selectedArea.size.toFixed(3)} km²`
                ) : (
                  "-"
                )}

              </p>
            </div>
            <div style={cardStyle}>
              <p style={cardTitleStyle}>Max Deformation</p>
              <p style={{ ...cardValueStyle, color: "#EC834E" }}>NaN</p>
            </div>
            <div style={cardStyle}>
              <p style={cardTitleStyle}>Avg Velocity</p>
              <p style={{ ...cardValueStyle, color: "#EC834E" }}>NaN</p>
            </div>
          </div>

          <div style={{ background: "#262626", padding: "20px", color: "#fff", borderRadius: "10px", fontSize: "15px", flex: 1 }}>
            Total vs Used Data
            <ResponsiveContainer width="100%" height={120} >
              <BarChart data={chartData} margin={{ top: 0, right: 10, bottom: 10, left: 0 }}>
                <XAxis dataKey="month" angle={-45} textAnchor="end" fontSize={10} scale="point" padding={{ left: 20, right: 20 }} />
                <YAxis allowDecimals={false} fontSize={10} />
                <Tooltip content={CustomTooltip} />
                <Legend verticalAlign="top"
                  wrapperStyle={{
                    fontSize: "10px",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    maxWidth: "100%",
                    paddingBottom: "10px"
                  }} />
                <Bar dataKey="Used" stackId="a" fill="#00C49F" />
                <Bar dataKey="Unused" stackId="a" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: "#262626", padding: "20px", color: "#fff", borderRadius: "10px", fontSize: "15px", flex: 1 }}>
            Accumulated Rain Chart Data
            <RainChart />
          </div>
        </div>

        {selectedArea && monthData.length > 0 && monthRange.length >= 2 && (
          <InSARChart
            areaName={selectedArea.area}
            fromYear={parseInt(monthData[monthRange[0]]?.split("-")[0] || "0")}
            toYear={parseInt(monthData[monthRange[1]]?.split("-")[0] || "0")}
            fromMonth={parseInt(monthData[monthRange[0]]?.split("-")[1] || "0")}
            toMonth={parseInt(monthData[monthRange[1]]?.split("-")[1] || "0")}
          />
        )}
      </div>
    </div>
  );
};

export default Def_insar;
