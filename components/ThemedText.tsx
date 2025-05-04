import tw from '@/lib/tailwind';
import { StyleSheet, Text, TextProps, useColorScheme } from 'react-native';

interface ThemedTextProps extends TextProps {
  type?: 'default' | 'title' | 'subtitle';
  style?: any;
  className?: string; // 添加className属性支持TailwindCSS
}

export function ThemedText({ type = 'default', style, className, ...props }: ThemedTextProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // 使用预定义的样式
  const getTypeStyle = () => {
    switch (type) {
      case 'title':
        return styles.title;
      case 'subtitle':
        return styles.subtitle;
      default:
        return styles.default;
    }
  };
  
  return (
    <Text 
      style={[
        { color: isDark ? '#ffffff' : '#000000' },
        getTypeStyle(),
        style,
        className ? tw`${className}` : null
      ]} 
      {...props} 
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});
interface ThemedTextProps extends TextProps {
  type?: 'default' | 'title' | 'subtitle';
  style?: any;
  className?: string; // 添加className属性支持TailwindCSS
}
