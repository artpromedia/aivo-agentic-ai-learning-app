/**
 * Custom Tab Bar Component
 * 
 * Grade-based bottom tab navigation with:
 * - Animated icons and labels
 * - Badge support for notifications
 * - Grade-specific styling (K5: playful, MS: cool, HS: professional)
 * - Accessible touch targets
 * - Safe area support
 */

import React, {useEffect} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Theme and responsive utilities
import {useTheme} from '../../theme/enhancedTheme';
import {useResponsive, getTouchTargetSize} from '../../utils/responsive';

/**
 * Icon mapping for tab screens
 */
const ICON_MAP: Record<string, string> = {
  Home: 'home',
  Subjects: 'book-open-variant',
  Activities: 'gamepad-variant',
  Progress: 'chart-line',
  Settings: 'cog',
};

/**
 * Tab Item Component
 */
interface TabItemProps {
  route: any;
  index: number;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  badge?: number;
}

function TabItem({
  route,
  index,
  isFocused,
  onPress,
  onLongPress,
  badge,
}: TabItemProps) {
  const {colors, themeType} = useTheme();
  const {isPhone} = useResponsive();

  // Animated values
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const iconOpacity = useSharedValue(1);

  // Get icon name
  const iconName = ICON_MAP[route.name] || 'circle';

  // Label from options or route name
  const label =
    route.params?.tabBarLabel || route.options?.tabBarLabel || route.name;

  // Animate on focus change
  useEffect(() => {
    if (isFocused) {
      scale.value = withSpring(1.1, {damping: 15, stiffness: 150});
      translateY.value = withSpring(-4, {damping: 15, stiffness: 150});
      iconOpacity.value = withTiming(1, {duration: 200});
    } else {
      scale.value = withSpring(1, {damping: 15, stiffness: 150});
      translateY.value = withSpring(0, {damping: 15, stiffness: 150});
      iconOpacity.value = withTiming(0.6, {duration: 200});
    }
  }, [isFocused]);

  // Animated styles
  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}, {translateY: translateY.value}],
  }));

  const animatedIconStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
  }));

  // Grade-based icon size
  const iconSize = themeType === 'K5' ? 28 : themeType === 'MS' ? 26 : 24;

  // Grade-based font size
  const fontSize = themeType === 'K5' ? 12 : themeType === 'MS' ? 11 : 10;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? {selected: true} : {}}
      accessibilityLabel={`${label} tab`}
      testID={`tab-${route.name}`}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabItem}
    >
      <Animated.View
        style={[styles.tabContent, animatedContainerStyle]}
      >
        <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
          <Icon
            name={iconName}
            size={iconSize}
            color={isFocused ? colors.primary : colors.textSecondary}
          />
          {badge !== undefined && badge > 0 && (
            <View
              style={[
                styles.badge,
                {backgroundColor: colors.error},
              ]}
            >
              <Text style={styles.badgeText}>
                {badge > 99 ? '99+' : badge}
              </Text>
            </View>
          )}
        </Animated.View>
        
        <Text
          style={[
            styles.label,
            {
              color: isFocused ? colors.primary : colors.textSecondary,
              fontSize,
              fontWeight: isFocused ? '600' : '400',
            },
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

/**
 * Custom Tab Bar Component
 */
export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const {colors, themeType} = useTheme();
  const insets = useSafeAreaInsets();
  const {isPhone} = useResponsive();

  // Grade-based styling
  const tabBarHeight = themeType === 'K5' ? 70 : themeType === 'MS' ? 65 : 60;
  const borderRadius = themeType === 'K5' ? 24 : themeType === 'MS' ? 16 : 12;

  // Badge counts (TODO: Get from app state store)
  const badges: Record<string, number> = {
    Home: 3, // Example: 3 notifications
    Progress: 1, // Example: 1 new achievement
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          paddingBottom: insets.bottom,
          height: tabBarHeight + insets.bottom,
          borderTopColor: colors.border,
          ...Platform.select({
            ios: {
              shadowColor: colors.shadow,
              shadowOffset: {width: 0, height: -2},
              shadowOpacity: 0.1,
              shadowRadius: 8,
            },
            android: {
              elevation: 8,
            },
          }),
        },
      ]}
    >
      <View style={[styles.tabBar, {height: tabBarHeight}]}>
        {state.routes.map((route, index) => {
          const {options} = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TabItem
              key={route.key}
              route={route}
              index={index}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
              badge={badges[route.name]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  label: {
    textAlign: 'center',
  },
});
