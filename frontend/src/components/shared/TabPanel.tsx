import React from "react";

export type TabHideMode = "remove" | "hide";

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  /**
   * remove will remove the content from the document while
   * hide will only make its display as none
   * @default remove
   */
  hideMode?: TabHideMode;
  classes?: {
    root?: string;
    tabContainer?: string;
  }
}

export const TabPanel: React.FC<TabPanelProps> = ({ 
  children, value, index, hideMode, classes, ...other 
}) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`application-tabpanel-${index}`}
      aria-labelledby={`application-tab-${index}`}
      {...other}
      className={classes?.root}
    >
      {hideMode === "hide" ? (
        <div className={`${value !== index ? "hidden" : ""} ${classes?.tabContainer}`}>
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