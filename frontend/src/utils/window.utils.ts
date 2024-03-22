export function openCenteredPopupWindow(
  url: URL | string, 
  parent: Window, 
  target?: string, 
  size?: { width: number, height: number }
): Window | null {
  if (parent.top && size) {
    const y = parent.top.outerHeight / 2 + parent.top.screenY - ( size.height / 2);
    const x = parent.top.outerWidth / 2 + parent.top.screenX - ( size.width / 2);
    return parent.open(url, target, `width=${size.width},height=${size.height},left=${x},top=${y}`);
  }
  else {
    return parent.open(url, target);
  }
}