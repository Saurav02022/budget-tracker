import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Text,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    IconButton,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Input,
    Select,
    Textarea,
    useToast,
    Spinner,
    HStack,
    Stack,
    Grid,
    GridItem,
    useColorModeValue,
    ButtonGroup,
    Flex,
    Heading
} from '@chakra-ui/react';
import { FiPlus, FiEdit, FiTrash2, FiFilter } from 'react-icons/fi';
import AppLayout from '../components/AppLayout';
import { fetchTransactions, fetchCategories, createTransaction, updateTransaction, deleteTransaction } from '../api/api';
import { Transaction, Category } from '../interfaces';

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(date);
};

const TransactionsPage = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalTransactions, setTotalTransactions] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [filters, setFilters] = useState({
        type: '',
        category: '',
        startDate: '',
        endDate: '',
        search: '',
    });
    const [formData, setFormData] = useState({
        type: 'expense' as 'income' | 'expense',
        category: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });
    
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { 
        isOpen: isDeleteOpen, 
        onOpen: onDeleteOpen, 
        onClose: onDeleteClose 
    } = useDisclosure();
    const {
        isOpen: isFilterOpen,
        onOpen: onFilterOpen,
        onClose: onFilterClose
    } = useDisclosure();
    
    const toast = useToast();
    const cardBg = useColorModeValue('white', 'gray.700');
    const pageSize = 10;

    useEffect(() => {
        fetchData();
    }, [currentPage, filters]);
    
    const fetchData = async () => {
        try {
            setLoading(true);
            
            // Fetch categories first
            const categoriesResponse = await fetchCategories();
            setCategories(categoriesResponse.data.results);
            
            // Prepare transaction filters
            const params: Record<string, string | number> = {
                page: currentPage,
            };
            
            if (filters.type) params.type = filters.type;
            if (filters.category) params.category = filters.category;
            if (filters.startDate) params.date__gte = filters.startDate;
            if (filters.endDate) params.date__lte = filters.endDate;
            if (filters.search) params.search = filters.search;
            
            // Fetch transactions with filters
            const transactionsResponse = await fetchTransactions(params);
            setTransactions(transactionsResponse.data.results);
            setTotalTransactions(transactionsResponse.data.count);
            
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const handleAddNew = () => {
        // Reset form
        setSelectedTransaction(null);
        setFormData({
            type: 'expense',
            category: '',
            amount: '',
            description: '',
            date: new Date().toISOString().split('T')[0]
        });
        onOpen();
    };
    
    const handleEdit = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setFormData({
            type: transaction.type,
            category: transaction.category.toString(),
            amount: transaction.amount.toString(),
            description: transaction.description || '',
            date: transaction.date
        });
        onOpen();
    };
    
    const handleDelete = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        onDeleteOpen();
    };
    
    const confirmDelete = async () => {
        if (!selectedTransaction) return;
        
        try {
            await deleteTransaction(selectedTransaction.id);
            
            toast({
                title: 'Transaction deleted',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            
            // Refetch transactions
            fetchData();
            
            onDeleteClose();
        } catch (error) {
            console.error('Error deleting transaction:', error);
            toast({
                title: 'Error',
                description: 'Something went wrong. Please try again.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.type || !formData.category || !formData.amount || !formData.date) {
            toast({
                title: 'Missing information',
                description: 'Please fill in all required fields',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }
        
        const amount = parseFloat(formData.amount);
        if (isNaN(amount) || amount <= 0) {
            toast({
                title: 'Invalid amount',
                description: 'Amount must be a positive number',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }
        
        try {
            const transactionData = {
                ...formData,
                amount,
                category: parseInt(formData.category),
            };
            
            if (selectedTransaction) {
                // Update existing transaction
                await updateTransaction(selectedTransaction.id, transactionData);
                toast({
                    title: 'Transaction updated',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
            } else {
                // Create new transaction
                await createTransaction(transactionData);
                toast({
                    title: 'Transaction created',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
            }
            
            // Refetch transactions
            fetchData();
            
            // Close modal
            onClose();
        } catch (error) {
            console.error('Error saving transaction:', error);
            toast({
                title: 'Error',
                description: 'Something went wrong. Please try again.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };
    
    const handleResetFilters = () => {
        setFilters({
            type: '',
            category: '',
            startDate: '',
            endDate: '',
            search: '',
        });
        setCurrentPage(1);
        onFilterClose();
    };
    
    const handleApplyFilters = () => {
        setCurrentPage(1);
        onFilterClose();
    };
    
    const getFilteredCategoriesByType = (type: string) => {
        if (!categories || !Array.isArray(categories)) return [];
        if (!type) return categories;
        return categories.filter(category => category.type === type);
    };
    
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };
    
    const renderPagination = () => {
        if (!transactions.length) return null;
        
        const totalPages = Math.ceil(totalTransactions / pageSize);
        
        const maxVisiblePages = 5;
        const halfVisible = Math.floor(maxVisiblePages / 2);
        
        let startPage = Math.max(1, currentPage - halfVisible);
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        const pages = [];
        
        if (startPage > 1) {
            pages.push(
                <Button 
                    key="first" 
                    size="sm" 
                    onClick={() => handlePageChange(1)}
                    variant="outline"
                >
                    1
                </Button>
            );
            if (startPage > 2) {
                pages.push(<Text key="ellipsis1">...</Text>);
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <Button 
                    key={i} 
                    size="sm" 
                    onClick={() => handlePageChange(i)}
                    colorScheme={i === currentPage ? "blue" : undefined}
                    variant={i === currentPage ? "solid" : "outline"}
                >
                    {i}
                </Button>
            );
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pages.push(<Text key="ellipsis2">...</Text>);
            }
            pages.push(
                <Button 
                    key="last" 
                    size="sm" 
                    onClick={() => handlePageChange(totalPages)}
                    variant="outline"
                >
                    {totalPages}
                </Button>
            );
        }
        
        return (
            <HStack spacing={2} mt={6} justify="center">
                <Button 
                    size="sm" 
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    isDisabled={currentPage === 1}
                    variant="outline"
                >
                    Previous
                </Button>
                {pages}
                <Button 
                    size="sm" 
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    isDisabled={currentPage === totalPages}
                    variant="outline"
                >
                    Next
                </Button>
            </HStack>
        );
    };
    
    return (
        <AppLayout>
            <Box mb={6}>
                <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                    <Box>
                        <Heading size="lg">Transactions</Heading>
                        <Text color="gray.600">Manage your income and expenses</Text>
                    </Box>
                    <HStack>
                        <Button
                            // @ts-expect-error - React Icons compatibility with Chakra UI
                            leftIcon={<FiFilter size={20} />}
                            variant="outline"
                            onClick={onFilterOpen}
                        >
                            Filter
                        </Button>
                        <Button
                            // @ts-expect-error - React Icons compatibility with Chakra UI
                            leftIcon={<FiPlus size={20} />}
                            colorScheme="blue"
                            onClick={handleAddNew}
                        >
                            Add Transaction
                        </Button>
                    </HStack>
                </Flex>
            </Box>
            
            {/* Active filters display */}
            {(filters.type || filters.category || filters.startDate || filters.endDate || filters.search) && (
                <Box mb={6} p={4} bg={cardBg} borderRadius="md" boxShadow="sm">
                    <Flex justify="space-between" align="center">
                        <Text fontWeight="medium">Active Filters:</Text>
                        <Button size="sm" variant="link" onClick={handleResetFilters}>
                            Clear All
                        </Button>
                    </Flex>
                    <Flex mt={2} flexWrap="wrap" gap={2}>
                        {filters.type && (
                            <Badge colorScheme="blue" px={2} py={1} borderRadius="full">
                                Type: {filters.type === 'income' ? 'Income' : 'Expense'}
                            </Badge>
                        )}
                        {filters.category && (
                            <Badge colorScheme="green" px={2} py={1} borderRadius="full">
                                Category: {Array.isArray(categories) ? categories.find(c => c.id.toString() === filters.category)?.name || filters.category : filters.category}
                            </Badge>
                        )}
                        {filters.startDate && (
                            <Badge colorScheme="purple" px={2} py={1} borderRadius="full">
                                From: {filters.startDate}
                            </Badge>
                        )}
                        {filters.endDate && (
                            <Badge colorScheme="purple" px={2} py={1} borderRadius="full">
                                To: {filters.endDate}
                            </Badge>
                        )}
                        {filters.search && (
                            <Badge colorScheme="orange" px={2} py={1} borderRadius="full">
                                Search: {filters.search}
                            </Badge>
                        )}
                    </Flex>
                </Box>
            )}
            
            {loading ? (
                <Flex justify="center" align="center" height="300px">
                    <Spinner size="xl" color="blue.500" />
                </Flex>
            ) : (
                <Box>
                    {transactions.length > 0 ? (
                        <Box overflowX="auto">
                            <Table variant="simple" bg={cardBg} borderRadius="lg" boxShadow="sm">
                                <Thead>
                                    <Tr>
                                        <Th>Date</Th>
                                        <Th>Category</Th>
                                        <Th>Description</Th>
                                        <Th isNumeric>Amount</Th>
                                        <Th>Type</Th>
                                        <Th>Actions</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {transactions.map(transaction => (
                                        <Tr key={transaction.id}>
                                            <Td>{formatDate(transaction.date)}</Td>
                                            <Td>{transaction.category_name}</Td>
                                            <Td maxW="250px" isTruncated>
                                                {transaction.description || '-'}
                                            </Td>
                                            <Td isNumeric fontWeight="semibold">
                                                ${Number(transaction.amount).toFixed(2)}
                                            </Td>
                                            <Td>
                                                <Badge 
                                                    colorScheme={transaction.type === 'income' ? 'green' : 'red'}
                                                    px={2} 
                                                    py={1} 
                                                    borderRadius="full"
                                                >
                                                    {transaction.type === 'income' ? 'Income' : 'Expense'}
                                                </Badge>
                                            </Td>
                                            <Td>
                                                <IconButton
                                                    // @ts-expect-error - React Icons compatibility with Chakra UI
                                                    icon={<FiEdit size={16} />}
                                                    aria-label="Edit transaction"
                                                    size="sm"
                                                    colorScheme="blue"
                                                    variant="ghost"
                                                    mr={2}
                                                    onClick={() => handleEdit(transaction)}
                                                />
                                                <IconButton
                                                    // @ts-expect-error - React Icons compatibility with Chakra UI
                                                    icon={<FiTrash2 size={16} />}
                                                    aria-label="Delete transaction"
                                                    size="sm"
                                                    colorScheme="red"
                                                    variant="ghost"
                                                    onClick={() => handleDelete(transaction)}
                                                />
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                            
                            {renderPagination()}
                        </Box>
                    ) : (
                        <Box p={8} textAlign="center" bg={cardBg} borderRadius="lg" boxShadow="sm">
                            <Text mb={4}>No transactions found.</Text>
                            <Button colorScheme="blue" onClick={handleAddNew}>
                                Add Your First Transaction
                            </Button>
                        </Box>
                    )}
                </Box>
            )}
            
            {/* Add/Edit Transaction Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="md">
                <ModalOverlay />
                <ModalContent>
                    <form onSubmit={handleSubmit}>
                        <ModalHeader>
                            {selectedTransaction ? 'Edit Transaction' : 'Add Transaction'}
                        </ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Stack spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel>Type</FormLabel>
                                    <Select 
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                    >
                                        <option value="expense">Expense</option>
                                        <option value="income">Income</option>
                                    </Select>
                                </FormControl>
                                
                                <FormControl isRequired>
                                    <FormLabel>Category</FormLabel>
                                    <Select 
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        placeholder="Select category"
                                    >
                                        {getFilteredCategoriesByType(formData.type).map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>
                                
                                <FormControl isRequired>
                                    <FormLabel>Amount</FormLabel>
                                    <Input 
                                        name="amount"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={formData.amount}
                                        onChange={handleInputChange}
                                        placeholder="Enter amount"
                                    />
                                </FormControl>
                                
                                <FormControl isRequired>
                                    <FormLabel>Date</FormLabel>
                                    <Input 
                                        name="date"
                                        type="date"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                    />
                                </FormControl>
                                
                                <FormControl>
                                    <FormLabel>Description</FormLabel>
                                    <Textarea 
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Optional description"
                                        rows={3}
                                    />
                                </FormControl>
                            </Stack>
                        </ModalBody>
                        
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onClose}>
                                Cancel
                            </Button>
                            <Button colorScheme="blue" type="submit">
                                {selectedTransaction ? 'Update' : 'Create'}
                            </Button>
                        </ModalFooter>
                    </form>
                </ModalContent>
            </Modal>
            
            {/* Filter Modal */}
            <Modal isOpen={isFilterOpen} onClose={onFilterClose} size="md">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Filter Transactions</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Stack spacing={4}>
                            <FormControl>
                                <FormLabel>Transaction Type</FormLabel>
                                <Select 
                                    name="type"
                                    value={filters.type}
                                    onChange={handleFilterChange}
                                    placeholder="All types"
                                >
                                    <option value="income">Income</option>
                                    <option value="expense">Expense</option>
                                </Select>
                            </FormControl>
                            
                            <FormControl>
                                <FormLabel>Category</FormLabel>
                                <Select 
                                    name="category"
                                    value={filters.category}
                                    onChange={handleFilterChange}
                                    placeholder="All categories"
                                >
                                    {getFilteredCategoriesByType(filters.type).map(category => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>
                            
                            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                                <GridItem>
                                    <FormControl>
                                        <FormLabel>From Date</FormLabel>
                                        <Input 
                                            name="startDate"
                                            type="date"
                                            value={filters.startDate}
                                            onChange={handleFilterChange}
                                        />
                                    </FormControl>
                                </GridItem>
                                <GridItem>
                                    <FormControl>
                                        <FormLabel>To Date</FormLabel>
                                        <Input 
                                            name="endDate"
                                            type="date"
                                            value={filters.endDate}
                                            onChange={handleFilterChange}
                                        />
                                    </FormControl>
                                </GridItem>
                            </Grid>
                            
                            <FormControl>
                                <FormLabel>Search</FormLabel>
                                <Input 
                                    name="search"
                                    value={filters.search}
                                    onChange={handleFilterChange}
                                    placeholder="Search in description or category"
                                />
                            </FormControl>
                        </Stack>
                    </ModalBody>
                    
                    <ModalFooter>
                        <ButtonGroup spacing={3}>
                            <Button variant="outline" onClick={handleResetFilters}>
                                Reset
                            </Button>
                            <Button variant="ghost" mr={3} onClick={onFilterClose}>
                                Cancel
                            </Button>
                            <Button colorScheme="blue" onClick={handleApplyFilters}>
                                Apply Filters
                            </Button>
                        </ButtonGroup>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            
            {/* Delete Confirmation Modal */}
            <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Delete Transaction</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text>
                            Are you sure you want to delete this transaction? This action cannot be undone.
                        </Text>
                    </ModalBody>
                    
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onDeleteClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="red" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </AppLayout>
    );
};

export default TransactionsPage; 