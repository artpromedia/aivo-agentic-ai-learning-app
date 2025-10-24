/**
 * Create District Account Form
 * 
 * Operations Admin creates new district with bulk licensing
 * 
 * Updated: 2025-10-23 22:21:19 UTC
 * By: aivo-ai
 */

import React, { useState } from 'react';
import {
  Container,
  VStack,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Button,
  HStack,
  Box,
  Switch,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
  Alert,
  AlertIcon,
  AlertDescription
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller, ControllerRenderProps } from 'react-hook-form';
import { adminLicenseApi } from '@/api/adminLicenseApi';

interface CreateDistrictForm {
  district_name: string;
  district_code: string;
  state: string;
  city?: string;
  postal_codes?: string[];
  
  // Primary Contact
  primary_contact_name: string;
  primary_contact_email: string;
  primary_contact_phone?: string;
  
  // Billing Contact
  billing_contact_name?: string;
  billing_contact_email?: string;
  billing_contact_phone?: string;
  
  // Contract
  contract_start_date: string;
  contract_end_date: string;
  total_seats_purchased: number;
  price_per_seat?: number;
  
  // Settings
  auto_renewal: boolean;
  allow_teacher_self_registration: boolean;
  
  notes?: string;
}

export function CreateDistrictPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [totalValue, setTotalValue] = useState(0);
  
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<CreateDistrictForm>({
    defaultValues: {
      auto_renewal: true,
      allow_teacher_self_registration: true
    }
  });

  const seats = watch('total_seats_purchased');
  const pricePerSeat = watch('price_per_seat');

  React.useEffect(() => {
    if (seats && pricePerSeat) {
      setTotalValue(seats * pricePerSeat);
    }
  }, [seats, pricePerSeat]);

  const onSubmit = async (data: CreateDistrictForm) => {
    setLoading(true);

    try {
      // Parse postal codes if provided
      let postalCodes: string[] | undefined;
      if (data.postal_codes && typeof data.postal_codes === 'string') {
        postalCodes = (data.postal_codes as unknown as string)
          .split(',')
          .map((code: string) => code.trim())
          .filter((code: string) => code.length > 0);
      }

      const response = await adminLicenseApi.createDistrict({
        ...data,
        postal_codes: postalCodes,
        contract_start_date: new Date(data.contract_start_date).toISOString(),
        contract_end_date: new Date(data.contract_end_date).toISOString()
      });

      toast({
        title: 'District created!',
        description: `${data.district_name} has been created successfully.`,
        status: 'success',
        duration: 5000
      });

      // Navigate to district details
      navigate(`/admin/districts/${response.data.district_id}`);
      
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast({
        title: 'Failed to create district',
        description: err.response?.data?.detail || 'Please try again',
        status: 'error',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} as="form" onSubmit={handleSubmit(onSubmit)}>
        <VStack align="start" spacing={2} width="full">
          <Heading size="xl">Create District Account</Heading>
          <Text color="gray.600">
            Set up a new district with bulk licensing allocation
          </Text>
        </VStack>

        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <AlertDescription fontSize="sm">
            After creating the district, you'll be able to provision licenses
            from the licensing vault.
          </AlertDescription>
        </Alert>

        {/* Basic Information */}
        <Box
          width="full"
          bg="white"
          p={6}
          borderRadius="lg"
          boxShadow="sm"
          border="1px solid"
          borderColor="gray.200"
        >
          <Heading size="md" mb={4}>Basic Information</Heading>
          
          <VStack spacing={4}>
            <FormControl isRequired isInvalid={!!errors.district_name}>
              <FormLabel>District Name</FormLabel>
              <Input
                placeholder="Los Angeles Unified School District"
                {...register('district_name', {
                  required: 'District name is required'
                })}
              />
            </FormControl>

            <HStack width="full" spacing={4}>
              <FormControl isRequired isInvalid={!!errors.district_code}>
                <FormLabel>District Code</FormLabel>
                <Input
                  placeholder="LAUSD"
                  textTransform="uppercase"
                  maxLength={20}
                  {...register('district_code', {
                    required: 'District code is required'
                  })}
                />
              </FormControl>

              <FormControl isRequired isInvalid={!!errors.state}>
                <FormLabel>State</FormLabel>
                <Select
                  placeholder="Select state"
                  {...register('state', {
                    required: 'State is required'
                  })}
                >
                  <option value="CA">California</option>
                  <option value="TX">Texas</option>
                  <option value="NY">New York</option>
                  <option value="FL">Florida</option>
                  {/* Add all states */}
                </Select>
              </FormControl>
            </HStack>

            <FormControl>
              <FormLabel>City</FormLabel>
              <Input
                placeholder="Los Angeles"
                {...register('city')}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Postal Codes</FormLabel>
              <Input
                placeholder="90001, 90002, 90003 (comma-separated)"
                {...register('postal_codes')}
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                Enter zip codes served by this district, separated by commas
              </Text>
            </FormControl>
          </VStack>
        </Box>

        {/* Primary Contact */}
        <Box
          width="full"
          bg="white"
          p={6}
          borderRadius="lg"
          boxShadow="sm"
          border="1px solid"
          borderColor="gray.200"
        >
          <Heading size="md" mb={4}>Primary Contact</Heading>
          
          <VStack spacing={4}>
            <FormControl isRequired isInvalid={!!errors.primary_contact_name}>
              <FormLabel>Contact Name</FormLabel>
              <Input
                placeholder="Dr. Jane Smith"
                {...register('primary_contact_name', {
                  required: 'Contact name is required'
                })}
              />
            </FormControl>

            <HStack width="full" spacing={4}>
              <FormControl isRequired isInvalid={!!errors.primary_contact_email}>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  placeholder="jsmith@district.edu"
                  {...register('primary_contact_email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email'
                    }
                  })}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Phone</FormLabel>
                <Input
                  type="tel"
                  placeholder="+1-555-123-4567"
                  {...register('primary_contact_phone')}
                />
              </FormControl>
            </HStack>
          </VStack>
        </Box>

        {/* Billing Contact (Optional) */}
        <Box
          width="full"
          bg="white"
          p={6}
          borderRadius="lg"
          boxShadow="sm"
          border="1px solid"
          borderColor="gray.200"
        >
          <Heading size="md" mb={4}>
            Billing Contact (Optional)
          </Heading>
          
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Billing Contact Name</FormLabel>
              <Input
                placeholder="John Doe"
                {...register('billing_contact_name')}
              />
            </FormControl>

            <HStack width="full" spacing={4}>
              <FormControl>
                <FormLabel>Billing Email</FormLabel>
                <Input
                  type="email"
                  placeholder="billing@district.edu"
                  {...register('billing_contact_email')}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Billing Phone</FormLabel>
                <Input
                  type="tel"
                  placeholder="+1-555-987-6543"
                  {...register('billing_contact_phone')}
                />
              </FormControl>
            </HStack>
          </VStack>
        </Box>

        {/* Contract Terms */}
        <Box
          width="full"
          bg="white"
          p={6}
          borderRadius="lg"
          boxShadow="sm"
          border="1px solid"
          borderColor="gray.200"
        >
          <Heading size="md" mb={4}>Contract Terms</Heading>
          
          <VStack spacing={4}>
            <HStack width="full" spacing={4}>
              <FormControl isRequired isInvalid={!!errors.contract_start_date}>
                <FormLabel>Contract Start Date</FormLabel>
                <Input
                  type="date"
                  {...register('contract_start_date', {
                    required: 'Start date is required'
                  })}
                />
              </FormControl>

              <FormControl isRequired isInvalid={!!errors.contract_end_date}>
                <FormLabel>Contract End Date</FormLabel>
                <Input
                  type="date"
                  {...register('contract_end_date', {
                    required: 'End date is required'
                  })}
                />
              </FormControl>
            </HStack>

            <FormControl isRequired isInvalid={!!errors.total_seats_purchased}>
              <FormLabel>Total Seats Purchased</FormLabel>
              <Controller
                name="total_seats_purchased"
                control={control}
                rules={{ required: 'Total seats is required', min: 1 }}
                render={({ field }: { field: ControllerRenderProps<CreateDistrictForm, 'total_seats_purchased'> }) => (
                  <NumberInput
                    {...field}
                    min={1}
                    step={100}
                    onChange={(valueString: string) => field.onChange(parseInt(valueString))}
                  >
                    <NumberInputField placeholder="10000" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                )}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Price Per Seat</FormLabel>
              <Controller
                name="price_per_seat"
                control={control}
                render={({ field }: { field: ControllerRenderProps<CreateDistrictForm, 'price_per_seat'> }) => (
                  <NumberInput
                    {...field}
                    min={0}
                    step={5}
                    precision={2}
                    onChange={(valueString: string) => field.onChange(parseFloat(valueString))}
                  >
                    <NumberInputField placeholder="45.00" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                )}
              />
              {totalValue > 0 && (
                <Text fontSize="sm" color="gray.600" mt={1}>
                  Total Contract Value: <strong>${totalValue.toLocaleString()}</strong>
                </Text>
              )}
            </FormControl>
          </VStack>
        </Box>

        {/* Settings */}
        <Box
          width="full"
          bg="white"
          p={6}
          borderRadius="lg"
          boxShadow="sm"
          border="1px solid"
          borderColor="gray.200"
        >
          <Heading size="md" mb={4}>Settings</Heading>
          
          <VStack spacing={4} align="start">
            <FormControl display="flex" alignItems="center">
              <FormLabel mb={0}>
                Auto-Renewal
              </FormLabel>
              <Controller
                name="auto_renewal"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Switch
                    isChecked={value}
                    onChange={(e) => onChange(e.target.checked)}
                    colorScheme="blue"
                  />
                )}
              />
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel mb={0}>
                Allow Teacher Self-Registration
              </FormLabel>
              <Controller
                name="allow_teacher_self_registration"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Switch
                    isChecked={value}
                    onChange={(e) => onChange(e.target.checked)}
                    colorScheme="blue"
                  />
                )}
              />
            </FormControl>
          </VStack>
        </Box>

        {/* Notes */}
        <Box
          width="full"
          bg="white"
          p={6}
          borderRadius="lg"
          boxShadow="sm"
          border="1px solid"
          borderColor="gray.200"
        >
          <Heading size="md" mb={4}>Notes</Heading>
          
          <FormControl>
            <Textarea
              placeholder="Additional notes about this district..."
              rows={4}
              {...register('notes')}
            />
          </FormControl>
        </Box>

        {/* Actions */}
        <HStack width="full" justify="flex-end" spacing={4}>
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/districts')}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={loading}
            loadingText="Creating..."
          >
            Create District
          </Button>
        </HStack>
      </VStack>
    </Container>
  );
}
