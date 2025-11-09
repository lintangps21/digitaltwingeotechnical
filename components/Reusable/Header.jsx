import NavSection from "./HeaderComponents/NavSection";
import LogoSection from "./HeaderComponents/LogoSection";
import React from "react";
import { radarMenuItems } from "@/config/menuConfig";

const Header = () => {

    return (
            <div style={{ display: "flex", flexDirection: "column"}}>
                <LogoSection Subtitle="Radar"/>
                <NavSection menuItems={radarMenuItems}/>
            </div>
    );
};

export default Header;
