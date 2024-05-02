import { createMutation } from "../helpers/createMutation";
import { addIndustryClient, addSafeDrivingClient } from "../services/monitor";


export const useAddSDClientMutation = createMutation({
    mutationKey: ["add-sd-client"],
    mutationFn: (data: Parameters<typeof addSafeDrivingClient>[0]) => addSafeDrivingClient(data),
  });


  export const useAddIndClientMutation = createMutation({
    mutationKey: ["add-ind-client"],
    mutationFn: (data: Parameters<typeof addIndustryClient>[0]) => addIndustryClient(data),

  });