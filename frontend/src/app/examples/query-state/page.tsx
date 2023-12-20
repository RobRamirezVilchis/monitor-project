"use client";

import { useQueryState } from "@/hooks/shared";
import { useRouter, useSearchParams } from "next/navigation";

const AppUseQueryState = () => {
  const { state, update, reset } = useQueryState({
    test: {
      defaultValue: "test",
    },
    test1: {
      defaultValue: new Date(),
      parse: (param) => new Date(param as string),
      serialize: (value) => value.toISOString(),
    },
    test2: {
      defaultValue: 0,
      parse: (param) => parseInt(param as string),
      serialize: (value) => value.toString(),
    },
  }, {
    navigateOptions: {
      scroll: false,
    },
  });

  return (
    <div className="p-4">
      <div className="mt-4">
        <input
          type="text"
          className="border-2 border-gray-500 rounded-md p-2"
          value={state.test}
          onChange={(e) => update({ test: e.currentTarget.value })}
        />
      </div>

      <div>
        <button
          className="bg-blue-500 text-white rounded-md p-2 mt-4"
          onClick={() => reset()}
        >
          Reset
        </button>
      </div>

      <div className="flex items-center gap-2 mt-4">
        <button
          className="bg-blue-500 text-white rounded-md p-2 w-10 h-10"
          onClick={() => update({ test2: state.test2 - 1 })}
        >
          -1
        </button>

        <span className="grid place-items-center w-10 h-10">
          {state.test2}
        </span>

        <button
          className="bg-blue-500 text-white rounded-md p-2 w-10 h-10"
          onClick={() => {
            update(prev => ({ test2: prev.test2 + 1 }));
          }}
        >
          +3
        </button>
      </div>
    </div>
  );
}

export default AppUseQueryState;