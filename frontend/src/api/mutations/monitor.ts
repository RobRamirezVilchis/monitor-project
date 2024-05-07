import { createMutation } from "../helpers/createMutation";
import { addIndustryClient, addSafeDrivingClient, setDeviceAsInactive, setUnitAsInactive } from "../services/monitor";


export const useAddSDClientMutation = createMutation({
  mutationKey: ["add-sd-client"],
  mutationFn: (data: Parameters<typeof addSafeDrivingClient>[0]) => addSafeDrivingClient(data),
});


export const useAddIndClientMutation = createMutation({
  mutationKey: ["add-ind-client"],
  mutationFn: (data: Parameters<typeof addIndustryClient>[0]) => addIndustryClient(data),

});


export const useSetUnitInactiveMutation = createMutation({
  mutationKey: ["set-unit-inactive"],
  mutationFn: (data: Parameters<typeof setUnitAsInactive>[0]) => setUnitAsInactive(data),

});

export const useSetDeviceInactiveMutation = createMutation({
  mutationKey: ["set-device-inactive"],
  mutationFn: (data: Parameters<typeof setDeviceAsInactive>[0]) => setDeviceAsInactive(data),

});

