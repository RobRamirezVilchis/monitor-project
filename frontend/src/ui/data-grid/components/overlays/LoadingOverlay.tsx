import { DataGridSlotBaseProps } from "../../types";

import styles from "./LoadingOverlay.module.css";

export type LoadingOverlayProps = DataGridSlotBaseProps<any>["loadingOverlay"];

const LoadingOverlay = ({
  instance,
}: LoadingOverlayProps) => {

  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <span className={styles.loader}></span>
        {instance.localization.loadingOverlayLabel}
      </div>
    </div>
  );
}

export default LoadingOverlay;
