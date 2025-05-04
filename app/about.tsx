import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default function AboutScreen() {
  console.log('渲染 AboutScreen 组件');
  
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          console.log('返回按钮被点击');
          router.back();
        }} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#666" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>关于应用</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        // 使用 Ionicons 替代图片
        <Ionicons name="information-circle" size={120} color="#4CAF50" style={styles.logo} />
        
        <ThemedText type="title" style={styles.appName}>课程表</ThemedText>
        <ThemedText style={styles.version}>版本 1.0.0</ThemedText>
        
        <ThemedView style={styles.infoContainer}>
          <ThemedText style={styles.infoText}>
            这是一个简单的课程表应用，帮助您管理和查看课程安排。
          </ThemedText>
          
          <ThemedText style={styles.infoText}>
            功能包括：
          </ThemedText>
          
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
              <ThemedText style={styles.featureText}>查看今日课程</ThemedText>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
              <ThemedText style={styles.featureText}>周课程表视图</ThemedText>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
              <ThemedText style={styles.featureText}>添加和编辑课程</ThemedText>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
              <ThemedText style={styles.featureText}>深色模式支持</ThemedText>
            </View>
          </View>
        </ThemedView>
        
        <ThemedText style={styles.copyright}>
          © 2023 课程表应用
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  appName: {
    fontSize: 24,
    marginBottom: 5,
  },
  version: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  infoContainer: {
    width: '100%',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
  },
  infoText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
    textAlign: 'center',
  },
  featureList: {
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureText: {
    fontSize: 16,
    marginLeft: 10,
  },
  copyright: {
    fontSize: 14,
    color: '#999',
    position: 'absolute',
    bottom: 20,
  },
});