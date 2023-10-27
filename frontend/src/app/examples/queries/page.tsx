"use client";

import { createMutation } from "@/api/helpers/createMutation";
import { createQuery } from "@/api/helpers/createQuery";
import { randomString } from "@/utils/random";

const useMyQuery = createQuery({
  queryPrimaryKey: "test",
  queryFn: async (ctx) => {
    return "test data";
  },
  staleTime: 1000 * 60 * 5,
  cacheTime: 1000 * 60 * 10,
});

const useMyVarsQuery = createQuery({
  queryPrimaryKey: "vars",
  queryKeyVariables: ({ id }: { id: number }) => [id],
  queryFn: async (ctx, vars) => {
    const [primaryKey, id] = ctx.queryKey;
    return {
      primaryKey, id, data: randomString(6)
    }
  },
  staleTime: 1000 * 60 * 5,
  cacheTime: 1000 * 60 * 10,
});

const useMyMutation = createMutation({
  mutationKey: ["test"],
  mutationFn: async ({ id }: { id: number }) => {
    return {
      id,
      data: "test mutation",
    }
  },
});

const Test = () => {
  const query = useMyQuery();
  const query2 = useMyVarsQuery({
    variables: {
      id: 4,
    }
  });
  const mutation = useMyMutation();
  
  return (
    <div className="p-4">
      <div className="flex gap-4 p-2">
        <button
          className="bg-blue-500 text-white rounded-md p-2"
          onClick={() => {
            query.setData(prev => prev ? (`new test data: ${randomString(6)}`) : undefined);
            query2.setData(prev => prev ? { ...prev, data: randomString(6) } : undefined);
          }}
        >
          Set Query Data
        </button>

        <button
          className="bg-blue-500 text-white rounded-md p-2"
          onClick={async () => {
            const result = await mutation.mutateAsync({ id: 5 });
            console.log("mutation result", result)
          }}
        >
          Call Mutation
        </button>
      </div>

      <div className="flex gap-12">
        <div>
          <span>Query 1:</span>
          <p>
            {query.data}
          </p>
        </div>
        <div>
          <span>Query 2:</span>
          <p className="whitespace-pre">
            {JSON.stringify(query2.data, null, 2)}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Test;
