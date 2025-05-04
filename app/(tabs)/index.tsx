import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
// 导入 Modal, Button, Platform
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Button, Modal, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// 更新 Course 接口，移除 isCurrentCourse，添加 weekday
interface Course {
  id: string;
  name: string;
  time: string; // 格式 "HH:MM-HH:MM"
  location: string;
  description?: string;
  weekday: number; // 1 (周一) 到 7 (周日)
}

// 新增接口，包含 isCurrentCourse
interface DisplayCourse extends Course {
  isCurrentCourse: boolean;
}

export default function HomeScreen() {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<DisplayCourse | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteConfirmModalVisible, setIsDeleteConfirmModalVisible] = useState(false); // 新增：控制删除确认 Modal
  const [courseIdToDelete, setCourseIdToDelete] = useState<string | null>(null); // 新增：存储待删除课程 ID

  // 加载课程数据的函数
  const loadCourses = useCallback(async () => {
    try {
      const coursesJson = await AsyncStorage.getItem('courses');
      const loadedCourses = coursesJson ? JSON.parse(coursesJson) : [];
      setAllCourses(loadedCourses);
      console.log('课程已加载:', loadedCourses); // 添加日志
    } catch (error) {
      console.error('加载课程失败:', error); // 添加错误日志
      Alert.alert('错误', '加载课程数据失败');
    }
  }, []);

  // 使用 useFocusEffect 在屏幕获得焦点时加载课程
  useFocusEffect(
    useCallback(() => {
      loadCourses();
    }, [loadCourses])
  );

  // 计算今天的课程和是否为当前课程
  const todayCourses = useMemo<DisplayCourse[]>(() => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 (周日) 到 6 (周六)
    const currentWeekday = currentDay === 0 ? 7 : currentDay; // 转换为 1 (周一) 到 7 (周日)
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    console.log('当前星期:', currentWeekday, '当前时间:', `${currentHour}:${currentMinute}`); // 添加日志

    return allCourses
      .filter(course => course.weekday === currentWeekday) // 筛选今天的课程
      .map(course => {
        let isCurrent = false;
        try {
          const [startTime, endTime] = course.time.split('-');
          const [startH, startM] = startTime.split(':').map(Number);
          const [endH, endM] = endTime.split(':').map(Number);
          const courseStartMinutes = startH * 60 + startM;
          const courseEndMinutes = endH * 60 + endM;

          isCurrent = currentTimeInMinutes >= courseStartMinutes && currentTimeInMinutes < courseEndMinutes;
          console.log(`课程 ${course.name}: 开始 ${courseStartMinutes}, 结束 ${courseEndMinutes}, 当前 ${currentTimeInMinutes}, 是否当前: ${isCurrent}`); // 添加日志
        } catch (e) {
          console.error(`解析课程时间失败: ${course.name} - ${course.time}`, e); // 添加错误日志
        }
        return { ...course, isCurrentCourse: isCurrent };
      })
      .sort((a, b) => { // 按开始时间排序
        try {
          const [aStart] = a.time.split('-');
          const [bStart] = b.time.split('-');
          const [aH, aM] = aStart.split(':').map(Number);
          const [bH, bM] = bStart.split(':').map(Number);
          return (aH * 60 + aM) - (bH * 60 + bM);
        } catch {
          return 0; // 解析失败则不排序
        }
      });
  }, [allCourses]);

  // 新增：执行实际删除操作的函数
  const performActualDelete = async (idToDelete: string) => {
    console.log('performActualDelete called for ID:', idToDelete);
    try {
      const coursesJson = await AsyncStorage.getItem('courses');
      let courses: Course[] = coursesJson ? JSON.parse(coursesJson) : [];
      const updatedCourses = courses.filter(course => course.id !== idToDelete);
      await AsyncStorage.setItem('courses', JSON.stringify(updatedCourses));
      setAllCourses(updatedCourses); // 更新本地状态
      console.log('课程已成功删除 (ID:', idToDelete, ')');
    } catch (error) {
      console.error('删除课程失败:', error);
    }
  };

  // 修改：处理课程点击事件，增加删除选项
  const handleCoursePress = (course: DisplayCourse) => {
    console.log('handleCoursePress called with course:', course);
    setSelectedCourse(course); // 设置选中的课程
    setIsModalVisible(true); // 打开 Modal
  };

  // 新增：关闭 Modal 的函数
  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedCourse(null);
  };

  // 新增：处理 Modal 内编辑按钮点击
  const handleEditInModal = () => {
    if (selectedCourse) {
      router.push({
        pathname: '/course-edit',
        params: {
          id: selectedCourse.id,
          name: selectedCourse.name,
          time: selectedCourse.time,
          location: selectedCourse.location,
          description: selectedCourse.description || '',
          weekday: selectedCourse.weekday.toString()
        }
      });
      handleCloseModal(); // 关闭 Modal
    }
  };

  // 修改：处理 Modal 内删除按钮点击 -> 打开删除确认 Modal
  const handleDeleteInModal = () => {
    if (selectedCourse) {
      console.log('删除按钮点击，准备打开确认 Modal for ID:', selectedCourse.id);
      setCourseIdToDelete(selectedCourse.id); // 设置要删除的 ID
      setIsDeleteConfirmModalVisible(true); // 打开确认 Modal
      setIsModalVisible(false); // 关闭详情 Modal
      setSelectedCourse(null); // 清除选中的课程
    }
  };

  // 新增：关闭删除确认 Modal 的函数
  const handleCloseDeleteConfirmModal = () => {
    setIsDeleteConfirmModalVisible(false);
    setCourseIdToDelete(null);
  };

  // 修改：处理确认删除的函数
  const handleConfirmDelete = async () => {
    console.log('确认删除按钮被点击，courseIdToDelete:', courseIdToDelete);
    if (courseIdToDelete) {
      try {
        console.log('开始执行删除操作...');
        const coursesJson = await AsyncStorage.getItem('courses');
        console.log('获取到的课程数据:', coursesJson);
        let courses: Course[] = coursesJson ? JSON.parse(coursesJson) : [];
        console.log('解析后的课程数组:', courses);
        const updatedCourses = courses.filter(course => course.id !== courseIdToDelete);
        console.log('过滤后的课程数组:', updatedCourses);
        await AsyncStorage.setItem('courses', JSON.stringify(updatedCourses));
        console.log('已将更新后的课程保存到 AsyncStorage');
        setAllCourses(updatedCourses); // 更新本地状态
        console.log('课程已成功删除 (ID:', courseIdToDelete, ')');
        Alert.alert('成功', '课程已成功删除');
      } catch (error) {
        console.error('删除课程失败:', error);
        Alert.alert('错误', '删除失败，请重试');
      }
    } else {
      console.log('没有要删除的课程 ID');
    }
    handleCloseDeleteConfirmModal(); // 关闭确认 Modal
  };

  return (
    <>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
        headerImage={
          <Image
            source={require('@/assets/images/partial-react-logo.png')}
            style={styles.reactLogo}
          />
        }>
        <ThemedView style={styles.container}>
          <ThemedText type="title" className="text-xl font-bold mb-5" style={styles.title}>今日课程</ThemedText>
          {todayCourses.length === 0 ? (
            <ThemedText className="text-center text-gray-500 mt-5 text-base">今天没有课程安排。</ThemedText>
          ) : (
            todayCourses.map((course) => (
              <TouchableOpacity
                key={course.id}
                onPress={() => handleCoursePress(course)}
              >
                <ThemedView
                  className={`p-4 mb-3 rounded-lg ${course.isCurrentCourse ? 'bg-red-100 border-l-4 border-red-500 shadow-md' : 'bg-gray-100'}`}
                >
                  <ThemedText type="subtitle" className="font-bold mb-2">{course.name}</ThemedText>
                  <ThemedText className="text-gray-700">{course.time}</ThemedText>
                  <ThemedText className="text-gray-700">{course.location}</ThemedText>
                </ThemedView>
              </TouchableOpacity>
            ))
          )}
        </ThemedView>
      </ParallaxScrollView>

      {/* 课程详情 Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={handleCloseModal} // Android 返回按钮关闭 Modal
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            {selectedCourse && (
              <>
                <ThemedText type="subtitle" style={styles.modalTitle}>{selectedCourse.name}</ThemedText>
                <ThemedText style={styles.modalText}>时间: {selectedCourse.time}</ThemedText>
                <ThemedText style={styles.modalText}>地点: {selectedCourse.location}</ThemedText>
                <ThemedText style={styles.modalText}>星期: {['一', '二', '三', '四', '五', '六', '日'][selectedCourse.weekday - 1]}</ThemedText>
                {selectedCourse.description && <ThemedText style={styles.modalText}>备注: {selectedCourse.description}</ThemedText>}
                
                <View style={styles.modalButtonContainer}>
                  <Button title="编辑" onPress={handleEditInModal} />
                  {/* 在 Web 上 Button 不支持 destructive 样式，颜色会是默认的 */}
                  <Button title="删除" onPress={handleDeleteInModal} color={Platform.OS === 'ios' ? 'red' : undefined} /> 
                  <Button title="关闭" onPress={handleCloseModal} />
                </View>
              </>
            )}
          </ThemedView>
        </View>
      </Modal>

      {/* 新增：删除确认 Modal */}
      <Modal
        animationType="fade" // 可以用 fade 或其他动画
        transparent={true}
        visible={isDeleteConfirmModalVisible}
        onRequestClose={handleCloseDeleteConfirmModal} // Android 返回按钮关闭
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={[styles.modalContent, styles.confirmModalContent]}>
            <ThemedText style={styles.modalTitle}>确认删除</ThemedText>
            <ThemedText style={styles.modalText}>确定要删除这门课程吗？此操作无法撤销。</ThemedText>
            <View style={styles.modalButtonContainer}>
              <Button title="取消" onPress={handleCloseDeleteConfirmModal} />
              {/* 确认删除按钮 */}
              <Button 
                title="确认删除" 
                onPress={handleConfirmDelete} 
                color={Platform.OS === 'ios' ? 'red' : undefined} // iOS 红色提示
              />
            </View>
          </ThemedView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 20,
  },
  courseCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  currentCourse: {
    backgroundColor: '#ff5252', // 更鲜明的红色
    borderLeftWidth: 5,
    borderLeftColor: '#d32f2f',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  courseName: {
    marginBottom: 8,
  },
  noCoursesText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
  modalOverlay: { // Modal 背景遮罩层
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 半透明黑色背景
  },
  modalContent: { // Modal 内容区域
    width: '80%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    // 使用 ThemedView 后，背景色会自动适配主题
  },
  confirmModalContent: { // 可以添加特定样式，例如宽度调整
    width: '70%', 
  },
  modalTitle: {
    marginBottom: 15,
    fontSize: 18,
  },
  modalText: {
    marginBottom: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  modalButtonContainer: { // 按钮容器
    flexDirection: 'row',
    justifyContent: 'space-around', // 让按钮均匀分布
    marginTop: 20,
    width: '100%',
  },
});