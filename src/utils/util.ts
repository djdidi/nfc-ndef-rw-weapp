export function noop() {
}

export const formatTime = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`;
};

export const formatNumber = (n: number | string) => {
  n = n.toString();
  return n[1] ? n : `0${n}`;
};

// 字符串转ArrayBuffer
export const str2ab = (str: string): ArrayBuffer => {
  let buf = new ArrayBuffer(str.length);
  let bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
};

// ArrayBuffer转字符串
export const ab2str = (buf: ArrayBuffer): string => {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
};
