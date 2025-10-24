/**
 * District Details Page
 * 
 * Comprehensive view of district licensing and usage
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
  Button,
  Box,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Progress,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  Tag,
  Alert,
  AlertIcon,
  AlertDescription
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiUsers, FiKey } from 'react-icons/fi';
import { BsBuilding } from 'react-icons/bs';
import { adminLicenseApi } from '@/api/adminLicenseApi';

interface District {
  district_id: string;
  district_name: string;
  district_code: string;
  total_seats_purchased: number;
  seats_allocated: number;
  seats_available: number;
  license_count: number;
  school_count: number;
  created_at: string;
  contract_start?: string;
  contract_end?: string;
}

interface LicensePool {
  pool_id: string;
  pool_code: string;
  pool_name: string | null;
  license_count: number;
  total_seats: number;
  seats_used: number;
  seats_available: number;
  valid_from: string;
  valid_until: string;
  status: string;
  created_at: string;
}

export function DistrictDetailsPage() {
  const { districtId } = useParams<{ districtId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [loading, setLoading] = useState(true);
  const [district, setDistrict] = useState<District | null>(null);
  const [pools, setPools] = useState<LicensePool[]>([]);

  useEffect(() => {
    if (districtId) {
      loadDistrictData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [districtId]);

  const loadDistrictData = async () => {
    try {
      setLoading(true);

      // Load district details
      const districtResponse = await adminLicenseApi.getDistrictDetails(districtId!);
      setDistrict(districtResponse.data);

      // Load license pools - temporarily set empty array
      // TODO: Add listLicensePools method to API
      setPools([]);

    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast({
        title: 'Failed to load district',
        description: err.response?.data?.detail || 'Please try again',
        status: 'error',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !district) {
    return (
      <Container maxW="container.xl" py={20}>
        <Text textAlign="center">Loading district details...</Text>
      </Container>
    );
  }

  const utilizationPercent = district.total_seats_purchased > 0
    ? (district.seats_allocated / district.total_seats_purchased) * 100
    : 0;

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <VStack align="start" spacing={1}>
            <HStack>
              <Heading size="xl">{district.district_name}</Heading>
              <Badge colorScheme="blue" fontSize="md" px={3} py={1}>
                {district.district_code}
              </Badge>
            </HStack>
            <Text color="gray.600">
              Member since {new Date(district.created_at).toLocaleDateString()}
            </Text>
          </VStack>
          
          <HStack spacing={3}>
            <Button
              leftIcon={<FiKey />}
              colorScheme="blue"
              onClick={() => navigate(`/admin/districts/${districtId}/provision`)}
            >
              Provision Licenses
            </Button>
            <Button
              leftIcon={<BsBuilding />}
              variant="outline"
              onClick={() => {
                toast({
                  title: 'Coming Soon',
                  description: 'School management feature',
                  status: 'info',
                  duration: 3000
                });
              }}
            >
              Add School
            </Button>
          </HStack>
        </HStack>

        {/* Key Stats */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
          <Stat
            p={4}
            bg="white"
            borderRadius="lg"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.200"
          >
            <StatLabel>Total Seats Purchased</StatLabel>
            <StatNumber>{district.total_seats_purchased.toLocaleString()}</StatNumber>
            <StatHelpText>Contract capacity</StatHelpText>
          </Stat>

          <Stat
            p={4}
            bg="white"
            borderRadius="lg"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.200"
          >
            <StatLabel>Seats Allocated</StatLabel>
            <StatNumber color="blue.500">
              {district.seats_allocated.toLocaleString()}
            </StatNumber>
            <StatHelpText>
              {utilizationPercent.toFixed(1)}% utilization
            </StatHelpText>
          </Stat>

          <Stat
            p={4}
            bg="white"
            borderRadius="lg"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.200"
          >
            <StatLabel>Seats Available</StatLabel>
            <StatNumber color={district.seats_available > 0 ? 'green.500' : 'red.500'}>
              {district.seats_available.toLocaleString()}
            </StatNumber>
            <StatHelpText>Ready to assign</StatHelpText>
          </Stat>

          <Stat
            p={4}
            bg="white"
            borderRadius="lg"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.200"
          >
            <StatLabel>License Pools</StatLabel>
            <StatNumber>{district.license_count}</StatNumber>
            <StatHelpText>Active codes</StatHelpText>
          </Stat>
        </SimpleGrid>

        {/* Utilization Progress */}
        <Box
          p={4}
          bg="white"
          borderRadius="lg"
          boxShadow="sm"
          border="1px solid"
          borderColor="gray.200"
        >
          <VStack align="stretch" spacing={3}>
            <HStack justify="space-between">
              <Text fontWeight="semibold">Seat Utilization</Text>
              <Text fontSize="sm" color="gray.600">
                {district.seats_allocated.toLocaleString()} / {district.total_seats_purchased.toLocaleString()} seats
              </Text>
            </HStack>
            <Progress
              value={utilizationPercent}
              colorScheme={utilizationPercent > 90 ? 'red' : utilizationPercent > 70 ? 'yellow' : 'green'}
              size="lg"
              borderRadius="full"
            />
            <HStack justify="space-between" fontSize="sm" color="gray.600">
              <Text>0%</Text>
              <Text fontWeight="semibold">{utilizationPercent.toFixed(1)}%</Text>
              <Text>100%</Text>
            </HStack>
          </VStack>
        </Box>

        {/* Low availability warning */}
        {district.seats_available < 1000 && (
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            <AlertDescription>
              Low seat availability: Only {district.seats_available} seats remaining.
              Consider increasing the contract or reviewing allocation.
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs */}
        <Tabs colorScheme="blue">
          <TabList>
            <Tab>
              <HStack>
                <FiKey />
                <Text>License Pools ({pools.length})</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack>
                <BsBuilding />
                <Text>Schools ({district.school_count})</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack>
                <FiUsers />
                <Text>Usage Analytics</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* License Pools Tab */}
            <TabPanel px={0}>
              <Box
                bg="white"
                borderRadius="lg"
                boxShadow="sm"
                border="1px solid"
                borderColor="gray.200"
                overflowX="auto"
              >
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Pool Code</Th>
                      <Th>Pool Name</Th>
                      <Th isNumeric>Licenses</Th>
                      <Th>Seat Usage</Th>
                      <Th>Valid Period</Th>
                      <Th>Status</Th>
                      <Th>Created</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {pools.length === 0 ? (
                      <Tr>
                        <Td colSpan={7} textAlign="center" py={10}>
                          <VStack spacing={3}>
                            <FiKey size={40} color="gray" />
                            <Text color="gray.500">No license pools yet</Text>
                            <Button
                              size="sm"
                              colorScheme="blue"
                              onClick={() => navigate(`/admin/districts/${districtId}/provision`)}
                            >
                              Provision First Pool
                            </Button>
                          </VStack>
                        </Td>
                      </Tr>
                    ) : (
                      pools.map((pool) => {
                        const usagePercent = pool.total_seats > 0
                          ? (pool.seats_used / pool.total_seats) * 100
                          : 0;

                        return (
                          <Tr key={pool.pool_id}>
                            <Td>
                              <Tag colorScheme="blue" fontFamily="monospace">
                                {pool.pool_code}
                              </Tag>
                            </Td>
                            
                            <Td>
                              <Text fontSize="sm">
                                {pool.pool_name || '—'}
                              </Text>
                            </Td>
                            
                            <Td isNumeric>
                              <Text fontWeight="semibold">
                                {pool.license_count}
                              </Text>
                            </Td>
                            
                            <Td>
                              <VStack align="start" spacing={1}>
                                <HStack>
                                  <Text fontSize="sm" fontWeight="semibold">
                                    {pool.seats_used}
                                  </Text>
                                  <Text fontSize="xs" color="gray.600">
                                    / {pool.total_seats}
                                  </Text>
                                </HStack>
                                <Progress
                                  value={usagePercent}
                                  size="sm"
                                  colorScheme={usagePercent > 90 ? 'red' : 'blue'}
                                  width="100px"
                                  borderRadius="full"
                                />
                              </VStack>
                            </Td>
                            
                            <Td>
                              <VStack align="start" spacing={0}>
                                <Text fontSize="sm">
                                  {new Date(pool.valid_from).toLocaleDateString()}
                                </Text>
                                <Text fontSize="xs" color="gray.600">
                                  to {new Date(pool.valid_until).toLocaleDateString()}
                                </Text>
                              </VStack>
                            </Td>
                            
                            <Td>
                              <Badge
                                colorScheme={
                                  pool.status === 'active' ? 'green' :
                                  pool.status === 'depleted' ? 'gray' :
                                  pool.status === 'expired' ? 'red' : 'yellow'
                                }
                              >
                                {pool.status}
                              </Badge>
                            </Td>
                            
                            <Td>
                              <Text fontSize="sm" color="gray.600">
                                {new Date(pool.created_at).toLocaleDateString()}
                              </Text>
                            </Td>
                          </Tr>
                        );
                      })
                    )}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>

            {/* Schools Tab */}
            <TabPanel px={0}>
              <Box
                bg="white"
                borderRadius="lg"
                boxShadow="sm"
                border="1px solid"
                borderColor="gray.200"
                p={10}
              >
                <VStack spacing={3}>
                  <BsBuilding size={50} color="gray" />
                  <Heading size="md" color="gray.500">
                    School Management
                  </Heading>
                  <Text color="gray.600" textAlign="center">
                    School listing and management features coming soon.
                    This will include school registration, teacher assignments, and usage tracking.
                  </Text>
                  <Button
                    colorScheme="blue"
                    variant="outline"
                    mt={4}
                    onClick={() => {
                      toast({
                        title: 'Coming Soon',
                        description: 'School management will be available in the next release',
                        status: 'info',
                        duration: 3000
                      });
                    }}
                  >
                    Learn More
                  </Button>
                </VStack>
              </Box>
            </TabPanel>

            {/* Usage Analytics Tab */}
            <TabPanel px={0}>
              <Box
                bg="white"
                borderRadius="lg"
                boxShadow="sm"
                border="1px solid"
                borderColor="gray.200"
                p={10}
              >
                <VStack spacing={3}>
                  <FiUsers size={50} color="gray" />
                  <Heading size="md" color="gray.500">
                    Usage Analytics
                  </Heading>
                  <Text color="gray.600" textAlign="center">
                    Detailed usage analytics, teacher activity, student engagement metrics,
                    and ROI tracking will be available here.
                  </Text>
                  <Button
                    colorScheme="blue"
                    variant="outline"
                    mt={4}
                    onClick={() => navigate('/admin/analytics')}
                  >
                    View System Analytics
                  </Button>
                </VStack>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Container>
  );
}
