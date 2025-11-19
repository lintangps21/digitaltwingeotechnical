// pages/Sensors/Radars/Live/Radar.jsx (or wherever this page is)

import React, { useState, useMemo } from "react";
import LogoSection from "../Reusable/HeaderComponents/LogoSection";
import NavSection from "../Reusable/HeaderComponents/NavSection"; // Assuming path to NavSection

// 1. IMPORT YOUR CONFIG
import { insarMenuItems } from "@/config/menuConfig";

// 2. IMPORT YOUR PAGE COMPONENTS

import WaterBody from "./WB_insar";
import WB_insar from "./WB_insar";

// 3. HELPER FUNCTION
// This gets the last part of the path, e.g., "RadarStatusHub"
const getComponentKeyFromPath = (path) => {
    return path.split("/").pop();
};

// 4. COMPONENT MAP
// Map the *exact keys* from the path to the component to render
const components = {
    WB_insar: <WaterBody />
};

function Insar() {

    // 5. TRANSFORM THE MENU ITEMS
    // We use useMemo so this only runs once.
    const navItems = useMemo(() => {
        return insarMenuItems.map(item => ({
            label: item.label,
            icon: item.icon,
            // Create the 'key' that NavSection and our state will use
            key: getComponentKeyFromPath(item.path)
        }));
    }, []); // Empty dependency array means it runs once

    // 6. SET UP STATE
    // Use the key of the first item as the default
    const [activeComponent, setActiveComponent] = useState(navItems[0]?.key || "");

    const handleMenuClick = (componentKey) => {
        setActiveComponent(componentKey);
    };

    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                boxSizing: "border-box",
                overflowY: "auto",
                overflowX: "hidden",
                color: "#f5f5ftext",
                fontFamily: "Inter, sans-serif",
                display: "flex",
                flexDirection: "column",
                padding: "10px",
            }}
        >
            <div
                style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                    background: "#1a1a1a"
                }}>
                <LogoSection Subtitle="Radar" />
                {/* 7. RENDER NAVSECTION */}
                <NavSection
                    menuItems={navItems} // Pass the *transformed* array
                    activeComponent={activeComponent}
                    onMenuClick={handleMenuClick}
                />
            </div>

            {/* 8. RENDER THE ACTIVE COMPONENT */}

            {components[activeComponent]}

        </div>
    );
}

export default Insar;