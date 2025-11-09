// src/config/menuConfig.js
export const radarMenuItems = [
  { label: "LIVE RADAR", path: "/tools/:client/RadarStatusHub", icon: "CgMediaLive" },
  { label: "ALARM SUMMARY", path: "/tools/:client/AlarmSummaryPage", icon: "BsAlarm" },
  { label: "AVAILABILITY SUMMARY", path: "/tools/:client/AvailabilitySummaryPage", icon: "SlSpeedometer" },
  { label: "DATA QUALITY SUMMARY", path: "/tools/:client/DataQualitySummaryPage", icon: "PiPresentationChart" },
];

export const insarMenuItems = [
  { label: "DEFORMATION", path: "/tools/:client/Def_insar", icon: "MdSatellite" },
  { label: "WATER BODY", path: "/tools/:client/WB_insar", icon: "FaArrowUpFromGroundWater" },
];

export const adminMenuItems = [
  { label: "SAFETY INSPECTION", path: "/admin/SafetyInspection", icon: "LuClipboardCheck" },
  { label: "SAFETY SUMMARY", path: "/admin/SafetySummary", icon: "LuChartColumn" },
  { label: "RADAR MONITORING", path: "/admin/RadarMonitoring", icon: "LuClock4" },
  { label: "NOTIFICATIONS", path: "/admin/Notifications", icon: "FaRegBell" },
  { label: "ALARM SUMMARY", path: "/admin/AlarmSummary", icon: "PiWarning" },
  { label: "DATA QUALITY", path: "/admin/DataQuality", icon: "PiPulse" },
  { label: "AVAILABILITY", path: "/admin/Availability", icon: "FiTrendingUp" },
  { label: "PROJECT", path: "/admin/Project", icon: "FaTasks" },
  { label: "REPORTS", path: "/admin/Reports", icon: "HiOutlineDocumentChartBar" }
];
