import { DataGridSlotBaseProps } from "../../types";
import styles from "./NoRowsOverlay.module.css";

export type NoRowsOverlayProps = DataGridSlotBaseProps<any>["noRowsOverlay"];

const NoRowsOverlay = ({
  instance,
}: NoRowsOverlayProps) => {

  return (
    <div className={styles.root}>
      <p className={styles.label}>
        {instance.localization.noRowsLabel}
      </p>
    </div>
  );
}

export default NoRowsOverlay;