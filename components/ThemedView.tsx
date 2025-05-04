import tw from '@/lib/tailwind';
import { useColorScheme, View, ViewProps } from 'react-native';

interface ThemedViewProps extends ViewProps {
  style?: any;
  className?: string; // 添加className属性支持TailwindCSS
  lightColor?: string; // 保留原有属性以兼容现有代码
  darkColor?: string; // 保留原有属性以兼容现有代码
}

export function ThemedView({ style, className, lightColor, darkColor, ...props }: ThemedViewProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // 使用提供的lightColor和darkColor，如果有的话
  const backgroundColor = isDark 
    ? (darkColor || '#1c1c1e') 
    : (lightColor || '#ffffff');
  
  return (
    <View 
      style={[
        { backgroundColor },
        style,
        className ? tw`${className}` : null
      ]} 
      {...props} 
    />
  );
}

