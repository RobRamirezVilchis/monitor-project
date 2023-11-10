import { ReactNode } from "react";
import clsx from "clsx";

import styles from "./DataGridOverlay.module.css";


export interface DataGridOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

const DataGridOverlay = ({
  children,
  className,
  ...props
}: DataGridOverlayProps) => {
  return (
    <div className={clsx("DataGridOverlay", styles.root, className)} {...props}>
      {children}
    </div>
  );
}

export default DataGridOverlay;
