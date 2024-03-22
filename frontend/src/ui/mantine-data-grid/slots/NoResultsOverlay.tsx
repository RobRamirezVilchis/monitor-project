import { DataGridSlotBaseProps } from "@/ui/data-grid/types";

import styles from "./NoResultsOverlay.module.css";

import { IconFileOff } from "@tabler/icons-react";

export type NoResultsOverlayProps = DataGridSlotBaseProps<any>["noResultsOverlay"];

const NoResultsOverlay = ({
  instance,
}: NoResultsOverlayProps) => {

  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <IconFileOff size={48} />
        <p className={styles.label}>
          {instance.localization.noResultsOverlayLabel}
        </p>
      </div>
    </div>
  );
}

export default NoResultsOverlay;