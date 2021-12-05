import { useEffect, useRef, useState } from 'react';
import { AtCard, AtIcon, AtInput, AtButton } from 'taro-ui';
import './index.scss';
import { View } from '@tarojs/components';
import * as util from '@src/utils/util';


export default function Index() {
  const [records, setRecords] = useState<NdefRecordStr[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [techs, setTechs] = useState<string[]>([]);
  const initRecord: NdefRecordStr = { id: '', type: 'T', payload: '', tnf: 1 };

  const { current: NFCAdapter } = useRef(wx.getNFCAdapter());
  const { current: Ndef } = useRef(NFCAdapter.getNdef());

  useEffect(() => {
    startDiscovery();
    onDiscovered();
  }, []);

  useEffect(() => {
    if (records.length === 0) {
      resetRecord();
    }
  }, [records]);

  /**
   * 开启发现NFC
   */
  const startDiscovery = () => {
    addLog('开启发现NFC');
    addLog('请将标签放入NFC识别区');
    NFCAdapter.startDiscovery({
      success: res => {
        addLog(res.errMsg);
      },
      fail: error => {
        addLog(error.errMsg);
      },
    });
  };

  /**
   * 从NFC中读取到信息回调
   */
  const onDiscovered = () => {
    NFCAdapter.onDiscovered(res => {
      const result = res as NdefResult;
      console.log('发现了 nfc tag', result);
      addLog('开始读取数据...');
      const { messages, techs } = result;
      setTechs(techs);

      let newRecords: NdefRecordStr[] = [];

      if (messages && messages.length) {
        addLog('=====================');
        let { records } = result.messages[0];
        addLog(`读取成功，共${records.length}条Record`);
        newRecords = records.map(record => {
          let id: string | ArrayBuffer;
          let type: string | ArrayBuffer;
          let payload: string | ArrayBuffer;
          let tnf: number;
          ({ id, type, payload, tnf } = record);
          id = util.ab2str(id);
          type = util.ab2str(type);
          payload = util.ab2str(payload);
          addLog(JSON.stringify({ id, type, tnf, payload }));
          return { id, type, payload, tnf };
        });
        addLog('=====================');
      } else {
        addLog('NFC数据Record为空!!!');
      }

      setRecords(newRecords);
    });
  };

  const writeNFCNdef = () => {
    addLog('准备写入数据...');
    // records String 转 ArrayBuffer
    /**
     * 重写 Ndef 标签内容
     */
    const bufRecords: NdefRecordBuf[] = records.map((record) => {
      console.log('写入record', record);
      let payload = record.payload;
      if (payload.match(/\u0000/g)?.length !== 1 && payload.indexOf('\u0000') !== 0) {
        payload = '\u0000' + record.payload;
      }
      return {
        id: util.str2ab(record.id),
        payload: util.str2ab(payload),
        type: util.str2ab(record.type),
        tnf: Number(record.tnf),
      };
    });

    // 连接NFC标签
    Ndef.connect({
      success: () => {
        addLog('已连接NFC');
        // 执行写入
        writeNdefMessage(bufRecords);
      },
      fail: error => {
        addLog(error.errMsg);
      },
    });
  };

  /**
   * 执行写入
   */
  const writeNdefMessage = (bufRecords: NdefRecordBuf[]) => {
    addLog('正在执行写入...');
    Ndef.writeNdefMessage({
      records: bufRecords,
      success: res => {
        addLog('写入数据成功!');
        addLog(res.errMsg);
      },
      fail: error => {
        addLog(error.errMsg);
      },
      complete: () => {
        // 断开连接
        Ndef.close();
      },
    });
  };

  /**
   * 表单id输入
   */
  const handleIdInput = (value, index) => {
    records[index].id = value;
    setRecords([...records]);
  };

  /**
   * 表单type输入
   */
  const handleTypeInput = (value, index) => {
    records[index].type = value;
    setRecords([...records]);
  };

  /**
   * 表单payload输入
   */
  const handlePayloadInput = (value, index) => {
    records[index].payload = value;
    setRecords([...records]);
  };

  /**
   * 表单tnf输入
   */
  const handleTNFInput = (value, index) => {
    records[index].tnf = value;
    setRecords([...records]);
  };

  /**
   * 添加日志
   * @param text
   */
  const addLog = (text: string) => {
    console.log(text);
    setLogs((preVal) => {
      return [{ text, time: util.formatTime(new Date()) }, ...preVal];
    });
  };

  /**
   * 添加record
   */
  const addRecord = () => {
    setRecords([...records, initRecord]);
  };

  /**
   * 删除record
   */
  const delRecord = (index) => {
    records.splice(index, 1);
    setRecords([...records]);
  };

  /**
   * 重置record表单
   */
  const resetRecord = () => {
    setRecords([initRecord]);
  };

  return (
    <View className="page-nfc">
      <View className="at-article__p">NFC数据类型：{techs.length ? techs.join(',') : '-'}</View>
      {/* Record表单 */}
      {
        records.map((record, index) => (
          <AtCard
            title={`Record [${index}]`}
            key={index}
          >
            <View style={{
              position: 'absolute',
              right: '10px',
              top: '9px',
            }}>
              <AtIcon value="close-circle" size="18" color="#333" onClick={() => delRecord(index)} />
            </View>
            <AtInput
              name={`id${index}`}
              title="id"
              placeholder="请输入"
              value={record.id}
              onChange={(value) => handleIdInput(value, index)}
            />
            <AtInput
              name={`type${index}`}
              title="type"
              placeholder="请输入"
              value={record.type}
              onChange={(value) => handleTypeInput(value, index)}
            />
            <AtInput
              name={`payload${index}`}
              title="payload"
              placeholder="请输入"
              value={record.payload}
              onChange={(value) => handlePayloadInput(value, index)}
            />
            <AtInput
              name={`tnf${index}`}
              title="tnf"
              placeholder="请输入"
              value={String(record.tnf)}
              onChange={(value) => handleTNFInput(value, index)}
            />
          </AtCard>
        ))
      }

      {/* 按钮组 */}
      <AtButton type="primary" size="small" onClick={addRecord}>添加Record</AtButton>
      <AtButton type="primary" size="small" onClick={writeNFCNdef}>写入NFC标签</AtButton>
      <AtButton type="secondary" size="small" onClick={resetRecord}>重置Record表单</AtButton>
      <AtButton type="secondary" size="small" onClick={startDiscovery}>重试NFC发现</AtButton>
      <AtButton type="secondary" size="small" onClick={() => setLogs([])}>清空日志</AtButton>

      {/* 日志区域 */}
      <View className="log-console">
        {
          logs.map(({ text, time }) => (
            <View className="log-item">
              <View className="text">{text}</View>
              <View className="time">{time}</View>
            </View>
          ))
        }
      </View>

    </View>
  );
}
