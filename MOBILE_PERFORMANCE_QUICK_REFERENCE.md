# Mobile Performance Optimization - Quick Reference

## 🖼️ Image Optimization

### Basic Usage
```tsx
import {OptimizedImage} from '@/utils/performance';

<OptimizedImage
  uri="https://example.com/image.jpg"
  style={{width: 200, height: 200}}
  resizeMode="cover"
/>
```

### Avatar & Thumbnails
```tsx
import {AvatarImage, ThumbnailImage} from '@/utils/performance';

<AvatarImage uri={user.avatar} size={64} />
<ThumbnailImage uri={lesson.thumbnail} width={120} aspectRatio={16/9} />
```

### Preload Images
```tsx
import {ImageCache} from '@/utils/performance';

await ImageCache.preloadMultiple([url1, url2, url3]);
ImageCache.clearAll(); // Clear cache
```

---

## 📜 List Optimization

### Optimized List
```tsx
import {OptimizedList} from '@/utils/performance';

<OptimizedList
  data={items}
  renderItem={({item}) => <ItemCard item={item} />}
  estimatedItemSize={120}
  keyExtractor={(item) => item.id}
  onEndReached={loadMore}
/>
```

### Components
```tsx
import {LoadingFooter, EmptyList, ListSeparator} from '@/utils/performance';

ListFooterComponent={<LoadingFooter />}
ListEmptyComponent={<EmptyList title="No items" />}
ItemSeparatorComponent={() => <ListSeparator />}
```

---

## 🧠 Memory Management

### Cleanup Hook
```tsx
import {useMemoryCleanup} from '@/utils/performance';

useMemoryCleanup({
  clearImageCache: true,
  onBackground: () => console.log('Backgrounded'),
});
```

### Debounce & Throttle
```tsx
import {useDebouncedValue, useThrottle, debounce, throttle} from '@/utils/performance';

// Debounce value
const debouncedSearch = useDebouncedValue(searchQuery, 300);

// Throttle callback
const handleScroll = useThrottle(onScroll, 100);

// Function debounce
const debouncedFn = debounce(expensiveOperation, 300);

// Function throttle
const throttledFn = throttle(frequentOperation, 100);
```

---

## 🔄 Lazy Loading

### Lazy Load Screen
```tsx
import {lazyLoad, lazyLoadScreen} from '@/utils/performance';

// With retry
const MyScreen = lazyLoadScreen(
  () => import('./MyScreen'),
  3 // max retries
);

// Basic lazy load
const MyComponent = lazyLoad(
  () => import('./MyComponent')
);
```

### Preload Components
```tsx
import {preloadComponents, preloadComponent} from '@/utils/performance';

// Preload on mount
useEffect(() => {
  preloadComponent(() => import('./HeavyScreen'));
}, []);

// Batch preload
await preloadComponents([
  () => import('./Screen1'),
  () => import('./Screen2'),
]);
```

---

## ⚛️ Component Optimization

### Pure Component
```tsx
import {pure} from '@/utils/performance';

const MyComponent = pure<Props>(({data}) => {
  return <View>...</View>;
});
```

### Memoization Hooks
```tsx
import {
  useExpensiveMemo,
  useStableCallback,
  usePrevious,
  useDeepMemo,
} from '@/utils/performance';

// Expensive computation
const result = useExpensiveMemo(() => {
  return complexCalculation(data);
}, [data]);

// Stable callback (never changes reference)
const handlePress = useStableCallback((id: string) => {
  navigation.navigate('Detail', {id});
});

// Previous value
const prevValue = usePrevious(currentValue);

// Deep comparison memo
const result = useDeepMemo(() => compute(obj), [obj]);
```

### Custom Comparison
```tsx
import {createShallowMemo, createDeepMemo} from '@/utils/performance';

// Shallow comparison
const ShallowComponent = createShallowMemo(MyComponent, 'MyComponent');

// Deep comparison
const DeepComponent = createDeepMemo(MyComponent, 'MyComponent');
```

---

## 📊 Performance Monitoring

### Monitor Component
```tsx
import {useComponentPerformance, useRenderPerformance} from '@/utils/performance';

const MyScreen: React.FC = () => {
  useComponentPerformance('MyScreen');
  useRenderPerformance('MyScreen');

  return <View>...</View>;
};
```

### Measure Operations
```tsx
import {measureAsync, measureSync, performanceMonitor} from '@/utils/performance';

// Async operation
const data = await measureAsync('fetchData', async () => {
  return await api.getData();
});

// Sync operation
const result = measureSync('calculation', () => {
  return expensiveCalculation();
});

// Manual timing
performanceMonitor.startTiming('operation');
// ... do work ...
performanceMonitor.endTiming('operation');
```

### Performance Reports
```tsx
import {performanceMonitor, PERFORMANCE_THRESHOLDS} from '@/utils/performance';

// Get summary
const summary = performanceMonitor.getSummary();
console.log('Total metrics:', summary.totalMetrics);
console.log('Slow operations:', summary.slowOperations);

// Get specific metrics
const navMetrics = performanceMonitor.getNavigationMetrics();
const avgDuration = performanceMonitor.getAverageDuration('screenLoad');

// Check thresholds
if (duration > PERFORMANCE_THRESHOLDS.NAVIGATION) {
  console.warn('Slow navigation detected');
}
```

### HOC Tracking
```tsx
import {withPerformanceTracking} from '@/utils/performance';

const MyScreen = withPerformanceTracking(
  MyScreenComponent,
  'MyScreen'
);
```

---

## 🎯 Common Patterns

