export function formatDate(date) {
  if (!date) return "No deadline";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "No deadline";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function isOverdue(task) {
  if (!task.dueDate || task.status === "Done") return false;

  const due = new Date(task.dueDate);
  due.setHours(23, 59, 59, 999);

  return due < new Date();
}

export function getErrorMessage(error) {
  return (
    error.response?.data?.message ||
    error.response?.data?.error ||
    "Something went wrong. Please try again."
  );
}
