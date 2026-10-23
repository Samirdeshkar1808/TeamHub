export function getCount(data, keys) {
  for (const key of keys) {
    const value = data?.[key];

    if(typeof value === "number") return value;
    if(Array.isArray(value)) return value.length;

    if(
      value &&
      typeof value === "object" &&
      typeof value.count === "number"
    ){
      return value.count;
    }
  }

  return null;
}

export function getList(data, keys = []) {
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;

  return [];
}

export function getId(item) {
  return item?._id || item?.id || "";
}

export function getName(item) {
  return (
    item?.name ||
    item?.teamName ||
    item?.organizationName ||
    "Untitled"
  );
}
