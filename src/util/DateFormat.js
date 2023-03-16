function formatDate(dateString) {
  const options = { month: "short", day: "numeric", year: "numeric" };
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", options);
}

export {
  formatDate
}