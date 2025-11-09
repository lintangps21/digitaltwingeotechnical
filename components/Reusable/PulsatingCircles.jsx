import React from "react";
import "@/styles/PulsatingCircles.css";

export default function PulsatingCircles({ scale = 1 }) {
  return (
    <div className="circle-container" style={{ "--scale": scale }}>
      <div className="circle circle1"></div>
      <div className="circle circle2"></div>
      <div className="circle circle3"></div>
      <div className="circle circle4"></div>
      <div className="circle circle5"></div>
      <div className="circle circle6"></div>
      <div className="circle circle7"></div>
      <div className="circle circle8"></div>
      <div className="circle circle9"></div>
      <div className="circle circle10"></div>
      <div className="circle circle11"></div>

      <div className="center-logo">
        <img
          src="/logo/DTG/DTG Focus.png"
          alt="DTG"
          style={{
            width: `calc(150px * var(--scale, 1))`,
            height: `calc(150px * var(--scale, 1))`,
            objectFit: "contain",
            filter: "drop-shadow(0 0 5px rgba(255,255,255,1))",
          }}
        />
      </div>
    </div>
  );
}
