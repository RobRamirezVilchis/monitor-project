"use client";

import { Button, Menu } from "@mantine/core";

import dataGridExampleStyles from "./DataGridExample.module.css";

import { exampleData, exampleData2, ExampleData, ExampleData2 } from "./Data";
import { ColumnDef } from "@/components/ui/data-grid/types";
import DataGrid from "@/components/ui/data-grid/DataGrid";
import useDataGrid from "@/components/ui/data-grid/useDataGrid";
import { LoadingOverlay as MLoadingOverlay } from "@mantine/core";
import { es } from "@/components/ui/data-grid/locales/es";

import { Icon3dRotate } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { RowSelectionState } from "@tanstack/react-table";
import ProgressLoadingOverlay from "@/components/ui/data-grid/components/ProgressLoadingOverlay";

const data = exampleData.slice(0, 100);
const data2 = exampleData2.slice(0, 100);

const LoadingOverlay = () => <div className="bg-black/20 h-full grid place-items-center text-blue-600">Loading...</div>;

// TODO: Update toolbar controls to be hidden when features are turned off

const DataGridExamplePage = () => {
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<RowSelectionState>({});

  const grid = useDataGrid<ExampleData2>({
    // debugAll: true,
    // debugRows: true,
    // debugColumns: true,
    // debugHeaders: true,
    // debugTable: true,
    localization: es,
    data: data2,
    columns: cols2,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
 
    enableHiding: true,
    enableSorting: true,
    // enableExpanding: true,
    getRowCanExpand: (row) => true,
    enableFilters: true,
    enableGlobalFilter: true,
    enableColumnFilters: true,
    enableColumnReordering: true,
    // enableFacetedValues: true,
    // enableRowSelection: true,
    // enableGrouping: true,
    // enablePagination: true,
    // enableRowsVirtualization: true,
    // enableColumnsVirtualization: true,
    // enableRowNumbering: true,
    // rowNumberingMode: "static",
    // hideToolbar: true,
    hideFooter: true,
    // hideColumnSelector: false,
    // hideDensitySelector: true,
    // hideQuickSearch: true,
    // hideFullscreenSelector: true,

    // globalFilterFn: "includesString",
    // debugAll: true,
    sortDescFirst: false,
    initialState: {
      density: "compact",
      // loading: false,
      pagination: {
        pageIndex: 0,
        pageSize: 50,
      },
      // columnOrder:  [
      //   "id", 
      //   "first_name", 
      //   "last_name", 
      //   "email", 
      //   "gender", 
      //   "birthday", 
      //   "salary", 
      //   "approved", 
      //   "color", 
      //   "created_at", 
      //   "score"
      // ],
    },
    state: {
      rowSelection: selectedRows,
      loading,
    },
    onRowSelectionChange: setSelectedRows,
    // hideHeader: true,
    // hideFooter: true,
    // renderSubComponent: row => (
    //   <div
    //     style={{
    //       height: "100%",
    //       border: "1px solid rgb(25 118 210)",
    //       width: "100%",
    //     }}
    //   >
    //     SubComponent for row {row.id}
    //   </div>
    // ),
    classNames: {
      root: "h-full bg-white",
      // root: "h-full !border-none bg-white overflow-hidden",
      // columnHeaders: {
      //   root: "bg-neutral-800 text-white rounded-t-md",
      // },
      // columnHeaderCell: {
      //   label: "text-sm !font-normal",
      //   actions: "bg-neutral-800",
      //   // dragIsOver: {
      //   //   label: "bg-red-100",
      //   // },
      //   // dragOverlay: {
      //   //   label: "!bg-blue-200",
      //   // }
      // },
      // columnFooter: {
      //   root: "bg-neutral-800 text-white",
      // },
      // columnFooterCell: {
      //   content: "text-sm !font-normal",
      // },
      // cell: {
      //   // focused: "bg-red-100",
      //   content: "text-sm",
      // },
      // row: {
      //   selected: "!bg-red-200",
      // },
    },
    slots: {
      // loadingOverlay: LoadingOverlay,
      // loadingOverlay: ProgressLoadingOverlay,
    },
    // slotProps: {
    //   baseButtonProps: {
    //     color: "red",
    //   },
    //   baseActionIconProps: {
    //     color: "red",
    //   },
    //   baseCheckboxProps: {
    //     color: "red",
    //   },
    //   baseSelectProps: {
    //     variant: "filled",
    //   },
    //   baseSwitchProps: {
    //     color: "red",
    //   },
    //   baseTooltipProps:{
    //     withArrow: true,
    //   },
    //   baseTextInputProps: {
    //     variant: "filled",
    //     classNames: {
    //       input: "focus:border-black",
    //     }
    //   },
    //   baseMenuItemProps: {
    //     color: "red",
    //   },
    //   scroll: {
    //     thickness: 10,
    //   }
    // },
    // onCellClick: (cell) => console.log("Cell clicked!", cell),
    // onCellDoubleClick: (cell) => console.log("Cell double clicked!", cell),
    // onRowClick: (row) => console.log("Row clicked!", row),
    // onRowDoubleClick: (row) => console.log("Row double clicked!", row),
    filterFns: {
      "test": () => false,
    },
    globalFilterFn: "fuzzy",
  });
  return (
    <div
      className="flex flex-col gap-2 p-10 md:p-10 h-full overflow-auto"
    >
      <div 
        className="flex-[1_0_0] min-h-[0px]" // a min-height is required for this layout!
        // className="flex-[1_0_0] min-h-[1500px] min-w-[2500px]" // a min-height is required for this layout!
      >
        <DataGrid
          instance={grid}
        />
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={() => {
            setLoading(!loading);
            // grid.setLoading(prev => !prev);
          }}
        >
          Toggle Loading
        </Button>

        <Button
          onClick={() => {
            console.log(selectedRows)
          }}
        >
          Print Selected Rows
        </Button>

        <Button
          onClick={() => {
            console.log(grid.getState())
          }}
        >
          Print State
        </Button>

        <Button
          onClick={() => {
            // console.log(grid.getAllColumns().map(x => [x.id, x.getFilterFn()]))
            // console.log(grid.options)
            console.log(grid.getAllColumns())
            console.log(grid.getAllFlatColumns())
            console.log(grid.getAllLeafColumns())
          }}
        >
          Print Table
        </Button>
      </div>
    </div>
  );
}

