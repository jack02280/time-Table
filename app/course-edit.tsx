import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface Course {
  id: string;
  name: string;
  time: string;
  location: string;
  description?: string;
  weekday: number;
}

export default function CourseEditScreen() {
  const params = useLocalSearchParams();
  const courseId = params.id as string;
  const isNewCourse = courseId === 'new';
  
  const [courseName, setCourseName] = useState(params.name as string || '');
  const [startHour, setStartHour] = useState('8');
  const [startMinute, setStartMinute] = useState('00');
  const [endHour, setEndHour] = useState('9');
  const [endMinute, setEndMinute] = useState('40');
  const [courseLocation, setCourseLocation] = useState(params.location as string || '');
  const [courseDescription, setCourseDescription] = useState(params.description as string || '');
  const [weekday, setWeekday] = useState(params.weekday as string || '1');

  // 生成小时选项
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  // 生成分钟选项
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  useEffect(() => {
    if (!isNewCourse) {
      loadCourseData();
    }
  }, []);

  const loadCourseData = async () => {
    try {
      const coursesJson = await AsyncStorage.getItem('courses');
      if (coursesJson) {
        const courses: Course[] = JSON.parse(coursesJson);
        const course = courses.find(c => c.id === courseId);
        if (course) {
          setCourseName(course.name);
          const [startTime, endTime] = course.time.split('-');
          const [startH, startM] = startTime.split(':');
          const [endH, endM] = endTime.split(':');
          setStartHour(startH);
          setStartMinute(startM);
          setEndHour(endH);
          setEndMinute(endM);
          setCourseLocation(course.location);
          setCourseDescription(course.description || '');
          setWeekday(course.weekday.toString());
        }
      }
    } catch (error) {
      Alert.alert('错误', '加载课程数据失败');
    }
  };
  
  const handleSave = async () => {
    if (!courseName.trim()) {
      Alert.alert('提示', '请输入课程名称');
      return;
    }

    if (!courseLocation.trim()) {
      Alert.alert('提示', '请输入上课地点');
      return;
    }

    const courseTime = `${startHour}:${startMinute}-${endHour}:${endMinute}`;
    const currentTimestamp = Date.now(); // 获取当前时间戳
    const newCourse: Course = {
      id: isNewCourse ? currentTimestamp.toString() : courseId, // 使用获取的时间戳
      name: courseName.trim(),
      time: courseTime,
      location: courseLocation.trim(),
      description: courseDescription.trim(),
      weekday: parseInt(weekday)
    };

    if (isNewCourse) {
      console.log('系统时间戳 (Date.now()):', currentTimestamp); // 输出时间戳
      console.log('系统时间 (Date 对象):', new Date(currentTimestamp)); // 输出 Date 对象
    }

    console.log('准备保存的课程:', newCourse); 

    try {
      // 获取现有课程
      const coursesJson = await AsyncStorage.getItem('courses');
      console.log('从 AsyncStorage 读取的原始 JSON:', coursesJson); // 添加日志
      let courses: Course[] = coursesJson ? JSON.parse(coursesJson) : [];
      console.log('解析后的现有课程数组:', courses); // 添加日志

      if (isNewCourse) {
        // 添加新课程
        courses.push(newCourse);
        console.log('添加新课程后的数组:', courses); // 添加日志
      } else {
        // 更新现有课程
        courses = courses.map(course => 
          course.id === courseId ? newCourse : course
        );
        console.log('更新现有课程后的数组:', courses); // 添加日志
      }

      // 保存课程数据
      const dataToSave = JSON.stringify(courses);
      console.log('准备写入 AsyncStorage 的 JSON:', dataToSave); // 添加日志
      await AsyncStorage.setItem('courses', dataToSave);
      console.log('AsyncStorage.setItem 调用完成'); // 添加日志

      Alert.alert('成功', '课程已保存', [
        { text: '确定', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('保存失败:', error); // 修改日志输出，打印错误对象
      Alert.alert('错误', `保存失败，请重试: ${error instanceof Error ? error.message : String(error)}`); // 显示更详细的错误信息
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      '确认删除',
      '确定要删除这门课程吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              const coursesJson = await AsyncStorage.getItem('courses');
              if (coursesJson) {
                const courses: Course[] = JSON.parse(coursesJson);
                const updatedCourses = courses.filter(course => course.id !== courseId);
                await AsyncStorage.setItem('courses', JSON.stringify(updatedCourses));
              }
              router.back();
            } catch (error) {
              Alert.alert('错误', '删除失败，请重试');
            }
          }
        }
      ]
    );
  };
  return (
    <>
      <Stack.Screen 
        options={{ 
          title: isNewCourse ? '添加新课程' : '编辑课程',
          headerRight: () => (
            <TouchableOpacity onPress={handleSave}>
              <ThemedText style={styles.saveButton}>保存</ThemedText>
            </TouchableOpacity>
          )
        }} 
      />
      
      <ScrollView style={styles.container}>
        <ThemedView style={styles.formGroup}>
          <ThemedText style={styles.label}>课程名称</ThemedText>
          <TextInput
            style={styles.input}
            value={courseName}
            onChangeText={setCourseName}
            placeholder="请输入课程名称"
          />
        </ThemedView>
        
        <ThemedView style={styles.formGroup}>
          <ThemedText style={styles.label}>上课时间</ThemedText>
          <View style={styles.timeContainer}>
            <View style={styles.timePickerContainer}>
              <Picker
                selectedValue={startHour}
                style={styles.timePicker}
                onValueChange={setStartHour}>
                {hours.map(hour => (
                  <Picker.Item key={hour} label={hour} value={hour} />
                ))}
              </Picker>
              <ThemedText>:</ThemedText>
              <Picker
                selectedValue={startMinute}
                style={styles.timePicker}
                onValueChange={setStartMinute}>
                {minutes.map(minute => (
                  <Picker.Item key={minute} label={minute} value={minute} />
                ))}
              </Picker>
            </View>
            <ThemedText>至</ThemedText>
            <View style={styles.timePickerContainer}>
              <Picker
                selectedValue={endHour}
                style={styles.timePicker}
                onValueChange={setEndHour}>
                {hours.map(hour => (
                  <Picker.Item key={hour} label={hour} value={hour} />
                ))}
              </Picker>
              <ThemedText>:</ThemedText>
              <Picker
                selectedValue={endMinute}
                style={styles.timePicker}
                onValueChange={setEndMinute}>
                {minutes.map(minute => (
                  <Picker.Item key={minute} label={minute} value={minute} />
                ))}
              </Picker>
            </View>
          </View>
        </ThemedView>
        
        <ThemedView style={styles.formGroup}>
          <ThemedText style={styles.label}>上课地点</ThemedText>
          <TextInput
            style={styles.input}
            value={courseLocation}
            onChangeText={setCourseLocation}
            placeholder="例如: 教学楼A101"
          />
        </ThemedView>
        
        <ThemedView style={styles.formGroup}>
          <ThemedText style={styles.label}>星期几</ThemedText>
          <ThemedView style={styles.weekdayContainer}>
            {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.weekdayButton,
                  parseInt(weekday) === index + 1 && styles.weekdayButtonActive
                ]}
                onPress={() => setWeekday((index + 1).toString())}
              >
                <ThemedText 
                  style={[
                    styles.weekdayText,
                    parseInt(weekday) === index + 1 && styles.weekdayTextActive
                  ]}
                >
                  {day}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>
        </ThemedView>
        
        <ThemedView style={styles.formGroup}>
          <ThemedText style={styles.label}>课程描述</ThemedText>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={courseDescription}
            onChangeText={setCourseDescription}
            placeholder="请输入课程描述"
            multiline
            numberOfLines={4}
          />
        </ThemedView>
        
        {!isNewCourse && (
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <ThemedText style={styles.deleteButtonText}>删除课程</ThemedText>
          </TouchableOpacity>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  saveButton: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  weekdayContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  weekdayButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  weekdayButtonActive: {
    backgroundColor: '#007AFF',
  },
  weekdayText: {
    fontSize: 14,
  },
  weekdayTextActive: {
    color: 'white',
  },
  deleteButton: {
    marginTop: 20,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#ffebee',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#d32f2f',
    fontWeight: 'bold',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  timePicker: {
    flex: 1,
    height: 100, // 保持之前调整的高度
    // width: 1, // 移除或注释掉这行，让 flex 控制宽度
  },
});


  


  