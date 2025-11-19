// src/config/menuConfig.js
export const radarMenuItems = [
  { label: "LIVE RADAR", path: "/tools/:client/RadarStatusHub", icon: "CgMediaLive" },
  { label: "ALARM SUMMARY", path: "/tools/:client/AlarmSummaryPage", icon: "BsAlarm" },
  { label: "AVAILABILITY SUMMARY", path: "/tools/:client/AvailabilitySummaryPage", icon: "SlSpeedometer" },
  { label: "DATA QUALITY SUMMARY", path: "/tools/:client/DataQualitySummaryPage", icon: "PiPresentationChart" },
];

export const insarMenuItems = [
  { label: "WATER BODY", path: "/tools/:client/WB_insar", icon: "FaArrowUpFromGroundWater" },
];

export const adminMenuItems = [
  { label: "RADAR MONITORING", path: "/admin/Radar/RadarMonitoring", icon: "LuClock4" },
  { label: "NOTIFICATIONS", path: "/admin/Radar/Notifications", icon: "FaRegBell" },
  { label: "ALARM SUMMARY", path: "/admin/Radar/AlarmSummary", icon: "PiWarning" },
  { label: "DATA QUALITY", path: "/admin/Radar/DataQuality", icon: "PiPulse" },
  { label: "AVAILABILITY", path: "/admin/Radar/Availability", icon: "FiTrendingUp" },
  { label: "REPORTS", path: "/admin/Radar/Reports", icon: "HiOutlineDocumentChartBar" }
];