export default DataGridExamplePage;

const cols: ColumnDef<ExampleData>[] = [
  {
    accessorKey: "id",
    // enableHiding: false,
    // enableSorting: false,
    columnActionsMenuItems: ({ instance, column }) => [
      <Menu.Item
        key="custom1"
        leftSection={<Icon3dRotate />}
        onClick={() => {
          alert("Custom action 1!");
        }}
      >
        Custom Action 1
      </Menu.Item>,
      <Menu.Item
        key="custom2"
        leftSection={<Icon3dRotate />}
        onClick={() => {
          alert("Custom action 2!");
        }}
      >
        Custom Action 2
      </Menu.Item>,
      <Menu.Divider key="divider" />,
      <Menu.Item
        key="custom3"
        leftSection={<Icon3dRotate />}
        onClick={() => {
          alert("Custom action 3!");
        }}
      >
        Custom Action 3
      </Menu.Item>,
    ],
    minSize: 100,
    maxSize: 150,
  },
  {
    header: "Name",
    columns: [
      {
        accessorKey: "first_name",
        minSize: 300,
        maxSize: 500,
      },
      {
        accessorKey: "last_name",
        size: 150,
      },
    ]
  },
  {
    accessorKey: "age",
    minSize: 200,
    maxSize: 500,
  },
  {
    accessorKey: "email",
    minSize: 100,
    maxSize: 500,
  },
  {
    accessorKey: "gender",
    minSize: 200,
    maxSize: 500,
  },
  {
    accessorKey: "address",
    minSize: 300,
    maxSize: 500,
  },
  {
    accessorKey: "country",
    minSize: 200,
    maxSize: 500,
  },
];

