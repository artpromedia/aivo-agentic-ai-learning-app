/**
 * LoadingState Component
 * 
 * Skeleton loading screens with grade-themed animations
 */

import React, {useEffect, useRef} from 'react';
import {View, StyleSheet, Animated} from 'react-native';

interface LoadingStateProps {
  type?: 'card' | 'list' | 'detail';
  count?: number;
  gradeTheme?: 'K5' | 'MS' | 'HS';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  type = 'card',
  count = 3,
  gradeTheme = 'K5',
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [opacity]);

  const borderRadius = gradeTheme === 'K5' ? 16 : gradeTheme === 'MS' ? 12 : 8;

  const renderCardSkeleton = () => (
    <Animated.View
      style={[
        styles.card,
        {opacity, borderRadius},
      ]}
    >
      <View style={styles.cardContent}>
        <View style={[styles.thumbnail, {borderRadius: borderRadius - 4}]} />
        <View style={styles.cardText}>
          <View style={[styles.line, styles.lineTitle]} />
          <View style={[styles.line, styles.lineSubtitle]} />
          <View style={styles.cardFooter}>
            <View style={[styles.badge, {borderRadius: 4}]} />
            <View style={[styles.badge, {borderRadius: 4}]} />
          </View>
        </View>
      </View>
    </Animated.View>
  );

  const renderListSkeleton = () => (
    <Animated.View style={[styles.listItem, {opacity}]}>
      <View style={[styles.circle, {borderRadius: 20}]} />
      <View style={styles.listText}>
        <View style={[styles.line, styles.lineTitle]} />
        <View style={[styles.line, styles.lineSubtitle]} />
      </View>
    </Animated.View>
  );

  const renderDetailSkeleton = () => (
    <Animated.View style={[styles.detail, {opacity}]}>
      <View style={[styles.detailImage, {borderRadius}]} />
      <View style={styles.detailContent}>
        <View style={[styles.line, styles.lineTitle, {width: '60%'}]} />
        <View style={[styles.line, styles.lineSubtitle, {width: '40%'}]} />
        <View style={[styles.line, {marginTop: 16, width: '100%'}]} />
        <View style={[styles.line, {width: '90%'}]} />
        <View style={[styles.line, {width: '95%'}]} />
      </View>
    </Animated.View>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'list':
        return renderListSkeleton();
      case 'detail':
        return renderDetailSkeleton();
      default:
        return renderCardSkeleton();
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({length: count}).map((_, index) => (
        <View key={index}>{renderSkeleton()}</View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  thumbnail: {
    width: 80,
    height: 80,
    backgroundColor: '#D1D5DB',
  },
  cardText: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    marginBottom: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
  },
  circle: {
    width: 40,
    height: 40,
    backgroundColor: '#D1D5DB',
  },
  listText: {
    flex: 1,
    gap: 8,
  },
  detail: {
    backgroundColor: '#E5E7EB',
  },
  detailImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#D1D5DB',
  },
  detailContent: {
    padding: 16,
  },
  line: {
    height: 12,
    backgroundColor: '#D1D5DB',
    borderRadius: 6,
    marginBottom: 8,
  },
  lineTitle: {
    height: 16,
    width: '70%',
  },
  lineSubtitle: {
    height: 12,
    width: '50%',
  },
  badge: {
    width: 60,
    height: 24,
    backgroundColor: '#D1D5DB',
  },
});

export default LoadingState;
