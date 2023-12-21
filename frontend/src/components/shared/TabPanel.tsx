import { ReactNode } from "react";
import clsx from "clsx";

export interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
  /**
   * wether to unmount or just hide (display: none) the children when the index is not equal to the value
   * @default false
   */
  unmount?: boolean;
  classes?: {
    root?: string;
    tabContainer?: string;
  }
}

export const TabPanel = ({
  children, value, index, unmount, classes, ...other 
}: TabPanelProps) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`application-tabpanel-${index}`}
      aria-labelledby={`application-tab-${index}`}
      {...other}
      className={classes?.root}
    >
      {!unmount ? (
        <div 
          className={clsx(classes?.tabContainer, {
            hidden: value !== index,
          })}
        >
          {children}
        </div>
      ) : (
        <>
          {value === index && (
            <div className={classes?.tabContainer}>
              {children}
            </div>
          )}
        </>
      )}
    </div>
  );
}