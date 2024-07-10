export type StatusKey = 0 | 1 | 2 | 3 | 4 | 5;
export const statusStyles: { [key in StatusKey]: string } = {
  0: "bg-gray-100 dark:bg-gray-200 border-gray-500 text-gray-900",
  1: "bg-blue-100 dark:bg-blue-200 border-blue-500 text-blue-900",
  2: "bg-green-100 dark:bg-green-200 border-green-500 text-green-900",
  3: "bg-yellow-100 dark:bg-yellow-200 border-yellow-500 text-yellow-900",
  4: "bg-orange-100 dark:bg-orange-200 border-orange-500 text-orange-900",
  5: "bg-red-100 dark:bg-red-200 border-red-500 text-red-900",
};

export const statusNames: { [key in StatusKey]: string } = {
  0: "Inactivo",
  1: "Funcionando",
  2: "Normal",
  3: "Alerta",
  4: "Fallando",
  5: "Crítico",
};
export const dotColors: { [key in StatusKey]: string } = {
  0: "#c9c9c9",
  1: "#70bafa",
  2: "#57d46c",
  3: "#ffd919",
  4: "#fca14c",
  5: "#f74a36",
};
export const pieColors: { [key in StatusKey]: string } = {
  0: "gray",
  1: "blue",
  2: "green",
  3: "yellow.5",
  4: "orange",
  5: "red",
};
