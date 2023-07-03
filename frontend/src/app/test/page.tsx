"use client";

import { createMutation } from "@/utils/api/helpers/createMutation";
import { createQuery } from "@/utils/api/helpers/createQuery";

const useMyQuery = createQuery({
  queryPrimaryKey: "test",
  queryKeyVariables: () => [1, { a: "str" }],
  queryFn: async (ctx, vars) => {
    const [pk, id, obj] = ctx.queryKey;
    console.log("vars from test", vars)
    return {
      pk, id, obj,
    }
  },
  staleTime: 1000 * 60 * 5,
  cacheTime: 1000 * 60 * 10,
});

const useMyVarsQuery = createQuery({
  queryPrimaryKey: "vars",
  queryKeyVariables: ({ id }: { id: number }) => [id],
  queryFn: async (ctx, vars) => {
    const [pk, id] = ctx.queryKey;
    console.log("vars from vars", vars)
    return {
      pk, id
    }
  },
  staleTime: 1000 * 60 * 5,
  cacheTime: 1000 * 60 * 10,
});

const useMyMutation = createMutation({
  mutationKey: ["test"],
  mutationFn: async ({ id }: { id: number }) => {
    return {
      id: 1,
      data: "test mutation",
    }
  },
});

const useMyMutationWrapper = () => {
  const mutation = useMyMutation({
    onMutate: async (data) => {
      console.log("mutation wrapper onMutate", data);
    }
  });

  return mutation;
}

const Test = () => {
  const query = useMyQuery();
  const query2 = useMyVarsQuery({
    variables: {
      id: 4,
    }
  });
  const mutation = useMyMutation({
    onMutate: async (data) => {
      console.log("mutation onMutate", data);
    }

  });
  const mutation2 = useMyMutationWrapper();
  
  if (query.data || query2.data) {
    // console.log(query.queryPrimaryKey, query.data, query.variables)
    console.log(query2.queryPrimaryKey, query2.data, query2.variables)
  }

  return (
    <div className="p-4">
      Hola
      <div className="flex gap-4 p-2">
        <button
          className="bg-blue-500 text-white rounded-md p-2"
          onClick={() => {
            const a = query.setData(prev => prev ? ({
              ...prev,
              obj: {
                a: "new"
              }
            }) : undefined);
            console.log("changes",a)
            query.queryClient
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
        <button
          className="bg-blue-500 text-white rounded-md p-2"
          onClick={async () => {
            const result = await mutation2.mutateAsync({ id: 5 });
            console.log("mutation result", result)
          }}
        >
          Call Mutation2
        </button>
      </div>
    </div>
  )
}

export default Test;