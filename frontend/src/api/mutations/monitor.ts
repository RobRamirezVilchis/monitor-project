import { createMutation } from "../helpers/createMutation";
import { addIndustryClient, addNewProject, addSafeDrivingClient, addSmartBuildingsClient, addSmartRetailClient, createGxModel, deleteProject, editProject, getProjectData, modifyGxThresholds, modifyLoadBalancerMetricThresholds, modifyRDSMetricThresholds, modifyServerMetricThresholds, modifyServerProjects, setDeviceAsInactive, setRombergDeviceAsInactive, setUnitAsInactive, changeGxModel, editGxModel, deleteGxModel } from "../services/monitor";


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

export const useModifyServerThresholdsMutation = createMutation({
  mutationKey: ["modify-server-metrics"],
  mutationFn: (data: Parameters<typeof modifyServerMetricThresholds>[0]) => modifyServerMetricThresholds(data),

});
export const useModifyRDSThresholdsMutation = createMutation({
  mutationKey: ["modify-rds-metrics"],
  mutationFn: (data: Parameters<typeof modifyRDSMetricThresholds>[0]) => modifyRDSMetricThresholds(data),

});
export const useModifyELBThresholdsMutation = createMutation({
  mutationKey: ["modify-elb-metrics"],
  mutationFn: (data: Parameters<typeof modifyLoadBalancerMetricThresholds>[0]) => modifyLoadBalancerMetricThresholds(data),

});

export const useAddSBClientMutation = createMutation({
  mutationKey: ["add-sb-client"],
  mutationFn: (data: Parameters<typeof addSmartBuildingsClient>[0]) => addSmartBuildingsClient(data),

});

// Romberg --------------------------------------------------------
export const useSetRombergDeviceInactiveMutation = createMutation({
  mutationKey: ["set-romberg-device-inactive"],
  mutationFn: (data: Parameters<typeof setRombergDeviceAsInactive>[0]) => setRombergDeviceAsInactive(data),

});

// Gx Models -----------------------------------------------------
export const useUpdateGxModelMutation = createMutation({
  mutationKey: ["modify-model"],
  mutationFn: (data: Parameters<typeof changeGxModel>[0]) => changeGxModel(data),

});

export const useCreateGxModelMutation = createMutation({
  mutationKey: ["create-model"],
  mutationFn: (data: Parameters<typeof createGxModel>[0]) => createGxModel(data),

});

export const useEditModelMutation = createMutation({
  mutationKey: ["edit-model"],
  mutationFn: (data: Parameters<typeof editGxModel>[0]) => editGxModel(data),
});

export const useDeleteModelMutation = createMutation({
  mutationKey: ["delete-model"],
  mutationFn: (data: Parameters<typeof deleteGxModel>[0]) => deleteGxModel(data),
});

// Gx Metrics -----------------------------------------------------
export const useModifyThresholdsMutation = createMutation({
  mutationKey: ["modify-metrics"],
  mutationFn: (data: Parameters<typeof modifyGxThresholds>[0]) => modifyGxThresholds(data),

});