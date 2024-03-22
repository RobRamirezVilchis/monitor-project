import { ReactNode } from "react";
import { Paper } from "@mantine/core";

interface MainAuthLayoutPops {
  children: ReactNode;
}

const MainAuthLayout = ({
  children,
}: MainAuthLayoutPops) => {

  return (
    <div className="h-full grid place-items-center">
      <Paper 
        className="p-6"
        withBorder 
      >
        {children}
      </Paper>
    </div>
  );
}

export default MainAuthLayout;
