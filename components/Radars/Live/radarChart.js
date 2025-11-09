const SCORE_MAP = {
  "Optimal": 5,
  "Acceptable": 3,
  "Sub-Optimal": 2,
  "Critical": 1,
  "N/A": 0
};

// Map DB names -> internal camelCase keys
const PARAMETER_KEYS = {
  "System Health": "SystemHealth",
  "Scan Area": "ScanArea",
  "Photograph": "Photograph",
  "Masks": "Masks",
  "Alarms": "Alarms",
  "Atmospheric Correction": "AtmosphericCorrection",
  "Visual Data": "VisualData"
};


export function buildRadarData(record) {
  return Object.entries(PARAMETER_KEYS).map(([dbName, key]) => {
    
    //Skip VisualData if XT
    if (key === "VisualData" && record.radar?.slice(-2) === "XT") {
      return null; 
    }

    //Skip Photo if CHCNAV
    if (key === "Photograph" && record.brand !== "GroundProbe") {
      return null; 
    }

    const status = (record.parameters?.[dbName]?.value || "").trim();

    return {
      subject: key,
      score: SCORE_MAP[status] ?? 0,
      fullMark: 5,
      status
    };
  }).filter(Boolean);
}

