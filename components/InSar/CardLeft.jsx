import React from "react";
import { IoIosWarning } from "react-icons/io";

const InSARCard = ({ summarydata }) => {
  const {
    Location,
    Instrument,
    Product,
    Origin,
    Site,
    Lat,
    Lon,
    Satellite,
    "Flight Direction": FlightDirection,
    Polarization,
    "Beam Mode": BeamMode,
    Path,
    Orbit,
    Frame,
    "Total Data": TotalData,
    "Processed Data": ProcessedData,
    Notes,
    "Data Source": DataSource
  } = summarydata;

  const rows = [
    ["Satellite", Satellite],
    ["Flight Direction", FlightDirection],
    ["Instrument", Instrument],
    ["Product", Product],
    ["Origin", Origin],
    ["Polarization", Polarization],
    ["Beam Mode", BeamMode],
    ["Path", Path],
    ["Orbit", Orbit],
    ["Frame", Frame],
    ["Total Data", TotalData],
    ["Processed Data", ProcessedData]
  ];

  const cardStyle = {
    flex: "1",
    minWidth: "200px",
    backgroundColor: "#262626",
    borderRadius: "10px",
    padding: "20px",
    color: "#f5f5f5",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  };

  const cardTitleStyle = {
    fontSize: "18px",
    margin: 0,
    marginBottom: "5px",
    color: "#f5f5f5",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
      {/* Location Card */}
      <div style={{ ...cardStyle, flex: 0.2 }}>
        <h4 style={cardTitleStyle}>Location</h4>
        <div style={{ color: "#EC834E", fontSize: "14px" }}>
          {Location} - {Site}
        </div>
        <div style={{ color: "#A6A6A6", fontSize: "12px" }}>
          Lat: {Lat}, Lon: {Lon}
        </div>
      </div>

      {/* Data Availability Card */}
      <div style={{ ...cardStyle, flex: 0.8 }}>
        <h4 style={cardTitleStyle}>Data Availability & Limitation</h4>

        {rows
          .filter(([label, value]) => value !== null && value !== undefined && value !== "")
          .map(([label, value], index) => (
            <div key={index} style={{ display: "flex" }}>
              <div
                style={{
                  width: "140px",
                  textAlign: "left",
                  paddingRight: "8px",
                  fontSize: "12px",
                  color: "#aaa",
                }}
              >
                {label}
              </div>
              <div style={{ paddingRight: "4px" }}>:</div>
              <div style={{ fontSize: "12px" }}>{value}</div>
            </div>
          ))}


        {/* Warning Box */}
        {Notes?.includes("No data available") && (
          <div
            style={{
              backgroundColor: "rgba(210,175,32,0.1)",
              borderRadius: "6px",
              padding: "5px",
              border: "1px solid rgba(210,175,32)",
            }}
          >
            <IoIosWarning color="rgba(210,175,32)" />
            <b style={{ fontSize: "12px", color: "rgba(210,175,32)" }}>
              {" "}
              No InSAR Data
            </b>
            <div style={{ fontSize: "10px", color: "rgba(210,175,32)" }}>
              {Notes}
            </div>
          </div>
        )}

        <p style={{ fontSize: "10px", color: "#aaa", marginBottom: 0 }}>
          Data Source : {DataSource}
        </p>
      </div>
    </div>
  );
};

export default InSARCard;
