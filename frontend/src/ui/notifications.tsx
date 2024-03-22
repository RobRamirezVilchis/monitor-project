import { showNotification } from "@mantine/notifications";

import { 
  IconCheck, 
  IconX,
  IconExclamationMark,
} from "@tabler/icons-react";

export const showSuccessNotification: typeof showNotification = (notification, store) => 
  showNotification({
    classNames:{
      root: "bg-green-100",
      title: "text-green-900",
      description: "text-green-700",
      icon: "bg-green-700",
      closeButton: "text-green-900 hover:bg-green-200 rounded-full",
    },
    icon: <IconCheck className="w-4 h-4" />,
    ...notification,
  }, store
);

export const showErrorNotification: typeof showNotification = (notification, store) => 
  showNotification({
    classNames: {
      root: "bg-red-100",
      title: "text-red-900",
      description: "text-red-700",
      icon: "bg-red-700",
      closeButton: "text-red-900 hover:bg-red-200 rounded-full",
    },
    icon: <IconX className="w-4 h-4" />,
    ...notification,
  }, store
);

export const showWarningNotification: typeof showNotification = (notification, store) =>
  showNotification({
    classNames: {
      root: "bg-amber-100",
      title: "text-amber-900",
      description: "text-amber-700",
      icon: "bg-amber-700",
      closeButton: "text-amber-900 hover:bg-amber-200 rounded-full",
    },
    icon: <IconExclamationMark className="w-4 h-4" />,
    ...notification,
  }, store
);

export const showInfoNotification: typeof showNotification = (notification, store) =>
  showNotification({
    classNames: {
      root: "bg-sky-100",
      title: "text-sky-900",
      description: "text-sky-700",
      icon: "bg-sky-700",
      closeButton: "text-sky-900 hover:bg-sky-200 rounded-full",
    },
    icon: <IconExclamationMark className="w-4 h-4 rotate-180" />,
    ...notification,
  }, store
);
