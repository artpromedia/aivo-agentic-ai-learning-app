/**
 * License Vault Dashboard
 * 
 * Operations Admin manages central license inventory
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
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Text,
  Box,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  useToast,
  Progress,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Textarea
} from '@chakra-ui/react';
import { FiPlus, FiPackage } from 'react-icons/fi';
import { useForm, Controller } from 'react-hook-form';
import { adminLicenseApi } from '@/api/adminLicenseApi';

interface VaultEntry {
  vault_entry_id: string;
  license_type: string;
  quantity: number;
  quantity_remaining: number;
  quantity_allocated: number;
  valid_from: string;
  valid_until: string;
  status: string;
  created_reason: string;
  cost_per_license: number;
  total_cost: number;
  created_at: string;
}

interface CreateVaultForm {
  license_type: string;
  quantity: number;
  valid_from: string;
  valid_until: string;
  created_reason: string;
  cost_per_license?: number;
  notes?: string;
}

export function VaultDashboardPage() {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm<CreateVaultForm>();

  const quantity = watch('quantity');
  const costPerLicense = watch('cost_per_license');
  const totalCost = (quantity || 0) * (costPerLicense || 0);

  useEffect(() => {
    loadVaultEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadVaultEntries = async () => {
    try {
      setLoading(true);
      
      const response = await adminLicenseApi.listVaultEntries({
        page: 1,
        page_size: 100
      });

      setEntries(response.data.data);
      
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast({
        title: 'Failed to load vault',
        description: err.response?.data?.detail || 'Please try again',
        status: 'error',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CreateVaultForm) => {
    setSubmitting(true);

    try {
      await adminLicenseApi.createVaultEntry({
        license_type: data.license_type,
        quantity: data.quantity,
        valid_from: new Date(data.valid_from).toISOString(),
        valid_until: new Date(data.valid_until).toISOString(),
        created_reason: data.created_reason,
        cost_per_license: data.cost_per_license,
        notes: data.notes
      });

      toast({
        title: 'Vault entry created!',
        description: `Added ${data.quantity} ${data.license_type} licenses to vault.`,
        status: 'success',
        duration: 5000
      });

      reset();
      onClose();
      loadVaultEntries();
      
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast({
        title: 'Failed to create entry',
        description: err.response?.data?.detail || 'Please try again',
        status: 'error',
        duration: 5000
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate totals
  const totalLicenses = entries.reduce((sum, e) => sum + e.quantity, 0);
  const totalRemaining = entries.reduce((sum, e) => sum + e.quantity_remaining, 0);
  const totalAllocated = entries.reduce((sum, e) => sum + e.quantity_allocated, 0);
  const totalValue = entries.reduce((sum, e) => sum + (e.total_cost || 0), 0);

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <VStack align="start" spacing={1}>
            <Heading size="xl">License Vault</Heading>
            <Text color="gray.600">
              Central inventory of available licenses
            </Text>
          </VStack>
          
          <Button
            leftIcon={<FiPlus />}
            colorScheme="blue"
            onClick={onOpen}
          >
            Add to Vault
          </Button>
        </HStack>

        {/* Stats */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
          <Stat
            p={4}
            bg="white"
            borderRadius="lg"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.200"
          >
            <StatLabel>Total Licenses</StatLabel>
            <StatNumber>{totalLicenses.toLocaleString()}</StatNumber>
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
            <StatLabel>Available</StatLabel>
            <StatNumber color="green.500">
              {totalRemaining.toLocaleString()}
            </StatNumber>
            <StatHelpText>Ready to provision</StatHelpText>
          </Stat>

          <Stat
            p={4}
            bg="white"
            borderRadius="lg"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.200"
          >
            <StatLabel>Allocated</StatLabel>
            <StatNumber color="blue.500">
              {totalAllocated.toLocaleString()}
            </StatNumber>
            <StatHelpText>In use</StatHelpText>
          </Stat>

          <Stat
            p={4}
            bg="white"
            borderRadius="lg"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.200"
          >
            <StatLabel>Total Value</StatLabel>
            <StatNumber>
              ${totalValue.toLocaleString()}
            </StatNumber>
            <StatHelpText>Investment</StatHelpText>
          </Stat>
        </SimpleGrid>

        {/* Vault Entries Table */}
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
                <Th>Type</Th>
                <Th>Reason</Th>
                <Th isNumeric>Quantity</Th>
                <Th>Available</Th>
                <Th>Valid Period</Th>
                <Th isNumeric>Cost</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading ? (
                <Tr>
                  <Td colSpan={7} textAlign="center" py={10}>
                    <Text color="gray.500">Loading vault...</Text>
                  </Td>
                </Tr>
              ) : entries.length === 0 ? (
                <Tr>
                  <Td colSpan={7} textAlign="center" py={10}>
                    <VStack spacing={2}>
                      <FiPackage size={40} color="gray" />
                      <Text color="gray.500">Vault is empty</Text>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        onClick={onOpen}
                      >
                        Add Licenses
                      </Button>
                    </VStack>
                  </Td>
                </Tr>
              ) : (
                entries.map((entry) => (
                  <Tr key={entry.vault_entry_id}>
                    <Td>
                      <Badge colorScheme="purple">
                        {entry.license_type}
                      </Badge>
                    </Td>
                    
                    <Td>
                      <Text fontSize="sm">{entry.created_reason}</Text>
                    </Td>
                    
                    <Td isNumeric>
                      <Text fontWeight="semibold">
                        {entry.quantity.toLocaleString()}
                      </Text>
                    </Td>
                    
                    <Td>
                      <VStack align="start" spacing={1}>
                        <HStack>
                          <Text fontSize="sm" fontWeight="semibold">
                            {entry.quantity_remaining.toLocaleString()}
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            / {entry.quantity.toLocaleString()}
                          </Text>
                        </HStack>
                        <Progress
                          value={(entry.quantity_remaining / entry.quantity) * 100}
                          size="sm"
                          colorScheme="green"
                          width="100px"
                          borderRadius="full"
                        />
                      </VStack>
                    </Td>
                    
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm">
                          {new Date(entry.valid_from).toLocaleDateString()}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          to {new Date(entry.valid_until).toLocaleDateString()}
                        </Text>
                      </VStack>
                    </Td>
                    
                    <Td isNumeric>
                      {entry.total_cost ? (
                        <VStack align="end" spacing={0}>
                          <Text fontWeight="semibold">
                            ${entry.total_cost.toLocaleString()}
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            ${entry.cost_per_license}/license
                          </Text>
                        </VStack>
                      ) : (
                        <Text color="gray.400">—</Text>
                      )}
                    </Td>
                    
                    <Td>
                      <Badge
                        colorScheme={
                          entry.quantity_remaining > 0 ? 'green' : 'gray'
                        }
                      >
                        {entry.quantity_remaining > 0 ? 'Available' : 'Depleted'}
                      </Badge>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>
      </VStack>

      {/* Add to Vault Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>Add Licenses to Vault</ModalHeader>
          
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired isInvalid={!!errors.license_type}>
                <FormLabel>License Type</FormLabel>
                <Select
                  placeholder="Select type"
                  {...register('license_type', {
                    required: 'License type is required'
                  })}
                >
                  <option value="district">District</option>
                  <option value="school">School</option>
                  <option value="individual">Individual</option>
                  <option value="trial">Trial</option>
                  <option value="enterprise">Enterprise</option>
                </Select>
              </FormControl>

              <FormControl isRequired isInvalid={!!errors.quantity}>
                <FormLabel>Quantity</FormLabel>
                <Controller
                  name="quantity"
                  control={control}
                  rules={{ required: 'Quantity is required', min: 1 }}
                  render={({ field }) => (
                    <NumberInput
                      {...field}
                      min={1}
                      step={100}
                      onChange={(valueString) => field.onChange(parseInt(valueString))}
                    >
                      <NumberInputField placeholder="1000" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  )}
                />
              </FormControl>

              <HStack width="full" spacing={4}>
                <FormControl isRequired isInvalid={!!errors.valid_from}>
                  <FormLabel>Valid From</FormLabel>
                  <Input
                    type="date"
                    {...register('valid_from', {
                      required: 'Start date is required'
                    })}
                  />
                </FormControl>

                <FormControl isRequired isInvalid={!!errors.valid_until}>
                  <FormLabel>Valid Until</FormLabel>
                  <Input
                    type="date"
                    {...register('valid_until', {
                      required: 'End date is required'
                    })}
                  />
                </FormControl>
              </HStack>

              <FormControl isRequired isInvalid={!!errors.created_reason}>
                <FormLabel>Reason</FormLabel>
                <Input
                  placeholder="Q1 2025 Bulk Purchase"
                  {...register('created_reason', {
                    required: 'Reason is required'
                  })}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Cost Per License</FormLabel>
                <Controller
                  name="cost_per_license"
                  control={control}
                  render={({ field }) => (
                    <NumberInput
                      {...field}
                      min={0}
                      step={5}
                      precision={2}
                      onChange={(valueString) => field.onChange(parseFloat(valueString))}
                    >
                      <NumberInputField placeholder="50.00" />
                    </NumberInput>
                  )}
                />
                {totalCost > 0 && (
                  <Text fontSize="sm" color="gray.600" mt={1}>
                    Total Cost: <strong>${totalCost.toLocaleString()}</strong>
                  </Text>
                )}
              </FormControl>

              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  placeholder="Additional notes..."
                  rows={3}
                  {...register('notes')}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              
              <Button
                type="submit"
                colorScheme="blue"
                isLoading={submitting}
              >
                Add to Vault
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}
