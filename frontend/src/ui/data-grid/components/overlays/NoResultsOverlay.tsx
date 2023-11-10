import { DataGridSlotBaseProps } from "../../types";
import styles from "./NoResultsOverlay.module.css";

export type NoResultsOverlayProps = DataGridSlotBaseProps<any>["noResultsOverlay"];

const NoResultsOverlay = ({
  instance,
}: NoResultsOverlayProps) => {

  return (
    <div className={styles.root}>
      <p className={styles.label}>
        {instance.localization.noResultsOverlayLabel}
      </p>
    </div>
  );
}

export default NoResultsOverlay;