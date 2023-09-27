import { IconPrinterOff } from "@tabler/icons-react";

const EmptyOverlay = () => {

  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        inset: 0,
      }}
    >
      <div className="flex flex-col gap-2 items-center">
        <IconPrinterOff 
          size="4rem"
        />
        <p className="text-lg">
          Oops! Nothing to show here.
        </p>
      </div>
    </div>
  );
}

export default EmptyOverlay;