### Search with Debounce
```tsx
const [search, setSearch] = useState('');
const debouncedSearch = useDebouncedValue(search, 300);

useEffect(() => {
  if (debouncedSearch) {
    performSearch(debouncedSearch);
  }
}, [debouncedSearch]);

<TextInput
  value={search}
  onChangeText={setSearch}
  placeholder="Search..."
/>
```

### Infinite Scroll List
```tsx
const [loading, setLoading] = useState(false);

const loadMore = async () => {
  if (loading) return;
  setLoading(true);
  await fetchMoreItems();
  setLoading(false);
};

<OptimizedList
  data={items}
  renderItem={renderItem}
  estimatedItemSize={100}
  onEndReached={loadMore}
  onEndReachedThreshold={0.5}
  ListFooterComponent={loading ? <LoadingFooter /> : null}
/>
```

### Lazy Screen with Preload
```tsx
// Define lazy screen
const DetailScreen = lazyLoadScreen(
  () => import('@/screens/DetailScreen')
);

// Preload on hover/focus
const handlePress = useCallback(() => {
  preloadComponent(() => import('@/screens/DetailScreen'));
  navigation.navigate('Detail');
}, []);

<TouchableOpacity onPress={handlePress}>
  <Text>View Details</Text>
</TouchableOpacity>
```

### Memoized List Item
```tsx
import {memo} from 'react';
import {pure} from '@/utils/performance';

const ListItem = pure<ItemProps>(({item, onPress}) => {
  return (
    <TouchableOpacity onPress={() => onPress(item.id)}>
      <OptimizedImage uri={item.image} style={styles.image} />
      <Text>{item.title}</Text>
    </TouchableOpacity>
  );
});

const MyList: React.FC = ({items}) => {
  const handlePress = useStableCallback((id: string) => {
    navigation.navigate('Detail', {id});
  });

  return (
    <OptimizedList
      data={items}
      renderItem={({item}) => (
        <ListItem item={item} onPress={handlePress} />
      )}
      estimatedItemSize={80}
    />
  );
};
```

### Performance Budget Check
```tsx
import {PERFORMANCE_THRESHOLDS, PerformanceBudget} from '@/utils/performance';

useEffect(() => {
  performanceMonitor.startTiming('screenLoad');

  return () => {
    const duration = performanceMonitor.endTiming('screenLoad');
    
    if (!PerformanceBudget.isWithinBudget(duration, PERFORMANCE_THRESHOLDS.NAVIGATION)) {
      PerformanceBudget.logViolation('Screen Load', duration, PERFORMANCE_THRESHOLDS.NAVIGATION);
    }
  };
}, []);
```

---

## 📏 Performance Thresholds

```tsx
import {PERFORMANCE_THRESHOLDS} from '@/utils/performance';

PERFORMANCE_THRESHOLDS.COLD_START      // 2000ms
PERFORMANCE_THRESHOLDS.WARM_START      // 1000ms
PERFORMANCE_THRESHOLDS.NAVIGATION      // 100ms
PERFORMANCE_THRESHOLDS.FRAME_TIME      // 16.67ms (60fps)
PERFORMANCE_THRESHOLDS.MEMORY_WARNING  // 200MB
PERFORMANCE_THRESHOLDS.BUNDLE_SIZE     // 40MB
```

---

## 🔧 Metro Config Optimization

### Production Minification
Already configured in `metro.config.js`:
- ✅ Drop console.logs
- ✅ Drop debugger statements
- ✅ Mangle variable names
- ✅ Multiple compression passes
- ✅ Remove comments

### Custom Config
```javascript
// metro.config.js
transformer: {
  minifierConfig: {
    compress: {
      drop_console: process.env.NODE_ENV === 'production',
      pure_funcs: ['console.info', 'console.debug'],
    },
  },
},
```

---

## 🧪 Testing Commands

```bash
# Check bundle size
# Android
ls -lh android/app/build/outputs/apk/release/*.apk

# iOS
ls -lh ios/build/Build/Products/Release-iphoneos/*.app

# Run in release mode
pnpm android --variant=release
pnpm ios --configuration Release

# Measure startup time (Android)
adb shell am start -W com.yourapp/com.yourapp.MainActivity

# Enable performance monitor
# Press (m) in terminal or shake device
```

---

## 📦 Installation

```bash
cd apps/mobile-learner

# Install dependencies
pnpm add react-native-fast-image @shopify/flash-list

# iOS
cd ios && pod install && cd ..

# Test
pnpm android
```

---

## ⚠️ Common Issues

### Images not loading
```tsx
// Add fallback
<OptimizedImage
  uri={url}
  fallbackSource={require('@/assets/placeholder.png')}
/>
```

### List scrolling laggy
```tsx
// Use correct item size
<OptimizedList
  estimatedItemSize={120} // Measure actual height
  data={items}
  renderItem={memo(renderItem)} // Memoize
/>
```

### Memory warning
```tsx
// Enable cleanup
useMemoryCleanup({
  clearImageCache: true,
});
```

### Slow navigation
```tsx
// Lazy load
const Screen = lazyLoadScreen(() => import('./Screen'));
```

---

## 🎯 Best Practices

1. **Images:**
   - Always use OptimizedImage for remote images
   - Preload critical images
   - Provide fallbacks

2. **Lists:**
   - Use OptimizedList (FlashList) for all lists
   - Set correct estimatedItemSize
   - Memoize list items

3. **Components:**
   - Use `pure()` for presentational components
   - Memoize expensive computations
   - Use stable callbacks

4. **Code:**
   - Lazy load heavy screens
   - Debounce search inputs
   - Throttle scroll handlers

5. **Monitoring:**
   - Track critical paths
   - Monitor navigation times
   - Check performance budgets

---

**See `MOBILE_LEARNER_PHASE7_COMPLETE.md` for full documentation!**
