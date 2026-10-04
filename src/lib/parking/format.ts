export const dateTime = (time: number) =>
  new Date(time).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
