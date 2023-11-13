"use client";

import { Button, Menu } from "@mantine/core";
import clsx from "clsx";

import dataGridExampleStyles from "./DataGridExample.module.css";

import { exampleData, exampleData2, ExampleData, ExampleData2 } from "./Data";
import { ColumnDef, SlotOverridesSignature } from "@/ui/data-grid/types";
import DataGrid from "@/ui/data-grid/DataGrid";
import { useDataGrid } from "@/ui/mantine-data-grid/useDataGrid";
import { LoadingOverlay as MLoadingOverlay } from "@mantine/core";
import { es } from "@/ui/data-grid/locales/es";

import { Icon3dRotate } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { ColumnSizingState, RowSelectionState } from "@tanstack/react-table";

const data = exampleData.slice(0, 10);
const data2 = exampleData2.slice(0, 100);

const LoadingOverlay = () => <div className="bg-black/20 h-full grid place-items-center text-blue-600">Loading...</div>;

// TODO: Update toolbar controls to be hidden when features are turned off

interface CustomProps {
  lastPageIcon: {
    myCustomProp?: string;
  },
}

const DataGridExamplePage = () => {
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<RowSelectionState>({});
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});

  const grid = useDataGrid<ExampleData2, CustomProps>({
    localization: es,
    data: data2,
    columns: cols2,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
 
    enableHiding: true,
    enableSorting: true,
    enableExpanding: true,
    getRowCanExpand: (row) => true,
    renderSubComponent: (row) => <div>Subcomponent</div>,
    enableFilters: true,
    enableGlobalFilter: true,
    enableColumnFilters: true,
    enableColumnReordering: true,
    enableFacetedValues: true,
    enableRowSelection: true,
    enablePagination: true,
    enableRowNumbering: true,
    rowNumberingMode: "static",
    enableColumnActions: true,

    // enableRowsVirtualization: true,
    // enableColumnsVirtualization: true,

    globalFilterFn: "fuzzy",
    sortDescFirst: false,
    initialState: {
      density: "compact",
      pagination: {
        pageIndex: 0,
        pageSize: 50,
      },
    },
    state: {
      rowSelection: selectedRows,
      loading,
    },
    onRowSelectionChange: setSelectedRows,
    classNames: {
      root: "h-full !border-none bg-white overflow-hidden",
      columnHeaders: {
        root: "bg-neutral-800 text-white rounded-t-md",
      },
      columnHeadersCell: {
        label: "text-sm !font-normal",
        actions: "bg-neutral-800",
        dragIsOver: {
          label: "bg-red-100",
        },
        dragOverlay: {
          label: "!bg-blue-200",
        }
      },
      columnFooters: {
        root: "bg-neutral-800 text-white",
      },
      columnFootersCell: {
        content: "text-sm !font-normal",
      },
      // cell: {
      //   focused: "bg-red-100",
      //   content: "text-sm",
      // },
      cell: cell => ({
        focused: "!bg-red-100",
        content: "text-sm",
        root: cell?.row.original.id === 2 && cell.column.id === "id" ? "bg-green-200" : undefined,
      }),
      // row: {
      //   selected: "!bg-red-200",
      // },
      row: row => ({
        root: clsx("!border-none", {
          "bg-neutral-50": row.original.id % 2 === 0,
          "bg-neutral-200": row.original.id % 2 !== 0,
        }),
        selected: "!bg-red-200",
      })
    },
    // slots: {
    //   loadingOverlay: LoadingOverlay,
    // },
    slotProps: {
      columnMenuIconButton: {
        color: "white",
        radius: "sm",
      },
    },
    filterFns: {
      "test": () => false,
    },
  });

  return (
    <div
      className="flex flex-col gap-2 p-10 md:p-10 h-full"
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
            console.log(grid)
            console.log(grid.getAllLeafColumns())
          }}
        >
          Print Table
        </Button>

        <Button
          onClick={() => {
            grid.setColumnSizing(prev => ({
              ...prev,
              "first_name": 300,
              "last_name": 300,
            }))
          }}
        >
          Resize
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
    size: 1000,
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
    cellClassNames: cell => ({
      root: cell?.getValue<boolean>() ? "bg-green-200" : "bg-red-200",
    })
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
