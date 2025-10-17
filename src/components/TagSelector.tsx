import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../constants';

interface Task {
  id: string;
  name: string;
  icon: string;
}

interface TagSelectorProps {
  tasks: Task[];
  selectedTasks: string[];
  onTaskToggle: (taskId: string) => void;
  onAddCustomTask: () => void;
  title: string;
  description: string;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  tasks,
  selectedTasks,
  onTaskToggle,
  onAddCustomTask,
  title,
  description,
}) => {
  const selectedTaskObjects = tasks.filter(task => selectedTasks.includes(task.id));
  const unselectedTaskObjects = tasks.filter(task => !selectedTasks.includes(task.id));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      
      {/* Pool Area - Selected Tasks */}
      <View style={styles.poolArea}>
        <Text style={styles.areaLabel}>Selected ({selectedTaskObjects.length})</Text>
        <View style={styles.poolBox}>
          {selectedTaskObjects.length > 0 ? (
            <View style={styles.poolContent}>
              {selectedTaskObjects.map((task) => (
                <TouchableOpacity
                  key={task.id}
                  style={styles.taskTag}
                  onPress={() => onTaskToggle(task.id)}
                >
                  {task.icon && <Text style={styles.taskIcon}>{task.icon}</Text>}
                  <Text style={styles.taskName}>{task.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No tasks selected</Text>
            </View>
          )}
        </View>
      </View>

      {/* Bench Area - Unselected Tasks */}
      <View style={styles.benchArea}>
        <Text style={styles.areaLabel}>Available ({unselectedTaskObjects.length})</Text>
        <View style={styles.benchContent}>
          {unselectedTaskObjects.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={styles.taskTag}
              onPress={() => onTaskToggle(task.id)}
            >
              {task.icon && <Text style={styles.taskIcon}>{task.icon}</Text>}
              <Text style={styles.taskName}>{task.name}</Text>
            </TouchableOpacity>
          ))}
          {/* Add Custom Task Button */}
          <TouchableOpacity
            style={styles.taskTag}
            onPress={onAddCustomTask}
          >
            <Text style={styles.addTaskText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: SPACING.md,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  description: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  poolArea: {
    marginBottom: SPACING.lg,
  },
  benchArea: {
    marginTop: SPACING.md,
  },
  areaLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  poolBox: {
    backgroundColor: COLORS.border,
    borderRadius: 12,
    padding: SPACING.md,
    minHeight: 94,
    minWidth: '100%',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'solid',
  },
  poolContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  benchContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  taskTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 4,
    backgroundColor: COLORS.surface,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
    shadowRadius: 3,
    elevation: 3,
  },
  taskIcon: {
    fontSize: 14,
    marginRight: SPACING.xs,
  },
  taskName: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    fontWeight: '500',
    fontSize: 12,
  },
  emptyState: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  emptyStateText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  addTaskText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 16,
  },
});

export default TagSelector;
