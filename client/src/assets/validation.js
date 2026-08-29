export const number = (value) => (value.trim() === "" ? NaN : Number(value));

export const inRange = (value, min, max) => value >= min && value <= max;

export const wholeAtLeast = (value, min) =>
  Number.isInteger(value) && value >= min;
