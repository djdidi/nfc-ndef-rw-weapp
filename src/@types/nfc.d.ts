declare interface Log {
  time: string;
  text: string;
}

declare interface NdefRecordBuf {
  id: ArrayBuffer;
  type: ArrayBuffer;
  payload: ArrayBuffer;
  tnf: number;
}

declare interface NdefRecordStr {
  id: string;
  type: string;
  payload: string;
  tnf: number;
}

declare type NdefMessage = [{ records: NdefRecordBuf[] }];

declare interface NdefResult {
  id: ArrayBuffer;
  messages: NdefMessage;
  techs: string[]; // NFC 卡片支持的标准
}
