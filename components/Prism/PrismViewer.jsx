import React, { useState, Suspense, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import SiteModel from '@/components/Prism/SurfaceModel/SiteModel';
import LogoSection from '@/components/Reusable/HeaderComponents/LogoSection';
import PrismChart from '@/components/Prism/Chart';
import { OrbitSyncProvider } from '@/components/Prism/SurfaceModel/OrbitSyncContext';
import SyncedOrbitControls from '@/components/Prism/SurfaceModel/SyncedOrbitControl';
import Papa from "papaparse";
import Prisms from '@/components/Prism/PrismPoints';
import * as THREE from 'three';
import { FaFilter } from 'react-icons/fa';
import RiskSummary from '@/components/Prism/RiskSummary';
import Select from "react-select";
import { useRouter, useParams } from "next/navigation";
import ColorBar from "@/components/InSar/Legend";


const ViewerCanvas = ({ title, url, isSource, prisms, colorbar }) => {
  const [bbox, setBbox] = useState(null);
 

  return (
    <div style={{
      backgroundColor: "#262626",
      borderRadius: "8px",
      padding: "10px",
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      flexShrink: 1,
      overflow: "hidden",
      position: "relative"
    }}>
      <div style={{
        backgroundColor: "#3b3b3b",
        color: "#fff",
        padding: "4px 8px",
        borderRadius: "4px",
        fontWeight: "bold",
        fontSize: "14px",
        width: "fit-content"
      }}>
        {title}
      </div>


      <div style={{ flexGrow: 1, minHeight: 0, width: "100%", height: "100%", overflow: "hidden" }}>

        <Canvas camera={{ fov: 20 }} style={{ width: "100%", height: "100%", display: "block" }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[10, 10, 10]} intensity={5} />


          <Suspense fallback={null}>
            <SiteModel
              url={url}
              onBoundingBoxComputed={(siteBox) => {
                if (!(siteBox instanceof THREE.Box3)) {
                  console.error("siteBox is not a THREE.Box3!", siteBox);
                  return;
                }

                if (prisms.length > 0) {
                  const prismBox = new THREE.Box3();
                  prisms.forEach(p => {
                    const point = new THREE.Vector3(p.x, p.y, p.z);
                    prismBox.expandByPoint(point);
                  });

                  // expand by prism bounds
                  siteBox.expandByPoint(prismBox.min);
                  siteBox.expandByPoint(prismBox.max);
                }

                setBbox({
                  center: siteBox.getCenter(new THREE.Vector3()),
                  size: siteBox.getSize(new THREE.Vector3())
                });
              }}
            />

            {bbox && <Prisms data={prisms} offset={bbox.center} />}
          </Suspense>

          <SyncedOrbitControls source={isSource} boundingBox={bbox} />
        </Canvas>
      </div>  {/* 🔑 Color bar overlay (relative to ViewerCanvas) */}
      {colorbar && (
        <div
          style={{
            position: "absolute",
            top: "60px",
            left: "20px",
            fontSize: "10px",
            color: "#ccc",
            borderRadius: "6px",
            zIndex: 999,
          }}
        >
          <ColorBar
            min={colorbar.min}
            max={colorbar.max}
            gradient={colorbar.gradient}
            units={colorbar.units}
          />
        </div>
      )}
    </div>
  );
};

export default function PrismViewer() {
  const [prisms, setPrisms] = useState([]);
  const [areaOptions, setAreaOptions] = useState([]);
  const [selectedArea, setSelectedArea] = useState("W5");
  const [selectedIds, setSelectedIds] = useState([]);
  // new state
  const [selectedRisk, setSelectedRisk] = useState(null);
   const { client } = useParams();

  // compute risks based on selectedIds
  const riskOptions = useMemo(() => {
    const risks = prisms
      .filter(p => selectedIds.includes(p.id)) // only prisms in current selection
      .map(p => p.risk);                      // get their risks

    return [...new Set(risks)]; // unique risks
  }, [prisms, selectedIds]);

  const filteredPrisms = useMemo(() => {
    return prisms.filter(p => {
      const matchArea = !selectedArea || p.area === selectedArea;
      const matchRisk = !selectedRisk || p.risk === selectedRisk;
      return matchArea && matchRisk;
    });
  }, [prisms, selectedArea, selectedRisk]);

  const prismOptions = filteredPrisms.map(p => ({
    label: p.id,
    value: p.id
  }));



  useEffect(() => {
    Papa.parse("/data/PRISM/Telfer/Data/PrismSummary.csv", {
      header: true,
      download: true,
      dynamicTyping: true,
      complete: (result) => {
        const cleaned = result.data
          .filter(p => p["Easting (m)"] && p["Northing (m)"] && p["Elevation (m)"])
          .map(p => ({
            x: p["Easting (m)"],
            y: p["Northing (m)"],
            z: p["Elevation (m)"],
            id: p.ID,
            risk: p.RiskRating,
            area: p.Area
          }));
        setPrisms(cleaned);
        // --- Extract unique area options ---
        const uniqueAreas = [...new Set(cleaned.map(p => p.area).filter(Boolean))];
        setAreaOptions(uniqueAreas);
        const sortedAreas = uniqueAreas.sort((a, b) => {
          const numA = parseInt(a.replace("Area ", ""), 10);
          const numB = parseInt(b.replace("Area ", ""), 10);
          return numA - numB;
        });

        setAreaOptions(sortedAreas);
        if (selectedArea) {
          const idsInArea = cleaned
            .filter(p => p.area === selectedArea)
            .map(p => p.id);
          setSelectedIds(idsInArea);
        }
      },
    });
  }, [selectedArea]);

  /* --- Styles --- */
  const blockLabel = {
    display: "block",
    padding: "10px",
    border: "1px solid #0C7266",
    borderRadius: "10px",
  };
  const labelSpan = {
    display: "block",
    color: "#ccc",
    fontSize: "14px",
    marginBottom: "5px"
  };
  const buttonGrid = {
    display: "grid",
    flex: 1,
    gridTemplateColumns: "1fr 1fr",
    gap: "8px"
  };

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      boxSizing: "border-box",
      overflow: "hidden",
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
        <LogoSection Subtitle="Prism" />
        <div style={{
          height: "4px",
          borderRadius: "20px",
          background: "linear-gradient(to bottom, #1E1E1E, #3A3A3A)"
        }} />
      </div>

      {/* Main Content */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(200px, 20%) 1fr",
        gridTemplateRows: "1fr minmax(200px, 40%)",
        gap: "10px",
        flex: 1,
        minHeight: 0
      }}>
        {/* Sidebar */}
        <div style={{ gridRow: "1 / 3", gridColumn: "1 / 2", borderRadius: "10px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", height: "100%" }}>
            <div style={{
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#073331",
              padding: "16px",
              minWidth: 0,
              borderRadius: "10px",
              gap: 10
            }}>
              <div style={{ marginBottom: "12px", fontWeight: "bold", color: "#f5f5f5", fontSize: "18px", gap: "10px", display: "flex", alignItems: "-moz-initial" }}>
                <FaFilter size={18} color="#E97132" />
                ADVANCED FILTERING
              </div>

              {/* Area */}
              <label style={blockLabel}>
                <span style={labelSpan}>Area Selection</span>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <img
                    src="/icons/Location.svg"
                    style={{
                      width: "35px",
                      height: "35px",
                      objectFit: "contain",
                    }} />
                  <div style={buttonGrid}>

                    {areaOptions.map((area) => (
                      <button
                        key={area}
                        type="button"
                        onClick={() => {
                          setSelectedArea(area);
                          // 👇 auto-select all IDs from this area
                          const idsInArea = prisms.filter(p => p.area === area).map(p => p.id);
                          setSelectedIds(idsInArea);
                        }}
                        style={{
                          backgroundColor: selectedArea === area ? "#14B8A6" : "#08403D",
                          color: selectedArea === area ? "#fff" : "#ccc",
                          borderRadius: "6px",
                          padding: "6px",
                          fontSize: "12px",
                          marginRight: "5px",
                          border: "none",
                          outline: "none",
                          cursor: "pointer"
                        }}
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                </div>
              </label>

              {/* Prism Selection */}
              <label style={blockLabel}>
                <span style={labelSpan}>Prism Selection</span>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <img
                    src="/icons/Prism.svg"
                    style={{
                      width: "30px",
                      height: "30px",
                      objectFit: "contain",
                    }}
                    alt="Prism Icon"
                  />
                  <Select
                    isMulti
                    value={selectedIds.map((id) => ({ label: id, value: id }))}
                    options={prismOptions} // ✅ now filtered by area + risk
                    onChange={(selected) => {
                      const selectedValues = selected ? selected.map((s) => s.value) : [];
                      setSelectedIds(selectedValues);
                    }}
                    isSearchable
                    closeMenuOnSelect={false}
                    styles={{
                      container: (base) => ({
                        ...base,
                        flex: 1,
                      }),
                      valueContainer: (base) => ({
                        ...base,
                        flexWrap: "wrap",
                        padding: 0,
                        height: "100px",
                        overflowY: "auto"
                      }),
                      control: (base, state) => ({
                        ...base,
                        backgroundColor: state.isDisabled ? "#2f2f2f" : "#08403D", // ⬅ custom color when disabled
                        border: "none", // ⬅ remove border
                        borderRadius: "6px",
                        boxShadow: "none",
                        fontSize: "12px",
                        color: "#fff",
                        opacity: state.isDisabled ? 0.5 : 1, // ⬅ optionally dim
                        cursor: state.isDisabled ? "not-allowed" : "default",
                      }),
                      multiValue: (styles) => ({
                        ...styles,
                        backgroundColor: "#14B8A6",
                        color: "#fff",
                      }),
                      input: (base) => ({
                        ...base,
                        color: "#fff",
                      }),
                      menu: (base) => ({
                        ...base,
                        backgroundColor: "#1B1B1B",
                        color: "#fff",
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isFocused ? "#08403D" : "#1B1B1B",
                        color: "#fff",
                        cursor: "pointer",
                      }),
                    }}
                  />
                </div>
              </label>

              {/* Risk Selection */}
              <label style={blockLabel}>
                <span style={labelSpan}>Risk Selection</span>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <img
                    src="/icons/Risk.svg"
                    style={{
                      width: "30px",
                      height: "30px",
                      objectFit: "contain",
                    }}
                    alt="Risk Icon"
                  />
                  <div style={buttonGrid}>
                    {riskOptions.map((risk) => (
                      <button
                        key={risk}
                        type="button"
                        onClick={() => {
                          setSelectedRisk(risk);

                          // auto-select all IDs from this risk
                          const idsInRisk = prisms
                            .filter(p => p.risk === risk && (!selectedArea || p.area === selectedArea))
                            .map(p => p.id);

                          setSelectedIds(idsInRisk);
                        }}
                        style={{
                          backgroundColor: selectedRisk === risk ? "#14B8A6" : "#08403D",
                          color: selectedRisk === risk ? "#fff" : "#ccc",
                          borderRadius: "6px",
                          padding: "6px",
                          fontSize: "12px",
                          marginRight: "5px",
                          border: "none",
                          outline: "none",
                          cursor: "pointer"
                        }}
                      >
                        {risk}
                      </button>
                    ))}
                  </div>
                </div>
              </label>


            </div>

            <RiskSummary data={prisms} selectedIDs={selectedIds} />

          </div>
        </div>

        {/* Top Dual 3D Views */}
        <OrbitSyncProvider>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
            <ViewerCanvas
              title="Cumulative Displacement"
              url="/data/PRISM/Telfer/Surface/Displacement.glb"
              isSource
              prisms={prisms.filter(p => p.area === selectedArea && selectedIds.includes(p.id))}
              colorbar={{
                min: -40,
                max: 40,
                gradient: "linear-gradient(to bottom, red, yellow, green, lightblue, blue)",
                units: "mm",
              }}
            />
            <ViewerCanvas
              title="Velocity"
              url="/data/PRISM/Telfer/Surface/Velocity.glb"
              prisms={prisms.filter(p => p.area === selectedArea && selectedIds.includes(p.id))}
              colorbar={{
                min: -1,
                max: 2,
                gradient: "linear-gradient(to bottom, red, yellow, green, lightblue, blue)",
                units: "mm/d",
              }}
            />
          </div>
        </OrbitSyncProvider>



        {/* Bottom Chart */}
        <div style={{
          backgroundColor: "#262626",
          borderRadius: "10px",
          padding: "20px",
          gridColumn: "2 / 3",
          gridRow: "2 / 3",
          minHeight: 0,
          overflow: "hidden"
        }}>
          {selectedIds.length > 0 ? (
            <PrismChart IDs={selectedIds} />
          ) : (
            <p style={{ color: "#aaa" }}>Select an area and prism(s) to view chart.</p>
          )}
        </div>
      </div>
    </div>
  );
}
