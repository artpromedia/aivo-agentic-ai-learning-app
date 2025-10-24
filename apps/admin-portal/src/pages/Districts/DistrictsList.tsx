/**
 * Districts List Page
 * 
 * Operations Admin view of all district accounts
 * 
 * Updated: 2025-10-23 22:21:19 UTC
 * By: aivo-ai
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  VStack,
  HStack,
  Heading,
  Button,
  Input,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Box,
  Text,
  InputGroup,
  InputLeftElement,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Progress
} from '@chakra-ui/react';
import { 
  FiPlus, 
  FiSearch, 
  FiMoreVertical, 
  FiEye,
  FiEdit,
  FiKey,
  FiDownload,
  FiTrendingUp
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { adminLicenseApi } from '@/api/adminLicenseApi';

interface District {
  district_id: string;
  district_name: string;
  district_code: string;
  state: string;
  status: string;
  total_seats_purchased: number;
  seats_allocated: number;
  seats_activated: number;
  seats_available: number;
  utilization_percentage: number;
  contract_end_date: string;
  total_contract_value: number;
  primary_contact_name: string;
  primary_contact_email: string;
}

export function DistrictsListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const loadDistricts = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await adminLicenseApi.listDistricts({
        status: statusFilter,
        state: stateFilter,
        search: searchTerm,
        page,
        page_size: 25
      });

      setDistricts(response.data.data);
      setTotal(response.data.total);
      
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast({
        title: 'Failed to load districts',
        description: err.response?.data?.detail || 'Please try again',
        status: 'error',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, stateFilter, searchTerm, page, toast]);

  useEffect(() => {
    loadDistricts();
  }, [loadDistricts]);

  const handleCreateDistrict = () => {
    navigate('/admin/districts/create');
  };

  const handleViewDistrict = (districtId: string) => {
    navigate(`/admin/districts/${districtId}`);
  };

  const handleProvisionLicenses = (districtId: string) => {
    navigate(`/admin/districts/${districtId}/provision`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'trial':
        return 'blue';
      case 'suspended':
        return 'orange';
      case 'expired':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 80) return 'green';
    if (percentage >= 50) return 'yellow';
    return 'red';
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <VStack align="start" spacing={1}>
            <Heading size="xl">District Accounts</Heading>
            <Text color="gray.600">
              Manage district licenses and allocations
            </Text>
          </VStack>
          
          <Button
            leftIcon={<FiPlus />}
            colorScheme="blue"
            onClick={handleCreateDistrict}
          >
            Create District
          </Button>
        </HStack>

        {/* Stats Overview */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
          <Stat
            p={4}
            bg="white"
            borderRadius="lg"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.200"
          >
            <StatLabel>Total Districts</StatLabel>
            <StatNumber>{total}</StatNumber>
            <StatHelpText>All time</StatHelpText>
          </Stat>

          <Stat
            p={4}
            bg="white"
            borderRadius="lg"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.200"
          >
            <StatLabel>Active Districts</StatLabel>
            <StatNumber>
              {districts.filter(d => d.status === 'active').length}
            </StatNumber>
            <StatHelpText>
              <HStack spacing={1}>
                <FiTrendingUp />
                <Text>Currently active</Text>
              </HStack>
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
            <StatLabel>Total Seats</StatLabel>
            <StatNumber>
              {districts.reduce((sum, d) => sum + d.total_seats_purchased, 0).toLocaleString()}
            </StatNumber>
            <StatHelpText>Across all districts</StatHelpText>
          </Stat>

          <Stat
            p={4}
            bg="white"
            borderRadius="lg"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.200"
          >
            <StatLabel>Avg Utilization</StatLabel>
            <StatNumber>
              {districts.length > 0
                ? Math.round(
                    districts.reduce((sum, d) => sum + d.utilization_percentage, 0) /
                      districts.length
                  )
                : 0}%
            </StatNumber>
            <StatHelpText>Seat usage rate</StatHelpText>
          </Stat>
        </SimpleGrid>

        {/* Filters */}
        <HStack spacing={4}>
          <InputGroup maxW="400px">
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search districts..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            />
          </InputGroup>

          <Select
            placeholder="All states"
            value={stateFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStateFilter(e.target.value)}
            maxW="200px"
          >
            <option value="CA">California</option>
            <option value="TX">Texas</option>
            <option value="NY">New York</option>
            <option value="FL">Florida</option>
            {/* Add more states */}
          </Select>

          <Select
            placeholder="All statuses"
            value={statusFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
            maxW="200px"
          >
            <option value="active">Active</option>
            <option value="trial">Trial</option>
            <option value="suspended">Suspended</option>
            <option value="expired">Expired</option>
          </Select>
        </HStack>

        {/* Districts Table */}
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
                <Th>District</Th>
                <Th>State</Th>
                <Th>Status</Th>
                <Th isNumeric>Seats</Th>
                <Th>Utilization</Th>
                <Th>Contract Value</Th>
                <Th>Contact</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading ? (
                <Tr>
                  <Td colSpan={8} textAlign="center" py={10}>
                    <Text color="gray.500">Loading districts...</Text>
                  </Td>
                </Tr>
              ) : districts.length === 0 ? (
                <Tr>
                  <Td colSpan={8} textAlign="center" py={10}>
                    <Text color="gray.500">No districts found</Text>
                  </Td>
                </Tr>
              ) : (
                districts.map((district) => (
                  <Tr key={district.district_id} _hover={{ bg: 'gray.50' }}>
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="semibold">
                          {district.district_name}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {district.district_code}
                        </Text>
                      </VStack>
                    </Td>
                    
                    <Td>
                      <Badge>{district.state}</Badge>
                    </Td>
                    
                    <Td>
                      <Badge colorScheme={getStatusColor(district.status)}>
                        {district.status}
                      </Badge>
                    </Td>
                    
                    <Td isNumeric>
                      <VStack align="end" spacing={0}>
                        <Text fontWeight="semibold">
                          {district.seats_activated.toLocaleString()}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          of {district.total_seats_purchased.toLocaleString()}
                        </Text>
                      </VStack>
                    </Td>
                    
                    <Td>
                      <VStack align="start" spacing={1} minW="150px">
                        <HStack width="full" justify="space-between">
                          <Text fontSize="sm" fontWeight="semibold">
                            {district.utilization_percentage}%
                          </Text>
                        </HStack>
                        <Progress
                          value={district.utilization_percentage}
                          size="sm"
                          colorScheme={getUtilizationColor(district.utilization_percentage)}
                          width="full"
                          borderRadius="full"
                        />
                      </VStack>
                    </Td>
                    
                    <Td>
                      {district.total_contract_value ? (
                        <Text fontWeight="semibold">
                          ${district.total_contract_value.toLocaleString()}
                        </Text>
                      ) : (
                        <Text color="gray.400">—</Text>
                      )}
                    </Td>
                    
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm">{district.primary_contact_name}</Text>
                        <Text fontSize="xs" color="gray.600">
                          {district.primary_contact_email}
                        </Text>
                      </VStack>
                    </Td>
                    
                    <Td>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<FiMoreVertical />}
                          variant="ghost"
                          size="sm"
                        />
                        <MenuList>
                          <MenuItem
                            icon={<FiEye />}
                            onClick={() => handleViewDistrict(district.district_id)}
                          >
                            View Details
                          </MenuItem>
                          <MenuItem
                            icon={<FiKey />}
                            onClick={() => handleProvisionLicenses(district.district_id)}
                          >
                            Provision Licenses
                          </MenuItem>
                          <MenuItem icon={<FiEdit />}>
                            Edit District
                          </MenuItem>
                          <MenuItem icon={<FiDownload />}>
                            Export Licenses
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>

        {/* Pagination */}
        {total > 25 && (
          <HStack justify="center" spacing={2}>
            <Button
              size="sm"
              onClick={() => setPage(page - 1)}
              isDisabled={page === 1}
            >
              Previous
            </Button>
            <Text fontSize="sm">
              Page {page} of {Math.ceil(total / 25)}
            </Text>
            <Button
              size="sm"
              onClick={() => setPage(page + 1)}
              isDisabled={page >= Math.ceil(total / 25)}
            >
              Next
            </Button>
          </HStack>
        )}
      </VStack>
    </Container>
  );
}
