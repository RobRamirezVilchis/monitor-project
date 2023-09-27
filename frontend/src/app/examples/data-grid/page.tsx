"use client";

import { Button, Menu } from "@mantine/core";
import { exampleData, ExampleData } from "./Data";
import { ColumnDef } from "@/components/ui/data-grid/types";
import DataGrid from "@/components/ui/data-grid/DataGrid";
import useDataGrid from "@/components/ui/data-grid/useDataGrid";

import { Icon3dRotate } from "@tabler/icons-react";
import { useState } from "react";

const data = exampleData.slice(0, 100);

const LoadingOverlay = () => <div className="bg-black/20 h-full grid place-items-center text-blue-600">Loading...</div>;

const DataGridExamplePage = () => {
  const [loading, setLoading] = useState(false);

  const grid = useDataGrid<ExampleData>({
    loading,
    data,
    columns: cols,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    enableHiding: true,
    enableSorting: true,
    enableExpanding: false,
    // getRowCanExpand: (row: Row<ExampleData>) => {
    //   if (row.index === 1) return false;

    //   return true;
    // },
    enableFilters: true,
    enableGlobalFilter: true,
    enableColumnFilters: true,
    enableFacetedValues: true,
    enableRowSelection: true,
    // enableGrouping: true,
    enablePagination: true,
    // enableRowsVirtualization: true,
    // enableColumnsVirtualization: true,
    enableRowNumbering: true,
    rowNumberingMode: "static",
    // hideToolbar: true,
    // hideColumnSelector: false,
    // hideDensitySelector: true,
    // hideQuickSearch: true,
    // hideFullscreenSelector: true,

    globalFilterFn: "includesString",
    // debugAll: true,
    sortDescFirst: false,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 50,
      }
    },
    // hideHeader: true,
    // hideFooter: true,
    // renderSubComponent: row => (
    //   <div
    //     style={{
    //       height: "100%",
    //       border: "1px solid red",
    //       width: "100%",
    //     }}
    //   >
    //     SubComponent for row {row.id}
    //   </div>
    // ),
    classNames: {
      root: "h-full border-blue-400 bg-white overflow-hidden",
      columnHeaderCell: {
        actions: "bg-white",
      }
    },
    density: "compact",
    slots: {
      loadingOverlay: LoadingOverlay,
    }
  });

  return (
    <div
      className="flex flex-col gap-2 p-10 h-full"
    >
      <div 
        className="flex-[1_0_0] min-h-0" // a min-height is required for this layout!
      >
        <DataGrid
          instance={grid}
        />
      </div>
      <div>
        <Button
          onClick={() => {
            setLoading(!loading);
          }}
        >
          Toggle Loading
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
