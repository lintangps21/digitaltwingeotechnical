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
            className="flex items-center gap-20 w-full bg-[var(--dtg-bg-card)] text-[var(--dtg-text-light)] border-t-1 border-b-2 border-[var(--dtg-border-dark)]"
            
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
                        className={`menu-button ${isActive(itemKey) ? 'menu-button--active' : ''}`}
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