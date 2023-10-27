import { Loader } from "@mantine/core";

const SpinnerLoadingOverlay = () => {

  return (
    <div
      style={{
        backgroundColor: "rgb(0 0 0 / 0.1)",
        display: "grid",
        placeItems: "center",
        width: "100%",
        height: "100%",
      }}
    >
      <Loader />
    </div>
  );
}

export default SpinnerLoadingOverlay;
