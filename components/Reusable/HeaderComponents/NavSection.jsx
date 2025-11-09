import React from "react";
import { getIconComponent } from "../IconMapper";

function toProperTitleCase(str) {
    const lowerWords = ["a", "an", "the", "and", "but", "or", "for", "nor", "on", "at", "to", "from", "by", "in", "of"];
    return str
        .toLowerCase()
        .split(" ")
        .map((word, index) =>
            index === 0 || !lowerWords.includes(word)
                ? word.charAt(0).toUpperCase() + word.slice(1)
                : word
        )
        .join(" ");
}

const NavSection = ({ menuItems, activeComponent, onMenuClick }) => {
    const isActive = (key) => activeComponent === key;

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: "20px",
                width: "100%",
                borderRadius: "20px",
                background: "linear-gradient(to bottom, #1E1E1E, #3A3A3A)",
            }}
        >
            {menuItems.map((item) => {
                const Icon = getIconComponent(item.icon);

                // This 'item.key' is what we will pass to onMenuClick.
                // We will create this key in the parent component.
                const itemKey = item.key;

                return (
                    <button
                        key={item.label} // React 'key' can still be label
                        type="button"
                        onClick={() => onMenuClick(itemKey)} // Use the unique itemKey
                        style={{
                            width: "250px",
                            border: "none",
                            borderRadius: "20px",
                            outline: "none",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                            fontSize: "14px",
                            fontWeight: isActive(itemKey) ? "bold" : "normal",
                            color: isActive(itemKey) ? "#fff" : "#ccc",
                            background: isActive(itemKey) ? "#B14813" : "transparent",
                            transition: "all 0.3s ease",
                            position: "relative",
                            padding: "10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = isActive(itemKey) ? "#fff" : "#ccc")}
                    >
                        {Icon && <Icon size={18} />}
                        {toProperTitleCase(item.label)}
                    </button>
                );
            })}
        </div>
    );
};

export default NavSection;