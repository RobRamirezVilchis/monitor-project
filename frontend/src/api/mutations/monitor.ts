import { createMutation } from "../helpers/createMutation";
import { addIndustryClient, addNewProject, addSafeDrivingClient, addSmartBuildingsClient, addSmartRetailClient, deleteProject, editProject, getProjectData, modifyServerProjects, setDeviceAsInactive, setUnitAsInactive } from "../services/monitor";


export const useAddSDClientMutation = createMutation({
  mutationKey: ["add-sd-client"],
  mutationFn: (data: Parameters<typeof addSafeDrivingClient>[0]) => addSafeDrivingClient(data),
});


export const useAddIndClientMutation = createMutation({
  mutationKey: ["add-ind-client"],
  mutationFn: (data: Parameters<typeof addIndustryClient>[0]) => addIndustryClient(data),

});

export const useAddSRClientMutation = createMutation({
  mutationKey: ["add-sr-client"],
  mutationFn: (data: Parameters<typeof addSmartRetailClient>[0]) => addSmartRetailClient(data),

});


export const useSetUnitInactiveMutation = createMutation({
  mutationKey: ["set-unit-inactive"],
  mutationFn: (data: Parameters<typeof setUnitAsInactive>[0]) => setUnitAsInactive(data),

});

export const useSetDeviceInactiveMutation = createMutation({
  mutationKey: ["set-device-inactive"],
  mutationFn: (data: Parameters<typeof setDeviceAsInactive>[0]) => setDeviceAsInactive(data),

});

export const useNewProjectMutation = createMutation({
  mutationKey: ["new-project"],
  mutationFn: (data: Parameters<typeof addNewProject>[0]) => addNewProject(data),
})

export const useEditProjectMutation = createMutation({
  mutationKey: ["edit-project"],
  mutationFn: (data: Parameters<typeof editProject>[0]) => editProject(data),
})

export const useDeleteProjectMutation = createMutation({
  mutationKey: ["edit-project"],
  mutationFn: (data: Parameters<typeof deleteProject>[0]) => deleteProject(data),
})

export const useProjectDataMutation = createMutation({
  mutationKey: ["project-data"],
  mutationFn: (data: Parameters<typeof getProjectData>[0]) => getProjectData(data),
})

export const useModifyServerProjectsMutation = createMutation({
  mutationKey: ["modify-projects"],
  mutationFn: (data: Parameters<typeof modifyServerProjects>[0]) => modifyServerProjects(data),
})

export const useAddSBClientMutation = createMutation({
  mutationKey: ["add-sb-client"],
  mutationFn: (data: Parameters<typeof addSmartBuildingsClient>[0]) => addSmartBuildingsClient(data),

});