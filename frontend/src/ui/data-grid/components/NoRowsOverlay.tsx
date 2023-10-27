import { IconPrinterOff } from "@tabler/icons-react";

const NoRowsOverlay = () => {

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "grid",
        placeItems: "center",
      }}
    >
      <div 
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <IconPrinterOff size="4rem" />
        <p style={{ fontSize: "1.25rem" }}>
          Oops! Nothing to show here.
        </p>
      </div>
    </div>
  );
}

export default NoRowsOverlay;