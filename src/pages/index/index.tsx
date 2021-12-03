// @ts-nocheck
import { View, Text } from '@tarojs/components';
import { AtButton } from 'taro-ui';
import './index.scss';

export default function Index() {
  return (
    <View className="index">
      <Text>Hello world!</Text>
      <AtButton loading>123132</AtButton>
      <AtButton>按钮文案</AtButton>
      <AtButton type="primary">按钮文案</AtButton>
      <AtButton type="secondary">按钮文案</AtButton>
    </View>
  );
}
