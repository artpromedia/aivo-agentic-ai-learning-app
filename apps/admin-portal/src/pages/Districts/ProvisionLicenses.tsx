/**
 * Provision Licenses Page
 * 
 * Bulk license provisioning wizard for districts
 * 
 * Updated: 2025-10-23 22:21:19 UTC
 * By: aivo-ai
 */

import React, { useState } from 'react';
import {
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Box,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Input,
  useToast,
  Alert,
  AlertIcon,
  AlertDescription,
  Code,
  Divider,
  Tag,
  Wrap,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminLicenseApi } from '@/api/adminLicenseApi';
import { FiKey, FiDownload, FiCopy } from 'react-icons/fi';
import { ProvisionResult } from '@/types/api';

export function ProvisionLicensesPage() {
  const { districtId } = useParams<{ districtId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState<number>(100);
  const [seatsPerLicense, setSeatsPerLicense] = useState<number>(30);
  const [poolName, setPoolName] = useState<string>('');
  const [vaultEntryId, setVaultEntryId] = useState<string>('');
  const [licenseCodes, setLicenseCodes] = useState<string[]>([]);
  const [provisionResult, setProvisionResult] = useState<ProvisionResult | null>(null);

  const totalSeats = quantity * seatsPerLicense;

  const handleProvision = async () => {
    if (!districtId) return;

    setLoading(true);

    try {
      const response = await adminLicenseApi.provisionLicenses(districtId, {
        quantity,
        seats_per_license: seatsPerLicense,
        pool_name: poolName || undefined,
        vault_entry_id: vaultEntryId || undefined
      });

      setProvisionResult(response.data);
      setLicenseCodes(response.data.license_codes || []);

      toast({
        title: 'Licenses provisioned!',
        description: `${quantity} licenses with ${totalSeats} total seats created.`,
        status: 'success',
        duration: 5000
      });

      onOpen(); // Show success modal with codes
      
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast({
        title: 'Provisioning failed',
        description: err.response?.data?.detail || 'Please try again',
        status: 'error',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Copied!',
      description: `License code ${code} copied to clipboard`,
      status: 'success',
      duration: 2000
    });
  };

  const handleCopyAll = () => {
    const allCodes = licenseCodes.join('\n');
    navigator.clipboard.writeText(allCodes);
    toast({
      title: 'All codes copied!',
      description: `${licenseCodes.length} license codes copied to clipboard`,
      status: 'success',
      duration: 2000
    });
  };

  const handleExportCSV = () => {
    const csv = licenseCodes.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `licenses-${poolName || 'bulk'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <VStack align="start" spacing={2}>
          <Heading size="xl">Provision Licenses</Heading>
          <Text color="gray.600">
            Create bulk license codes for district distribution
          </Text>
        </VStack>

        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <AlertDescription fontSize="sm">
            Generated license codes will be provided to the district for distribution
            to teachers. Each code can be used by multiple teachers up to the seat limit.
          </AlertDescription>
        </Alert>

        <Box
          bg="white"
          p={6}
          borderRadius="lg"
          boxShadow="sm"
          border="1px solid"
          borderColor="gray.200"
        >
          <VStack spacing={6}>
            <FormControl isRequired>
              <FormLabel>Number of License Codes</FormLabel>
              <NumberInput
                value={quantity}
                onChange={(_valueString: string, valueAsNumber: number) => setQuantity(valueAsNumber)}
                min={1}
                max={10000}
                step={10}
              >
                <NumberInputField placeholder="100" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <Text fontSize="xs" color="gray.500" mt={1}>
                How many unique 6-digit codes to generate
              </Text>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Seats Per License</FormLabel>
              <NumberInput
                value={seatsPerLicense}
                onChange={(_valueString: string, valueAsNumber: number) => setSeatsPerLicense(valueAsNumber)}
                min={1}
                max={100}
                step={5}
              >
                <NumberInputField placeholder="30" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <Text fontSize="xs" color="gray.500" mt={1}>
                Maximum teachers per license code
              </Text>
            </FormControl>

            <Divider />

            <Box width="full" bg="blue.50" p={4} borderRadius="md">
              <HStack justify="space-between">
                <Text fontWeight="semibold">Total Seats to Allocate:</Text>
                <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                  {totalSeats.toLocaleString()}
                </Text>
              </HStack>
              <Text fontSize="xs" color="gray.600" mt={1}>
                {quantity} codes × {seatsPerLicense} seats each
              </Text>
            </Box>

            <Divider />

            <FormControl>
              <FormLabel>Pool Name (Optional)</FormLabel>
              <Input
                placeholder="e.g., Fall 2025 Batch 1"
                value={poolName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPoolName(e.target.value)}
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                Helps organize license batches
              </Text>
            </FormControl>

            <FormControl>
              <FormLabel>Vault Entry ID (Optional)</FormLabel>
              <Input
                placeholder="Leave blank to create new vault entry"
                value={vaultEntryId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVaultEntryId(e.target.value)}
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                Deduct from existing vault entry, or leave blank
              </Text>
            </FormControl>
          </VStack>
        </Box>

        <HStack justify="flex-end" spacing={4}>
          <Button
            variant="ghost"
            onClick={() => navigate(`/admin/districts/${districtId}`)}
          >
            Cancel
          </Button>
          <Button
            leftIcon={<FiKey />}
            colorScheme="blue"
            onClick={handleProvision}
            isLoading={loading}
            loadingText="Provisioning..."
          >
            Provision Licenses
          </Button>
        </HStack>
      </VStack>

      {/* Success Modal with License Codes */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>License Codes Generated!</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Alert status="success" borderRadius="md">
                <AlertIcon />
                <Box>
                  <Text fontWeight="semibold">
                    {quantity} license codes created successfully
                  </Text>
                  <Text fontSize="sm">
                    Total seats allocated: {totalSeats.toLocaleString()}
                  </Text>
                </Box>
              </Alert>

              {provisionResult && (
                <Box>
                  <Text fontWeight="semibold" mb={2}>Pool Information:</Text>
                  <VStack align="start" spacing={1}>
                    <HStack>
                      <Text fontSize="sm" color="gray.600">Pool Code:</Text>
                      <Code>{provisionResult.pool_code}</Code>
                    </HStack>
                    <HStack>
                      <Text fontSize="sm" color="gray.600">Pool Name:</Text>
                      <Text fontSize="sm">{provisionResult.pool_name || 'N/A'}</Text>
                    </HStack>
                    <HStack>
                      <Text fontSize="sm" color="gray.600">Valid:</Text>
                      <Text fontSize="sm">
                        {new Date(provisionResult.valid_from).toLocaleDateString()} - {new Date(provisionResult.valid_until).toLocaleDateString()}
                      </Text>
                    </HStack>
                  </VStack>
                </Box>
              )}

              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text fontWeight="semibold">License Codes:</Text>
                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      leftIcon={<FiCopy />}
                      onClick={handleCopyAll}
                    >
                      Copy All
                    </Button>
                    <Button
                      size="sm"
                      leftIcon={<FiDownload />}
                      onClick={handleExportCSV}
                    >
                      Export CSV
                    </Button>
                  </HStack>
                </HStack>

                <Box
                  maxH="300px"
                  overflowY="auto"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="md"
                  p={3}
                >
                  <Wrap spacing={2}>
                    {licenseCodes.map((code, index) => (
                      <Tag
                        key={index}
                        size="lg"
                        colorScheme="blue"
                        cursor="pointer"
                        onClick={() => handleCopyCode(code)}
                        _hover={{ bg: 'blue.600', color: 'white' }}
                      >
                        {code}
                      </Tag>
                    ))}
                  </Wrap>
                </Box>
                <Text fontSize="xs" color="gray.500" mt={2}>
                  Click any code to copy it to clipboard
                </Text>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}
