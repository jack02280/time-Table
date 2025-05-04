import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';

export default function SettingsScreen() {
  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => {
          router.push({
            pathname: '/course-edit',
            params: { id: 'new' }
          });
        }}
      >
        <ThemedText style={styles.addButtonText}>添加新课程</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    marginTop: 20,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    width: '80%',
  },
  addButtonText: {
    fontWeight: 'bold',
  }
});