const cols2: ColumnDef<ExampleData2>[] = [
  {
    accessorKey: "id",
    columnTitle: "ID",
    header: () => "ID",
    size: 150,
    filterVariant: "number",
    filterFn: "equals",
    enableHiding: false,
    footer: () => "Totals",
    footerClassNames: {
      root: dataGridExampleStyles.columnFooterCell,
    }
  },
  {
    accessorKey: "first_name",
    columnTitle: "First Name",
    header: () => "First Name",
    size: 550,
    filterVariant: "text",
  },
  {
    accessorKey: "last_name",
    columnTitle: "Last Name",
    header: () => "Last Name",
    size: 550,
    filterVariant: "text",
    filterFn: "fuzzy",
    // filterFn: "test"
  },
  {
    accessorKey: "email",
    columnTitle: "Email",
    header: () => "Email",
    size: 150,
    filterVariant: "autocomplete",
    filterProps: {
      options: [
        "erushmere0@washingtonpost.com",
        "rrippen1@loc.gov",
      ]
    }
  },
  {
    accessorKey: "gender",
    columnTitle: "Gender",
    header: () => "Gender",
    size: 150,
    filterVariant: "select",
    filterFn: "equals",
    filterProps: {
      options: [
        { value: "", label: "All" },
        "Male",
        "Female"
      ]
    }
  },
  {
    accessorKey: "birthday",
    columnTitle: "Birthday",
    header: () => "Birthday",
    size: 150,
    filterVariant: "date",
    filterFn: "dateEqualsTo",
    accessorFn: (row) => new Date(row.created_at),
    cell: (cell) => (cell.getValue() as Date).toLocaleDateString(),
  },
  {
    accessorKey: "salary",
    columnTitle: "Salary",
    header: () => "Salary",
    size: 150,
    filterVariant: "range-slider",
    filterFn: "inNumberRange",
    filterProps: {
      // min: 7000, max: 15000, 
      step: 100,
    }
  },
  {
    accessorKey: "approved",
    columnTitle: "Approved",
    header: () => "Approved",
    size: 150,
    filterVariant: "checkbox",
  },
  {
    accessorKey: "color",
    columnTitle: "Color",
    header: () => "Color",
    size: 150,
    // filterVariant: "multi-select",
    filterVariant: "multi-autocomplete",
    filterFn: "arrIncludesSome",
    filterProps: {
      options: [
        "Red",
        "Blue",
        "Green",
        "Yellow",
        "Orange",
        "Purple",
        "Brown",
        "Black",
        "White",
        "Gray",
      ]
    },
  },
  {
    id: "created_at",
    accessorKey: "created_at",
    columnTitle: "Created At",
    header: () => "Created At",
    size: 150,
    filterVariant: "date-range",
    // filterFn: "inNumberRange",
    filterFn: "isDateBetween",
    accessorFn: (row) => new Date(row.created_at),
    cell: (cell) => (cell.getValue() as Date).toISOString(),
    cellTitle: (cell) => (cell.getValue() as Date).toISOString(),
    footerClassNames: {
      root: dataGridExampleStyles.columnFooterCell,
    },
    filterProps: {
      max: new Date(),
    },
  },
  {
    accessorKey: "score",
    columnTitle: "Score",
    header: () => "Score",
    size: 150,
    filterVariant: "range",
    filterFn: "inNumberRange",
    footer: (ctx) => ctx.table.getRowModel()
      .rows.reduce((acc, row) => acc + row.original.score, 0).toString(),
    filterProps: {
      min: 0, max: 100,
    },
  },
];
