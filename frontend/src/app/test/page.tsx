"use client";

import { createMutation } from "@/api/helpers/createMutation";
import { createQuery } from "@/api/helpers/createQuery";
import { ConfirmDialogProvider } from "@/components/shared/ConfirmDialogProvider";
import { useConfirmDialog } from "@/hooks/shared/useConfirmDialog";
import { UseTimerOptions, useTimer } from "@/hooks/shared/useTimer";
import { useState } from "react";

import http from "@/api/http";

const useMyQuery = createQuery({
  queryPrimaryKey: "test",
  queryKeyVariables: () => [1, { a: "str" }],
  queryFn: async (ctx, vars) => {
    const [pk, id, obj] = ctx.queryKey;
    // console.log("vars from test", vars)
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
    // console.log("vars from vars", vars)
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

  const dialog = useConfirmDialog({
    content: {
      title: "Test title",
      body: "Test body",
      confirmLabel: "Test confirm",
      cancelLabel: "Test cancel",
    },
    onConfirm: async () => {
      console.log("default confirm")
      await new Promise(resolve => setTimeout(resolve, 3000));

      // console.log("error");
      // throw new Error("Error");

      console.log("success");
    },
    callbacks: {
      onConfirmClick: () => console.log("onConfirmClick"),
      onCancelClick: () => console.log("onCancelClick"),
      onClose: () => console.log("onClose"),
    }
  });

  const dialogAlt = useConfirmDialog();

  

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

      <div className="flex gap-4 p-2">
        <button
          className="bg-blue-500 text-white rounded-md p-2"
          onClick={() => dialog.confirm()}
        >
          Dialog default
        </button>

        <button
          className="bg-blue-500 text-white rounded-md p-2"
          onClick={() => dialog.confirm({
            content: {
              title: "Dialog 1",
              body: "Dialog 1 body",
              confirmLabel: "Dialog 1 confirm",
              cancelLabel: "Dialog 1 cancel",
            },
            onConfirm: async () => {
              console.log("confirm 1")
              await new Promise(resolve => setTimeout(resolve, 3000));

              // console.log("error");
              // throw new Error("Error");

              console.log("success");
            },
          })}
        >
          Dialog 1
        </button>

        <button
          className="bg-blue-500 text-white rounded-md p-2"
          onClick={() => dialog.confirm({
            content: {
              title: "Dialog 2",
              body: "Dialog 2 body",
              confirmLabel: "Dialog 2 confirm",
              cancelLabel: "Dialog 2 cancel",
            },
            onConfirm: async () => {
              console.log("confirm 2")
              await new Promise(resolve => setTimeout(resolve, 3000));

              console.log("error");
              throw new Error("Error");

              console.log("success");
            },
            onError: e => console.log("adasd", e),
          })}
        >
          Dialog 2
        </button>

        <button
          className="bg-blue-500 text-white rounded-md p-2"
          onClick={() => dialogAlt.confirm({
            // content: {
            //   title: "Dialog Alt",
            //   body: "Dialog Alt body",
            //   confirmLabel: "Dialog Alt confirm",
            //   cancelLabel: "Dialog Alt cancel",
            // },
            // onConfirm: async () => {
            //   console.log("confirm Alt")
            //   await new Promise(resolve => setTimeout(resolve, 3000));

            //   console.log("error");
            //   throw new Error("Error");

            //   console.log("success");
            // },
            // onError: e => console.log("adasd", e),
          })}
        >
          Dialog Alt
        </button>
      </div>

      <TimerExample />

      <div>
        <button
          className="bg-blue-500 text-white rounded-md p-2"
          onClick={async () => {
            try {
              const resp1 = http.get("/inexistent", {
                retryDelay: 0,
                onError: (e) => {
                  console.log("error", new Date(), e.config._failureCount);
                  throw e;
                },
                onRetry: (count, e) => {
                  console.log("retry", count);
                  // if (count === 2)
                  //   throw e;
                }
              });

              // const resp2 = http.get("/inexistent", {
              //   retry: 3,
              //   onError: (e) => {
              //     console.log("error resp 2");
              //     throw e;
              //   },
              // });
            }
            catch (e) {
              console.log("resp error", e)
            }
          }}
        >
          Test Http
        </button>
      </div>
    </div>
  )
}

const Wrapper = () => {
  return (
    <ConfirmDialogProvider outsideClickClose content={{ 
      title: "Prov title",
      body: "Prov body",
      confirmLabel: "Prov confirm",
      cancelLabel: "Prov cancel",
    }}>
      <Test />
    </ConfirmDialogProvider>
  )
}

export default Wrapper;

const withTrailingZeros = (num: number, digits: number) => num.toString().padStart(digits, "0");

const TimerExample = () => {
  const [timerOptions, setTimerOptions] = useState<UseTimerOptions>({
    interval: 50,
    // autoStart: true,
    
    // initialTime: -5 * 1000,
    // stopAt: 10 * 1000,
    // autoReset: 3 * 1000,
    // autoRestart: 5 * 1000,

    // initialTime: -5 * 1000,
    // stopAt: -1 * 1000,
    // autoReset: -4 * 1000,
    // autoRestart: -3 * 1000,
    onStop: time => console.log("onStop", time),
  });
  const timer = useTimer(timerOptions);

  return (
    <div className="flex gap-4 p-2 items-center">
      <div>
        <p>
          Time: [{withTrailingZeros(timer.time.hours, 2)}:
          {withTrailingZeros(timer.time.minutes, 2)}:
          {withTrailingZeros(timer.time.seconds, 2)}.
          {withTrailingZeros(timer.time.milliseconds, 3)}]
        </p>
        <p>Elapsed: {timer.time.elapsed / 1000}</p>
        <p>Estatus: {timer.status}</p>
      </div>

      <button
        className="bg-blue-500 text-white rounded-md p-2"
        onClick={timer.start}
      >
        {timer.isPaused ? "Resume" : "Start"}
      </button>

      <button
        className="bg-blue-500 text-white rounded-md p-2"
        onClick={timer.pause}
      >
        Pause
      </button>

      <button
        className="bg-blue-500 text-white rounded-md p-2"
        onClick={() => timer.stop(3 * 1000)}
      >
        Stop
      </button>

      <button
        className="bg-blue-500 text-white rounded-md p-2"
        onClick={() => timer.restart(5 * 1000)}
      >
        Restart
      </button>

      <button
        className="bg-blue-500 text-white rounded-md p-2"
        onClick={() => timer.reset(10 * 1000)}
      >
        Reset
      </button>

      <button
        className="bg-blue-500 text-white rounded-md p-2"
        onClick={() => {
          const newOptions: UseTimerOptions = {
            onTick: (time) => console.log(time),
            autoStart: true,
            stopAt: 15 * 1000,
            onStop: (time) => console.log("onStop", time),
          };
          setTimerOptions(newOptions);
        }}
      >
        Update timer options
      </button>
    </div>
  );
}