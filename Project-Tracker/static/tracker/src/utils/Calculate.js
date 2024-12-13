export const calculateTotal = (field, currentIssues) => {
  return currentIssues && currentIssues.reduce((acc, issue) => {
    const value = issue?.fields?.[field];
    return acc + (value || 0);
  }, 0);
};