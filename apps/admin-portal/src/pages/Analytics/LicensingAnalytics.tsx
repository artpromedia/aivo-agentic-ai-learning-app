/**
 * Licensing Analytics Dashboard
 * 
 * System-wide licensing metrics and insights
 * 
 * Updated: 2025-10-23 22:29:52 UTC
 * By: aivo-ai
 */

import { useState, useEffect } from 'react';
import {
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Box,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
  useToast,
  Spinner,
  Badge,
  Progress,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Button
} from '@chakra-ui/react';
import { FiTrendingUp, FiPackage, FiUsers, FiDollarSign } from 'react-icons/fi';
import { adminLicenseApi } from '@/api/adminLicenseApi';

interface AnalyticsSummary {
  total_licenses: number;
  licenses_active: number;
  licenses_expired: number;
  total_seats: number;
  seats_used: number;
  seats_available: number;
  total_districts: number;
  total_schools: number;
  total_revenue: number;
  avg_utilization: number;
}

interface DistrictAnalytics {
  district_id: string;
  district_name: string;
  district_code: string;
  total_seats: number;
  seats_used: number;
  utilization_percent: number;
  license_count: number;
  school_count: number;
}

export function LicensingAnalyticsPage() {
  const toast = useToast();
  
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [districtAnalytics, setDistrictAnalytics] = useState<DistrictAnalytics[]>([]);
  const [timeRange, setTimeRange] = useState('all');

  useEffect(() => {
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Load analytics summary
      const summaryResponse = await adminLicenseApi.getAnalyticsSummary();
      setSummary(summaryResponse.data);

      // Mock district analytics - TODO: Add real API endpoint
      setDistrictAnalytics([]);

    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast({
        title: 'Failed to load analytics',
        description: err.response?.data?.detail || 'Please try again',
        status: 'error',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !summary) {
    return (
      <Container maxW="container.xl" py={20}>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text color="gray.600">Loading analytics...</Text>
        </VStack>
      </Container>
    );
  }

  const utilizationPercent = summary.total_seats > 0
    ? (summary.seats_used / summary.total_seats) * 100
    : 0;

  const activePercent = summary.total_licenses > 0
    ? (summary.licenses_active / summary.total_licenses) * 100
    : 0;

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <VStack align="start" spacing={1}>
            <Heading size="xl">Licensing Analytics</Heading>
            <Text color="gray.600">
              System-wide licensing performance and insights
            </Text>
          </VStack>

          <HStack>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              width="200px"
            >
              <option value="all">All Time</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </Select>

            <Button
              variant="outline"
              onClick={loadAnalytics}
            >
              Refresh
            </Button>
          </HStack>
        </HStack>

        {/* Key Metrics */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <Stat
            p={6}
            bg="white"
            borderRadius="lg"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.200"
          >
            <HStack spacing={3}>
              <Box
                p={3}
                bg="blue.100"
                borderRadius="md"
              >
                <FiPackage size={24} color="#3182CE" />
              </Box>
              <VStack align="start" spacing={0}>
                <StatLabel fontSize="sm">Total Licenses</StatLabel>
                <StatNumber fontSize="2xl">
                  {summary.total_licenses.toLocaleString()}
                </StatNumber>
                <StatHelpText mb={0}>
                  <StatArrow type="increase" />
                  {summary.licenses_active} active
                </StatHelpText>
              </VStack>
            </HStack>
          </Stat>

          <Stat
            p={6}
            bg="white"
            borderRadius="lg"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.200"
          >
            <HStack spacing={3}>
              <Box
                p={3}
                bg="green.100"
                borderRadius="md"
              >
                <FiUsers size={24} color="#38A169" />
              </Box>
              <VStack align="start" spacing={0}>
                <StatLabel fontSize="sm">Total Seats</StatLabel>
                <StatNumber fontSize="2xl">
                  {summary.total_seats.toLocaleString()}
                </StatNumber>
                <StatHelpText mb={0}>
                  {summary.seats_used.toLocaleString()} used
                </StatHelpText>
              </VStack>
            </HStack>
          </Stat>

          <Stat
            p={6}
            bg="white"
            borderRadius="lg"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.200"
          >
            <HStack spacing={3}>
              <Box
                p={3}
                bg="purple.100"
                borderRadius="md"
              >
                <FiTrendingUp size={24} color="#805AD5" />
              </Box>
              <VStack align="start" spacing={0}>
                <StatLabel fontSize="sm">Avg Utilization</StatLabel>
                <StatNumber fontSize="2xl">
                  {summary.avg_utilization.toFixed(1)}%
                </StatNumber>
                <StatHelpText mb={0}>
                  Across all districts
                </StatHelpText>
              </VStack>
            </HStack>
          </Stat>

          <Stat
            p={6}
            bg="white"
            borderRadius="lg"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.200"
          >
            <HStack spacing={3}>
              <Box
                p={3}
                bg="yellow.100"
                borderRadius="md"
              >
                <FiDollarSign size={24} color="#D69E2E" />
              </Box>
              <VStack align="start" spacing={0}>
                <StatLabel fontSize="sm">Total Revenue</StatLabel>
                <StatNumber fontSize="2xl">
                  ${summary.total_revenue.toLocaleString()}
                </StatNumber>
                <StatHelpText mb={0}>
                  {summary.total_districts} districts
                </StatHelpText>
              </VStack>
            </HStack>
          </Stat>
        </SimpleGrid>

        {/* Utilization Overview */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          <Box
            bg="white"
            p={6}
            borderRadius="lg"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.200"
          >
            <VStack align="stretch" spacing={4}>
              <HStack justify="space-between">
                <Heading size="md">Seat Utilization</Heading>
                <Badge colorScheme={utilizationPercent > 80 ? 'green' : 'yellow'} fontSize="md">
                  {utilizationPercent.toFixed(1)}%
                </Badge>
              </HStack>
              
              <Progress
                value={utilizationPercent}
                colorScheme={utilizationPercent > 80 ? 'green' : utilizationPercent > 50 ? 'yellow' : 'red'}
                size="lg"
                borderRadius="full"
              />
              
              <SimpleGrid columns={3} spacing={4} pt={2}>
                <Box>
                  <Text fontSize="xs" color="gray.600">Total</Text>
                  <Text fontSize="lg" fontWeight="bold">
                    {summary.total_seats.toLocaleString()}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="gray.600">Used</Text>
                  <Text fontSize="lg" fontWeight="bold" color="green.500">
                    {summary.seats_used.toLocaleString()}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="gray.600">Available</Text>
                  <Text fontSize="lg" fontWeight="bold" color="blue.500">
                    {summary.seats_available.toLocaleString()}
                  </Text>
                </Box>
              </SimpleGrid>
            </VStack>
          </Box>

          <Box
            bg="white"
            p={6}
            borderRadius="lg"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.200"
          >
            <VStack align="stretch" spacing={4}>
              <HStack justify="space-between">
                <Heading size="md">License Status</Heading>
                <Badge colorScheme="green" fontSize="md">
                  {activePercent.toFixed(1)}% Active
                </Badge>
              </HStack>
              
              <Progress
                value={activePercent}
                colorScheme="green"
                size="lg"
                borderRadius="full"
              />
              
              <SimpleGrid columns={3} spacing={4} pt={2}>
                <Box>
                  <Text fontSize="xs" color="gray.600">Total</Text>
                  <Text fontSize="lg" fontWeight="bold">
                    {summary.total_licenses.toLocaleString()}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="gray.600">Active</Text>
                  <Text fontSize="lg" fontWeight="bold" color="green.500">
                    {summary.licenses_active.toLocaleString()}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="gray.600">Expired</Text>
                  <Text fontSize="lg" fontWeight="bold" color="red.500">
                    {summary.licenses_expired.toLocaleString()}
                  </Text>
                </Box>
              </SimpleGrid>
            </VStack>
          </Box>
        </SimpleGrid>

        {/* District Performance Table */}
        <Box
          bg="white"
          borderRadius="lg"
          boxShadow="sm"
          border="1px solid"
          borderColor="gray.200"
          overflowX="auto"
        >
          <Box p={6} borderBottom="1px solid" borderColor="gray.200">
            <Heading size="md">District Performance</Heading>
          </Box>
          
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>District</Th>
                <Th isNumeric>Total Seats</Th>
                <Th isNumeric>Seats Used</Th>
                <Th>Utilization</Th>
                <Th isNumeric>Licenses</Th>
                <Th isNumeric>Schools</Th>
              </Tr>
            </Thead>
            <Tbody>
              {districtAnalytics.length === 0 ? (
                <Tr>
                  <Td colSpan={6} textAlign="center" py={10}>
                    <VStack spacing={2}>
                      <Text color="gray.500">No district data available</Text>
                      <Text fontSize="sm" color="gray.400">
                        District analytics will appear here once data is collected
                      </Text>
                    </VStack>
                  </Td>
                </Tr>
              ) : (
                districtAnalytics.map((district) => (
                  <Tr key={district.district_id}>
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="semibold">{district.district_name}</Text>
                        <Text fontSize="xs" color="gray.600">
                          {district.district_code}
                        </Text>
                      </VStack>
                    </Td>
                    <Td isNumeric>
                      <Text fontWeight="semibold">
                        {district.total_seats.toLocaleString()}
                      </Text>
                    </Td>
                    <Td isNumeric>
                      {district.seats_used.toLocaleString()}
                    </Td>
                    <Td>
                      <HStack>
                        <Progress
                          value={district.utilization_percent}
                          width="100px"
                          colorScheme={
                            district.utilization_percent > 80 ? 'green' :
                            district.utilization_percent > 50 ? 'yellow' : 'red'
                          }
                          borderRadius="full"
                        />
                        <Text fontSize="sm">
                          {district.utilization_percent.toFixed(1)}%
                        </Text>
                      </HStack>
                    </Td>
                    <Td isNumeric>{district.license_count}</Td>
                    <Td isNumeric>{district.school_count}</Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>
      </VStack>
    </Container>
  );
}
