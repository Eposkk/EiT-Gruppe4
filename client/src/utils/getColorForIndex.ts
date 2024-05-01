export const getColorForIndex = (index: number): string => {
  const colors = [
    "blue",
    "green",
    "red",
    "yellow",
    "purple",
    "orange",
    "teal",
    "pink",
    "lime",
    "amber",
  ];
  return colors[index % colors.length] ?? "teal";
};
