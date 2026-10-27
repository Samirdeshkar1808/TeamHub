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
  return item?.organization_Id?._id || item?.team_Id?._id || "" ;
}

export function getName(item) {
  return (
    item?.organization_Id?.name ||
    item?.team_Id?.name ||
    "Untitled"
  );
}
