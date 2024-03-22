export function getInputValue<T>(eventOrValue: unknown) {
  return (isEvent(eventOrValue) 
    ? isCheckboxInput(eventOrValue.target as HTMLInputElement)
      ? (eventOrValue.target as HTMLInputElement).checked
      : (eventOrValue.target as HTMLInputElement).value
    : eventOrValue) as T;
}

function isObject(value: unknown) {
  return value !== null 
    && value !== undefined 
    && typeof value === "object" 
    && !Array.isArray(value) 
    && !(value instanceof Date);
}

function isEvent(value: unknown): value is Event {
  return isObject(value) && "target" in (value as Event);
}

function isCheckboxInput(element: HTMLInputElement) {
  return element.type === "checkbox";
}
