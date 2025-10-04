export const logEvent = (event: string, data?: Record<string, any>) => {
  console.log(`[ANALYTICS] ${event}`, data || {});
};
