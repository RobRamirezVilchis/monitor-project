

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Downloads a file in the browser when the response is a blob.
 * @param data 
 * @param fileName 
 * @example
 * const resp = await http.get(url, {
 *  responseType: "blob"
 * });
 * downloadFileFromApi(resp.data, "my_file.txt");
 */
export function downloadFileFromApi(data: Blob | MediaSource, fileName: string) {
  const href = URL.createObjectURL(data);
  const link = document.createElement("a");
  link.href = href;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(href);
}

// https://stackoverflow.com/a/18650828
export function formatBytes(bytes: number, decimals: number = 2) {
  if (!+bytes) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
