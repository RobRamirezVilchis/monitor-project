import { Loader, Progress } from "@mantine/core";

const ProgressLoadingOverlay = () => {

  return (
    <div
      style={{
        placeItems: "center",
        width: "100%",
        height: "100%",
      }}
    >
      <Progress 
        value={100}
        animated
        radius="0"
        size={6}
      />
    </div>
  );
}

export default ProgressLoadingOverlay;
