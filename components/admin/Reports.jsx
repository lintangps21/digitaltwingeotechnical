import LogoSection from "../Reusable/HeaderComponents/LogoSection";
import NavSection from "@/components/Reusable/HeaderComponents/NavSection";
import { adminMenuItems } from "@/config/menuConfig";
import React from "react";

function Reports() {


  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        boxSizing: "border-box",
        overflowY: "auto",
        overflowX: "hidden",       
        color: "#f5f5f5",
        fontFamily: "Inter, sans-serif",
        display: "flex",
        flexDirection: "column",
        padding: "10px",
      }}
    >
      <LogoSection Subtitle="Operator Control Panel"/>
      <NavSection menuItems={adminMenuItems}/>

   </div>
  );
}

export default Reports;
