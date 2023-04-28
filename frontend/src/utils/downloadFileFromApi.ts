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

// //* Example:
// const resp = await http.get(url, {
//   responseType: "blob"
// });
// downloadFileFromApi(resp.data, "my_file.txt");