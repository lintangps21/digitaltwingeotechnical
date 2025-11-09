import React from "react";
import DTGFocus from "@/src/components/icons/DTGFocus"

export default function RadarAnimated() {
    const iconColor = '#0E927F';
    return (
        <div className="relative flex justify-center lg:justify-start mb-12">
            <div className="relative w-100 h-100">
                {/* Outer glow rings */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-500/20 to-emerald-500/20 blur-3xl animate-pulse"></div>
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-teal-400/30 to-emerald-400/30 blur-2xl"></div>

                {/* Central orb */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-50 h-50 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 dark:from-[#1a2828] dark:to-[#0f1d1d] flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-transparent"></div>

                        {/* Hexagon pattern */}
                        <div className="w-30 relative z-10">
                            <DTGFocus
                                className="w-full h-full" 
                                color={iconColor}
                            />
                        </div>
                    </div>
                </div>

                {/* Ring border */}
                <div className="absolute inset-0 rounded-full border-2 border-teal-500/30"></div>
            </div>
        </div>
    )
}