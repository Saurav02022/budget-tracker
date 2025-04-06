import { useState, useEffect, useRef } from 'react';
import {
    Box,
    Card,
    CardHeader,
    CardBody,
    Heading,
    Text,
    Flex,
    Spinner,
    FormControl,
    FormLabel,
    Input,
    Button,
    useToast,
    Progress,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    SimpleGrid,
    useColorModeValue
} from '@chakra-ui/react';
import * as d3 from 'd3';
import AppLayout from '../components/AppLayout';
import { fetchCurrentBudget, createBudget, updateBudget } from '../api/api';
import { Budget } from '../interfaces';

const BudgetPage = () => {
    const [budget, setBudget] = useState<Budget | null>(null);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    const toast = useToast();
    const chartRef = useRef<SVGSVGElement>(null);
    
    const cardBg = useColorModeValue('white', 'gray.700');
    const textColor = useColorModeValue('gray.600', 'gray.200');

    useEffect(() => {
        fetchBudgetData();
    }, []);
    
    useEffect(() => {
        if (!loading && budget && chartRef.current) {
            drawBudgetChart();
        }
    }, [loading, budget]);
    
    const fetchBudgetData = async () => {
        try {
            setLoading(true);
            
            console.log('Fetching current budget data...');
            const response = await fetchCurrentBudget();
            console.log('Current budget data received:', response.data);
            
            // Set the budget state
            setBudget(response.data);
            
            // Only set amount if we have a valid budget amount
            if (response.data && response.data.amount) {
                const budgetAmount = parseFloat(response.data.amount);
                if (budgetAmount > 0) {
                    console.log('Setting amount input to:', response.data.amount);
                    setAmount(response.data.amount);
                } else if (amount === '0' || amount === '0.00' || amount === '') {
                    // If current input is 0/empty and server returns 0, set to empty for better UX
                    setAmount('');
                }
            }
            
            setLoading(false);
            return response.data; // Return the data for immediate use
        } catch (error) {
            console.error('Error fetching budget:', error);
            setLoading(false);
            return null;
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Parse amount to validate
        const budgetAmount = Number(amount);
        
        // Validate budget amount
        if (!amount || isNaN(budgetAmount) || budgetAmount <= 0) {
            toast({
                title: 'Invalid amount',
                description: 'Please enter a valid budget amount',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }
        
        // Check for maximum limit to prevent server issues
        if (budgetAmount > 9999999.99) {
            toast({
                title: 'Amount too large',
                description: 'Budget amount cannot exceed 9,999,999.99',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }
        
        try {
            setSubmitting(true);
            
            // Get current budget information
            const currentBudget = await fetchBudgetData();
            
            if (currentBudget && currentBudget.id) {
                // Update existing budget
                console.log('Updating existing budget:', currentBudget.id, { amount: budgetAmount.toFixed(2) });
                
                try {
                    // Ensure we have a properly formatted month value
                    let monthValue = currentBudget.month;
                    
                    // If month is missing or invalid, use current month
                    if (!monthValue || typeof monthValue !== 'string') {
                        const today = new Date();
                        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                        monthValue = firstDayOfMonth.toISOString().split('T')[0];
                        console.log('Using generated month:', monthValue);
                    }
                    
                    console.log('Sending update with data:', { 
                        amount: budgetAmount.toFixed(2), 
                        month: monthValue 
                    });
                    
                    const updateResponse = await updateBudget(currentBudget.id, { 
                        amount: budgetAmount.toFixed(2),
                        month: monthValue
                    });
                    console.log('Budget update success:', updateResponse);
                    
                    toast({
                        title: 'Budget updated',
                        description: 'Your budget has been updated successfully',
                        status: 'success',
                        duration: 3000,
                        isClosable: true,
                    });
                    
                    // Refresh budget data
                    const refreshResponse = await fetchCurrentBudget();
                    setBudget(refreshResponse.data);
                    if (refreshResponse.data && refreshResponse.data.amount) {
                        setAmount(refreshResponse.data.amount);
                    }
                } catch (updateError) {
                    console.error('Error updating budget:', updateError);
                    toast({
                        title: 'Update failed',
                        description: 'Could not update budget. Please try again.',
                        status: 'error',
                        duration: 3000,
                        isClosable: true,
                    });
                }
            } else {
                // Create new budget
                const today = new Date();
                const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                const monthStr = firstDayOfMonth.toISOString().split('T')[0];
                
                console.log('Creating new budget:', { month: monthStr, amount: budgetAmount.toFixed(2) });
                
                try {
                    const createResponse = await createBudget({
                        month: monthStr,
                        amount: budgetAmount.toFixed(2)  // Ensure 2 decimal places
                    });
                    console.log('Budget creation success:', createResponse);
                    
                    toast({
                        title: 'Budget created',
                        description: 'Your budget has been set successfully',
                        status: 'success',
                        duration: 3000,
                        isClosable: true,
                    });
                    
                    // Refresh budget data
                    const refreshResponse = await fetchCurrentBudget();
                    setBudget(refreshResponse.data);
                    if (refreshResponse.data && refreshResponse.data.amount) {
                        setAmount(refreshResponse.data.amount);
                    }
                } catch (createError) {
                    console.error('Error creating budget:', createError);
                    toast({
                        title: 'Creation failed',
                        description: 'Could not create budget. Please try again.',
                        status: 'error',
                        duration: 3000,
                        isClosable: true,
                    });
                }
            }
        } catch (error) {
            console.error('General error in budget handling:', error);
            toast({
                title: 'Error',
                description: 'Something went wrong. Please try again.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setSubmitting(false);
        }
    };
    
    const drawBudgetChart = () => {
        if (!chartRef.current || !budget) return;
        
        // Clear previous content
        d3.select(chartRef.current).selectAll('*').remove();
        
        // Get dimensions from the SVG element
        const width = chartRef.current.width.baseVal.value;
        const height = chartRef.current.height.baseVal.value;
        const margin = 40;
        const radius = Math.min(width, height) / 2 - margin;
        
        const svg = d3.select(chartRef.current)
            .append('g')
            .attr('transform', `translate(${width / 2}, ${height / 2})`);
        
        // Data preparation
        const budgetAmount = parseFloat(budget.amount);
        const spentAmount = parseFloat(budget.spent || '0');
        const remainingAmount = Math.max(0, budgetAmount - spentAmount);
        
        const data = [
            { label: 'Spent', value: spentAmount, color: '#F56565' },  // Red
            { label: 'Remaining', value: remainingAmount, color: '#48BB78' }  // Green
        ];
        
        // Only show the pie if there's a positive budget amount
        if (budgetAmount > 0) {
            const pie = d3.pie<typeof data[0]>()
                .value(d => d.value)
                .sort(null);
            
            // Calculate arcs
            const arc = d3.arc<d3.PieArcDatum<typeof data[0]>>()
                .innerRadius(radius * 0.6)
                .outerRadius(radius * 0.9);
            
            // Draw arcs
            svg.selectAll('path')
                .data(pie(data))
                .enter()
                .append('path')
                .attr('d', arc)
                .attr('fill', d => d.data.color);
            
            // Add percentage text in center with better positioning
            svg.append('text')
                .attr('text-anchor', 'middle')
                .attr('dy', '0.35em')
                .style('font-size', '24px')
                .style('font-weight', 'bold')
                .style('fill', '#2D3748')  // Darker text for better visibility
                .text(`${budget.percentage_spent?.toFixed(0)}%`);
            
            // Create a separate group for the legend and position below the chart
            const legendGroup = svg.append('g')
                .attr('transform', `translate(0, ${radius * 1.2})`)
                .attr('text-anchor', 'middle');
            
            // Add legend items horizontally
            const legendSpacing = 100; // Space between legend items
            data.forEach((d, i) => {
                const xOffset = (i - data.length / 2 + 0.5) * legendSpacing;
                
                const legendItem = legendGroup.append('g')
                    .attr('transform', `translate(${xOffset}, 0)`);
                    
                legendItem.append('rect')
                    .attr('width', 16)
                    .attr('height', 16)
                    .attr('x', -8)
                    .attr('y', -8)
                    .attr('fill', d.color);
                    
                // Label (Spent/Remaining)
                legendItem.append('text')
                    .attr('y', 20)
                    .style('font-size', '14px')
                    .style('font-weight', 'medium')
                    .text(d.label);
                
                // Dollar amount
                legendItem.append('text')
                    .attr('y', 40)
                    .style('font-size', '12px')
                    .text(`$${d.value.toFixed(2)}`);
            });
        } else {
            // If budget is 0, show a message
            svg.append('text')
                .attr('text-anchor', 'middle')
                .attr('dy', '0.35em')
                .style('font-size', '16px')
                .text('No budget set');
        }
    };
    
    return (
        <AppLayout>
            {loading ? (
                <Flex justify="center" align="center" height="70vh">
                    <Spinner size="xl" color="blue.500" thickness="4px" />
                </Flex>
            ) : (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                    <Box>
                        <Card bg={cardBg} boxShadow="sm" borderRadius="lg" mb={8}>
                            <CardHeader>
                                <Heading size="md">Set Monthly Budget</Heading>
                                <Text fontSize="sm" color={textColor}>
                                    {budget?.month_display || 'Current Month'}
                                </Text>
                            </CardHeader>
                            <CardBody>
                                <form onSubmit={handleSubmit}>
                                    <FormControl mb={4}>
                                        <FormLabel>Budget Amount</FormLabel>
                                        <Input 
                                            type="number" 
                                            value={amount} 
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="Enter budget amount"
                                            min="0"
                                            max="9999999.99"
                                            step="0.01"
                                        />
                                    </FormControl>
                                    <Button 
                                        colorScheme="blue" 
                                        type="submit"
                                        isLoading={submitting}
                                        width="full"
                                    >
                                        {budget?.id ? 'Update Budget' : 'Set Budget'}
                                    </Button>
                                </form>
                            </CardBody>
                        </Card>
                        
                        <Card bg={cardBg} boxShadow="sm" borderRadius="lg">
                            <CardHeader>
                                <Heading size="md">Budget Summary</Heading>
                                <Text fontSize="sm" color={textColor}>
                                    {budget?.month_display || 'Current Month'}
                                </Text>
                            </CardHeader>
                            <CardBody>
                                <Stat mb={4}>
                                    <StatLabel>Total Budget</StatLabel>
                                    <StatNumber>${budget?.amount ? parseFloat(budget.amount).toFixed(2) : '0.00'}</StatNumber>
                                </Stat>
                                
                                <Stat mb={4}>
                                    <StatLabel>Spent So Far</StatLabel>
                                    <StatNumber>${Number(budget?.spent || 0).toFixed(2)}</StatNumber>
                                    <StatHelpText>
                                        {budget?.percentage_spent ? `${budget.percentage_spent.toFixed(1)}% of budget` : '0% of budget'}
                                    </StatHelpText>
                                </Stat>
                                
                                <Stat mb={6}>
                                    <StatLabel>Remaining</StatLabel>
                                    <StatNumber>${Number(budget?.remaining || 0).toFixed(2)}</StatNumber>
                                </Stat>
                                
                                <Progress 
                                    value={budget?.percentage_spent || 0} 
                                    colorScheme={
                                        (budget?.percentage_spent || 0) > 90 ? 'red' : 
                                        (budget?.percentage_spent || 0) > 75 ? 'orange' : 'green'
                                    }
                                    height="12px"
                                    borderRadius="md"
                                />
                            </CardBody>
                        </Card>
                    </Box>
                    
                    <Card bg={cardBg} boxShadow="sm" borderRadius="lg" height="fit-content">
                        <CardHeader>
                            <Heading size="md">Budget Visualization</Heading>
                            <Text fontSize="sm" color={textColor}>
                                Spent vs Remaining
                            </Text>
                        </CardHeader>
                        <CardBody>
                            <Flex justify="center" align="center" p={2} minHeight="380px">
                                <svg ref={chartRef} width="320" height="380"></svg>
                            </Flex>
                        </CardBody>
                    </Card>
                </SimpleGrid>
            )}
        </AppLayout>
    );
};

export default BudgetPage; 