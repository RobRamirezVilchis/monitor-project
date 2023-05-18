"use client";

import { useMediaQuery, useQueryState } from "@/components/shared/hooks";

const Test = () => {
  const { state, update, reset } = useQueryState({
    test: {
      defaultValue: "test",
    },
    test1: {
      defaultValue: new Date(),
      parse: (param) => new Date(param),
      serialize: (value) => value.toISOString(),
    }
  });

  const mediaQuery = useMediaQuery("(width > 1024px)");

  return (
    <div className="p-4">
      <div>
        <span>Media Query: Screen {mediaQuery ? ">" : "<="} 1024px</span>
      </div>

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
    </div>
  );
}

export default Test;