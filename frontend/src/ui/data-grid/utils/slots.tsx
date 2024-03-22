import { JSXElementConstructor } from "react";

export const NullComponent = () => null;

export function getSlotOrNull<T>(slot?: JSXElementConstructor<T>): JSXElementConstructor<T> {
  return slot ?? NullComponent;
}
