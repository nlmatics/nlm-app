import { SwapOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useContext } from 'react';
import ThemeContext from '../../../contexts/theme/ThemContext';

export default function ThemeSwitch() {
  const { switchTheme } = useContext(ThemeContext);
  return (
    <Button
      title="Switch theme"
      style={{ position: 'fixed', right: 15, top: 15 }}
      icon={<SwapOutlined />}
      onClick={switchTheme}
    ></Button>
  );
}
