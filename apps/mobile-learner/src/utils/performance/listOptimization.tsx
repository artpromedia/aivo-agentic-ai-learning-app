/**
 * List Optimization Utilities
 * 
 * Provides optimized list components using FlashList for better performance
 */

import React, {memo} from 'react';
import {View, StyleSheet, ActivityIndicator} from 'react-native';
import {FlashList, ListRenderItem} from '@shopify/flash-list';

interface OptimizedListProps<T> {
  data: T[];
  renderItem: ListRenderItem<T>;
  estimatedItemSize: number;
  keyExtractor?: (item: T, index: number) => string;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;
  refreshing?: boolean;
  onRefresh?: () => void;
  horizontal?: boolean;
  showsVerticalScrollIndicator?: boolean;
  showsHorizontalScrollIndicator?: boolean;
  testID?: string;
}

/**
 * Optimized list component using FlashList
 * Much faster than FlatList for large lists
 */
export function OptimizedList<T>({
  data,
  renderItem,
  estimatedItemSize,
  keyExtractor,
  onEndReached,
  onEndReachedThreshold = 0.5,
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
  refreshing,
  onRefresh,
  horizontal = false,
  showsVerticalScrollIndicator = true,
  showsHorizontalScrollIndicator = false,
  testID,
}: OptimizedListProps<T>) {
  return (
    <FlashList
      data={data}
      renderItem={renderItem}
      estimatedItemSize={estimatedItemSize}
      keyExtractor={keyExtractor}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      ListEmptyComponent={ListEmptyComponent}
      refreshing={refreshing}
      onRefresh={onRefresh}
      horizontal={horizontal}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
      testID={testID}
    />
  );
}

/**
 * Loading footer for infinite scroll
 */
export const LoadingFooter = memo(() => (
  <View style={styles.loadingFooter}>
    <ActivityIndicator size="small" />
  </View>
));
LoadingFooter.displayName = 'LoadingFooter';

/**
 * Empty list component
 */
export const EmptyList = memo<{
  title: string;
  description?: string;
  icon?: string;
}>(({title, description, icon = '📭'}) => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyIcon}>{icon}</Text>
    <Text style={styles.emptyTitle}>{title}</Text>
    {description && <Text style={styles.emptyDescription}>{description}</Text>}
  </View>
));
EmptyList.displayName = 'EmptyList';

/**
 * List separator component
 */
export const ListSeparator = memo<{height?: number; color?: string}>(
  ({height = 1, color = '#E5E7EB'}) => (
    <View style={[styles.separator, {height, backgroundColor: color}]} />
  ),
);
ListSeparator.displayName = 'ListSeparator';

const styles = StyleSheet.create({
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  separator: {
    width: '100%',
  },
});

// Fix Text import
import {Text} from 'react-native';

export default OptimizedList;
