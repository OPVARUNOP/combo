import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';

// Theme
import { colors, spacing, typography, radius } from '../../styles/theme';

// Redux
import { addRecentActivity } from '../../store/slices/personalizationSlice';

const { width } = Dimensions.get('window');

const ArtistAnalyticsScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d'); // '7d', '30d', '90d', '1y'

  // Mock analytics data - replace with real API calls
  const [analytics, setAnalytics] = useState({
    overview: {
      totalStreams: 1250000,
      totalListeners: 45000,
      totalRevenue: 8750,
      growth: 12.5,
      period: '30d',
    },
    streams: {
      daily: [
        { date: '2024-01-01', streams: 1200, listeners: 450 },
        { date: '2024-01-02', streams: 1350, listeners: 480 },
        { date: '2024-01-03', streams: 1100, listeners: 420 },
        { date: '2024-01-04', streams: 1400, listeners: 520 },
        { date: '2024-01-05', streams: 1600, listeners: 580 },
      ],
      topTracks: [
        { title: 'Hit Single', streams: 50000, change: 15.2 },
        { title: 'Popular Track', streams: 35000, change: -2.1 },
        { title: 'New Release', streams: 25000, change: 45.8 },
      ],
      topCountries: [
        { country: 'United States', streams: 450000, percentage: 36 },
        { country: 'United Kingdom', streams: 225000, percentage: 18 },
        { country: 'Canada', streams: 150000, percentage: 12 },
      ],
    },
    listeners: {
      demographics: {
        age: { '18-24': 35, '25-34': 45, '35-44': 15, '45+': 5 },
        gender: { male: 55, female: 40, other: 5 },
        topCities: ['Los Angeles', 'New York', 'London', 'Toronto'],
      },
      retention: {
        daily: 65,
        weekly: 78,
        monthly: 45,
      },
    },
    revenue: {
      total: 8750,
      breakdown: {
        streaming: 6500,
        downloads: 1250,
        merchandise: 1000,
      },
      trend: [1200, 1350, 1100, 1400, 1600, 1800],
    },
  });

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with real data fetching
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Track analytics view
      dispatch(
        addRecentActivity({
          type: 'analytics_view',
          timeRange,
          timestamp: new Date().toISOString(),
        }),
      );
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name='arrow-back' size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Analytics</Text>
      <View style={styles.headerRight} />
    </View>
  );

  const renderTimeRangeSelector = () => (
    <View style={styles.timeRangeContainer}>
      {[
        { key: '7d', label: '7 Days' },
        { key: '30d', label: '30 Days' },
        { key: '90d', label: '90 Days' },
        { key: '1y', label: '1 Year' },
      ].map((range) => (
        <TouchableOpacity
          key={range.key}
          style={[styles.timeRangeButton, timeRange === range.key && styles.timeRangeButtonActive]}
          onPress={() => setTimeRange(range.key)}
        >
          <Text
            style={[styles.timeRangeText, timeRange === range.key && styles.timeRangeTextActive]}
          >
            {range.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderOverviewCards = () => (
    <View style={styles.overviewContainer}>
      <View style={styles.overviewCard}>
        <Ionicons name='musical-notes' size={24} color={colors.primary} />
        <Text style={styles.overviewNumber}>{formatNumber(analytics.overview.totalStreams)}</Text>
        <Text style={styles.overviewLabel}>Total Streams</Text>
        <View style={styles.growthIndicator}>
          <Ionicons name='trending-up' size={16} color={colors.success} />
          <Text style={styles.growthText}>+{analytics.overview.growth}%</Text>
        </View>
      </View>

      <View style={styles.overviewCard}>
        <Ionicons name='people' size={24} color={colors.primary} />
        <Text style={styles.overviewNumber}>{formatNumber(analytics.overview.totalListeners)}</Text>
        <Text style={styles.overviewLabel}>Listeners</Text>
        <View style={styles.growthIndicator}>
          <Ionicons name='trending-up' size={16} color={colors.success} />
          <Text style={styles.growthText}>+8.2%</Text>
        </View>
      </View>

      <View style={styles.overviewCard}>
        <Ionicons name='card' size={24} color={colors.primary} />
        <Text style={styles.overviewNumber}>{formatCurrency(analytics.overview.totalRevenue)}</Text>
        <Text style={styles.overviewLabel}>Revenue</Text>
        <View style={styles.growthIndicator}>
          <Ionicons name='trending-up' size={16} color={colors.success} />
          <Text style={styles.growthText}>+15.7%</Text>
        </View>
      </View>
    </View>
  );

  const renderStreamsChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Daily Streams</Text>
      <View style={styles.chart}>
        {analytics.streams.daily.map((day, index) => (
          <View key={index} style={styles.chartBar}>
            <View style={styles.chartBarFill}>
              <Text style={styles.chartValue}>{formatNumber(day.streams)}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderTopTracks = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Top Performing Tracks</Text>
      {analytics.streams.topTracks.map((track, index) => (
        <View key={index} style={styles.trackItem}>
          <View style={styles.trackInfo}>
            <Text style={styles.trackTitle}>{track.title}</Text>
            <Text style={styles.trackStreams}>{formatNumber(track.streams)} streams</Text>
          </View>
          <View style={styles.trackChange}>
            <Ionicons
              name={track.change >= 0 ? 'trending-up' : 'trending-down'}
              size={16}
              color={track.change >= 0 ? colors.success : colors.error}
            />
            <Text
              style={[
                styles.trackChangeText,
                { color: track.change >= 0 ? colors.success : colors.error },
              ]}
            >
              {track.change >= 0 ? '+' : ''}
              {track.change}%
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderDemographics = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Audience Demographics</Text>

      <View style={styles.demographicsContainer}>
        <View style={styles.demographicsGroup}>
          <Text style={styles.demographicsTitle}>Age Groups</Text>
          {Object.entries(analytics.listeners.demographics.age).map(([age, percentage]) => (
            <View key={age} style={styles.demographicsItem}>
              <Text style={styles.demographicsLabel}>{age}</Text>
              <View style={styles.demographicsBar}>
                <View style={[styles.demographicsFill, { width: `${percentage}%` }]} />
              </View>
              <Text style={styles.demographicsValue}>{percentage}%</Text>
            </View>
          ))}
        </View>

        <View style={styles.demographicsGroup}>
          <Text style={styles.demographicsTitle}>Gender</Text>
          {Object.entries(analytics.listeners.demographics.gender).map(([gender, percentage]) => (
            <View key={gender} style={styles.demographicsItem}>
              <Text style={styles.demographicsLabel}>
                {gender.charAt(0).toUpperCase() + gender.slice(1)}
              </Text>
              <View style={styles.demographicsBar}>
                <View style={[styles.demographicsFill, { width: `${percentage}%` }]} />
              </View>
              <Text style={styles.demographicsValue}>{percentage}%</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderRevenueBreakdown = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Revenue Breakdown</Text>

      <View style={styles.revenueContainer}>
        {Object.entries(analytics.revenue.breakdown).map(([source, amount]) => (
          <View key={source} style={styles.revenueItem}>
            <View style={styles.revenueInfo}>
              <Text style={styles.revenueSource}>
                {source.charAt(0).toUpperCase() + source.slice(1)}
              </Text>
              <Text style={styles.revenueAmount}>{formatCurrency(amount)}</Text>
            </View>
            <View style={styles.revenueBar}>
              <View
                style={[
                  styles.revenueFill,
                  { width: `${(amount / analytics.revenue.total) * 100}%` },
                ]}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {renderHeader()}
      {renderTimeRangeSelector()}
      {renderOverviewCards()}
      {renderStreamsChart()}
      {renderTopTracks()}
      {renderDemographics()}
      {renderRevenueBreakdown()}

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  bottomSpacing: {
    height: 100,
  },
  chart: {
    alignItems: 'flex-end',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    flexDirection: 'row',
    height: 120,
    padding: spacing.md,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  chartBarFill: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    minHeight: 10,
    width: 20,
  },
  chartContainer: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  chartTitle: {
    color: colors.text,
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    marginBottom: spacing.lg,
  },
  chartValue: {
    color: colors.text,
    fontSize: typography.fontSize.xs,
    marginBottom: spacing.xs,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  demographicsBar: {
    backgroundColor: colors.elevated,
    borderRadius: radius.sm,
    flex: 1,
    height: 8,
    marginHorizontal: spacing.sm,
  },
  demographicsContainer: {
    gap: spacing.xl,
  },
  demographicsFill: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    height: '100%',
  },
  demographicsGroup: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  demographicsItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  demographicsLabel: {
    color: colors.text,
    fontSize: typography.fontSize.sm,
    width: 60,
  },
  demographicsTitle: {
    color: colors.text,
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  demographicsValue: {
    color: colors.text,
    fontSize: typography.fontSize.sm,
    textAlign: 'right',
    width: 30,
  },
  growthIndicator: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  growthText: {
    color: colors.success,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? spacing['3xl'] : spacing.xl,
  },
  headerRight: {
    width: 24,
  },
  headerTitle: {
    color: colors.text,
    fontSize: typography.fontSize['2xl'],
    fontWeight: '700',
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.base,
  },
  overviewCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    flex: 1,
    marginHorizontal: spacing.xs,
    padding: spacing.lg,
  },
  overviewContainer: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  overviewLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  overviewNumber: {
    color: colors.text,
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    marginVertical: spacing.sm,
  },
  revenueAmount: {
    color: colors.primary,
    fontSize: typography.fontSize.base,
    fontWeight: '700',
  },
  revenueBar: {
    backgroundColor: colors.elevated,
    borderRadius: radius.sm,
    height: 8,
  },
  revenueContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  revenueFill: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    height: '100%',
  },
  revenueInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  revenueItem: {
    marginBottom: spacing.lg,
  },
  revenueSource: {
    color: colors.text,
    fontSize: typography.fontSize.base,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  timeRangeButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    flex: 1,
    marginHorizontal: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
  },
  timeRangeButtonActive: {
    backgroundColor: colors.primary,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  timeRangeText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
  },
  timeRangeTextActive: {
    color: colors.text,
  },
  trackChange: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  trackChangeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  trackInfo: {
    flex: 1,
  },
  trackItem: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  trackStreams: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },
  trackTitle: {
    color: colors.text,
    fontSize: typography.fontSize.base,
    fontWeight: '600',
  },
});

export default ArtistAnalyticsScreen;
