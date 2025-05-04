import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Button, Modal, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// 课程接口
interface Course {
  id: string;
  name: string;
  time: string; // 格式 "HH:MM-HH:MM"
  location: string;
  description?: string;
  weekday: number; // 1 (周一) 到 7 (周日)
}

export default function AllCoursesScreen() {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteConfirmModalVisible, setIsDeleteConfirmModalVisible] = useState(false);
  const [courseIdToDelete, setCourseIdToDelete] = useState<string | null>(null);

  // 加载课程数据的函数
  const loadCourses = useCallback(async () => {
    try {
      const coursesJson = await AsyncStorage.getItem('courses');
      const loadedCourses = coursesJson ? JSON.parse(coursesJson) : [];
      setAllCourses(loadedCourses);
    } catch (error) {
      console.error('加载课程失败:', error);
      Alert.alert('错误', '加载课程数据失败');
    }
  }, []);

  // 使用 useFocusEffect 在屏幕获得焦点时加载课程
  useFocusEffect(
    useCallback(() => {
      loadCourses();
    }, [loadCourses])
  );

  // 处理课程点击事件
  const handleCoursePress = (course: Course) => {
    setSelectedCourse(course);
    setIsModalVisible(true);
  };

  // 关闭 Modal 的函数
  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedCourse(null);
  };

  // 处理 Modal 内编辑按钮点击
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
      handleCloseModal();
    }
  };

  // 处理 Modal 内删除按钮点击
  const handleDeleteInModal = () => {
    if (selectedCourse) {
      setCourseIdToDelete(selectedCourse.id);
      setIsDeleteConfirmModalVisible(true);
      setIsModalVisible(false);
      setSelectedCourse(null);
    }
  };

  // 关闭删除确认 Modal 的函数
  const handleCloseDeleteConfirmModal = () => {
    setIsDeleteConfirmModalVisible(false);
    setCourseIdToDelete(null);
  };

  // 处理确认删除的函数
  const handleConfirmDelete = async () => {
    if (courseIdToDelete) {
      try {
        const coursesJson = await AsyncStorage.getItem('courses');
        let courses: Course[] = coursesJson ? JSON.parse(coursesJson) : [];
        const updatedCourses = courses.filter(course => course.id !== courseIdToDelete);
        await AsyncStorage.setItem('courses', JSON.stringify(updatedCourses));
        setAllCourses(updatedCourses);
      } catch (error) {
        console.error('删除课程失败:', error);
        Alert.alert('错误', '删除失败，请重试');
      }
    }
    handleCloseDeleteConfirmModal();
  };

  // 按时间段对课程进行分组
  const organizeCoursesIntoTable = () => {
    // 创建一个7天的空数组
    const weekdayColumns: (Course[])[] = Array(7).fill(null).map(() => []);
    
    // 将课程按星期几分组
    allCourses.forEach(course => {
      const weekdayIndex = course.weekday - 1; // 转换为0-6的索引
      if (weekdayIndex >= 0 && weekdayIndex < 7) {
        weekdayColumns[weekdayIndex].push(course);
      }
    });
    
    // 对每一天的课程按时间排序
    weekdayColumns.forEach(courses => {
      courses.sort((a, b) => {
        try {
          const [aStart] = a.time.split('-');
          const [bStart] = b.time.split('-');
          const [aH, aM] = aStart.split(':').map(Number);
          const [bH, bM] = bStart.split(':').map(Number);
          return (aH * 60 + aM) - (bH * 60 + bM);
        } catch {
          return 0;
        }
      });
    });
    
    return weekdayColumns;
  };

  const weekdayColumns = organizeCoursesIntoTable();
  const weekdayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>课程表</ThemedText>
      
      <View style={styles.tableWrapper}>
        <ScrollView horizontal={true} style={styles.tableContainer} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tableContentContainer}>
          <View>
            {/* 表头 */}
            <View style={styles.headerRow}>
              {weekdayNames.map((name, index) => (
                <ThemedView key={index} style={[
                  styles.headerCell, 
                  { backgroundColor: index % 2 === 0 ? 'rgba(161, 206, 220, 0.3)' : 'rgba(161, 206, 220, 0.5)' }
                ]}>
                  <ThemedText style={styles.headerText}>{name}</ThemedText>
                </ThemedView>
              ))}
            </View>
            
            {/* 表格内容 */}
            <ScrollView style={styles.tableContent} showsVerticalScrollIndicator={false}>
              <View style={styles.tableGrid}>
                {weekdayColumns.map((courses, dayIndex) => (
                  <View key={dayIndex} style={styles.dayColumn}>
                    {courses.length === 0 ? (
                      <ThemedView style={styles.emptyCourseCell}>
                        <ThemedText style={styles.emptyText}>无课程</ThemedText>
                      </ThemedView>
                    ) : (
                      courses.map((course, courseIndex) => (
                        <TouchableOpacity
                          key={course.id}
                          onPress={() => handleCoursePress(course)}
                          style={[
                            styles.courseCell,
                            { backgroundColor: courseIndex % 2 === 0 ? 'rgba(240, 240, 240, 0.3)' : 'rgba(240, 240, 240, 0.1)' }
                          ]}
                        >
                          <ThemedText style={styles.courseName} numberOfLines={1}>
                            {course.name}
                          </ThemedText>
                          <ThemedText style={styles.courseTime}>
                            {course.time}
                          </ThemedText>
                          <ThemedText style={styles.courseLocation} numberOfLines={1}>
                            {course.location}
                          </ThemedText>
                        </TouchableOpacity>
                      ))
                    )}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </ScrollView>
      </View>

      {/* 课程详情 Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            {selectedCourse && (
              <>
                <ThemedText type="subtitle" style={styles.modalTitle}>{selectedCourse.name}</ThemedText>
                <ThemedText style={styles.modalText}>时间: {selectedCourse.time}</ThemedText>
                <ThemedText style={styles.modalText}>地点: {selectedCourse.location}</ThemedText>
                <ThemedText style={styles.modalText}>星期: {weekdayNames[selectedCourse.weekday - 1]}</ThemedText>
                {selectedCourse.description && <ThemedText style={styles.modalText}>备注: {selectedCourse.description}</ThemedText>}
                
                <View style={styles.modalButtonContainer}>
                  <Button title="编辑" onPress={handleEditInModal} />
                  <Button title="删除" onPress={handleDeleteInModal} color={Platform.OS === 'ios' ? 'red' : undefined} /> 
                  <Button title="关闭" onPress={handleCloseModal} />
                </View>
              </>
            )}
          </ThemedView>
        </View>
      </Modal>

      {/* 删除确认 Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isDeleteConfirmModalVisible}
        onRequestClose={handleCloseDeleteConfirmModal}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={[styles.modalContent, styles.confirmModalContent]}>
            <ThemedText style={styles.modalTitle}>确认删除</ThemedText>
            <ThemedText style={styles.modalText}>确定要删除这门课程吗？此操作无法撤销。</ThemedText>
            <View style={styles.modalButtonContainer}>
              <Button title="取消" onPress={handleCloseDeleteConfirmModal} />
              <Button 
                title="确认删除" 
                onPress={handleConfirmDelete} 
                color={Platform.OS === 'ios' ? 'red' : undefined}
              />
            </View>
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center', // 使容器内容居中
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
  },
  tableWrapper: {
    width: '100%',
    alignItems: 'center', // 使表格容器居中
  },
  tableContainer: {
    maxWidth: '100%', // 确保不超出屏幕
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  tableContentContainer: {
    flexGrow: 1, // 允许内容增长
    justifyContent: 'center', // 水平居中内容
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#aaa',
  },
  headerCell: {
    width: 120,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  tableContent: {
    flex: 1,
    maxHeight: 500, // 设置最大高度，避免内容过多时撑满屏幕
  },
  tableGrid: {
    flexDirection: 'row',
  },
  dayColumn: {
    width: 120,
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  courseCell: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    minHeight: 100,
  },
  emptyCourseCell: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(240, 240, 240, 0.2)',
  },
  emptyText: {
    color: '#999',
    fontStyle: 'italic',
  },
  courseName: {
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 15,
  },
  courseTime: {
    fontSize: 13,
    marginBottom: 8,
    color: '#555',
  },
  courseLocation: {
    fontSize: 13,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  confirmModalContent: {
    padding: 16,
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalText: {
    marginBottom: 10,
    fontSize: 16,
    lineHeight: 22,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
});