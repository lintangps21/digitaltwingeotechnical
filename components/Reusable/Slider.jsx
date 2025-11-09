import React from "react";
import * as Slider from "@radix-ui/react-slider";

const MonthSlider = ({ data, value, onRangeChange }) => {
  const min = 0;
  const max = data.length - 1;

  return (
    <div style={{
      width: "100%",
      padding: "12px 16px 20px", // extra bottom padding for labels
      borderRadius: "10px",
    }}>
      <Slider.Root
        min={min}
        max={max}
        step={1}
        value={value}
        onValueChange={onRangeChange}
        style={{
          display: "flex",
          alignItems: "center",
          width: "90%",
          height: "20px",
          position: "relative",
          padding: "0 0 0 10px",
          boxSizing: "border-box"
        }}
      >
        <Slider.Track
          style={{
            backgroundColor: "none",
            flexGrow: 1,
            height: "8px",
            borderRadius: "999px",
            position: "relative"
          }}
        >
          {/* Tick markers */}
          {data.map((label, index) => index % 6 === 0 && (
            <div
              key={index}
              style={{
                position: "absolute",
                left: `${(index / (max - min)) * 100}%`,
                top: "50%",
                width: "2px",
                height: "8px",
                backgroundColor: "#9ca3af",
                transform: "translate(-50%, -50%)",
                zIndex: 1
              }}
            />
          ))}

          <Slider.Range
            style={{
              backgroundColor: "#14B8A6",
              height: "100%",
              position: "absolute",
              borderRadius: "999px"
            }}
          />
        </Slider.Track>

        {[0, 1].map(i => (
          <Slider.Thumb
            key={i}
            style={{
              width: "8px",
              height: "16px",
              backgroundColor: "#14B8A6",
              border: "none",     
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              position: "absolute",
              transform: "translateY(-50%)",
            }}
          />
        ))}
      </Slider.Root>

      {/* Tick labels */}
      <div
        style={{
          display: "flex",
          position: "relative",
          width: "90%",
          paddingLeft: "10px"
        }}
      >
        {[0, Math.floor(data.length / 2), data.length - 1].map(index => (
          <div
            key={index}
            style={{
              position: "absolute",
              left: `${(index / (data.length - 1)) * 100}%`,
              transform: "translateX(-50%)",
              fontSize: "10px",
              color: "#9ca3af",
              whiteSpace: "nowrap"
            }}
          >
            {data[index]}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthSlider;
