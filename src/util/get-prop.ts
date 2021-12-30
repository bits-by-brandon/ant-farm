export default function getPropInitialValue<T>(
  key: keyof T,
  list: UiPropList<T>
) {
  const range = list.filter(
    (property) => property.type === "range"
  ) as UiRangeProp<T>[];

  const found = range.find((property) => key === property.key);
  if (!found)
    throw new Error(
      `The ${key} property does not exist in the UI Prop List. Ensure the props.ts file has an entry with the key ${key}`
    );

  return found.initialValue;
}
