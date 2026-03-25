import React from "react";
import {
  TileColor,
  TILE_COLOR_DOTS,
} from "../utils/tileColors";

const COLORS: TileColor[] = ["blue", "orange", "red", "darkred"];

interface TileColorPickerProps {
  currentColor: TileColor | null;
  onColorChange: (color: TileColor | null) => void;
}

const TileColorPicker: React.FC<TileColorPickerProps> = ({ currentColor, onColorChange }) => {
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onColorChange(null);
  };

  const handleClick = (e: React.MouseEvent, color: TileColor) => {
    e.stopPropagation();
    onColorChange(color);
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 4,
        right: 4,
        display: "flex",
        gap: "3px",
        opacity: 0,
        transition: "opacity 0.15s ease",
        zIndex: 1,
      }}
      className="tile-color-picker"
    >
      <button
        onClick={handleClear}
        style={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          backgroundColor: "transparent",
          border: currentColor === null ? "2px solid rgba(255,255,255,0.5)" : "1px solid rgba(255,255,255,0.2)",
          cursor: "pointer",
          padding: 0,
        }}
        title="clear"
      />
      {COLORS.map((color) => (
        <button
          key={color}
          onClick={(e) => handleClick(e, color)}
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor: TILE_COLOR_DOTS[color],
            border: currentColor === color ? "2px solid white" : "1px solid rgba(255,255,255,0.2)",
            cursor: "pointer",
            padding: 0,
            boxShadow: currentColor === color ? `0 0 0 1px ${TILE_COLOR_DOTS[color]}` : "none",
          }}
          title={color}
        />
      ))}
    </div>
  );
};

export default TileColorPicker;
