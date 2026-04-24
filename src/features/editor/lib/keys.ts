export const isMac = typeof window !== 'undefined' && /Mac/.test(navigator.platform);
export const k = (mac: string, win: string) => isMac ? mac : win;
