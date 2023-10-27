export const useSsr = () => {
  const isSsr = 
    typeof window === "undefined"
    || !window.document;

  return { 
    isBrowser: !isSsr,
    isServer: isSsr,
  };
}