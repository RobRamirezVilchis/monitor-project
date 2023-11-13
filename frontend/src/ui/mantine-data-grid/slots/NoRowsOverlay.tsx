import { DataGridSlotBaseProps } from "@/ui/data-grid/types";

import styles from "./NoRowsOverlay.module.css";

import { IconFileOff } from "@tabler/icons-react";

export type NoRowsOverlayProps = DataGridSlotBaseProps<any>["noRowsOverlay"];

const NoRowsOverlay = ({
  instance,
}: NoRowsOverlayProps) => {

  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <IconFileOff size={48} />
        <p className={styles.label}>
          {instance.localization.noRowsLabel}
        </p>
      </div>
    </div>
  );
}

export default NoRowsOverlay;