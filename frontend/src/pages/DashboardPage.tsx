import { useEffect, useState, useRef, useCallback } from 'react'; // Core React hooks with TypeScript support
import {
  Box,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  Flex,
  Spinner,
  useColorModeValue,
  SimpleGrid,
} from '@chakra-ui/react'; // Chakra UI components
import { Line } from 'react-chartjs-2'; // Chart.js wrapper
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartData,
  ChartOptions,
  TooltipItem,
} from 'chart.js'; // Chart.js with specific types
import * as d3 from 'd3'; // D3.js with type definitions
import type { PieArcDatum } from 'd3'; // Specific D3 type for pie chart
import AppLayout from '../components/AppLayout'; // Custom layout component
import {
  fetchTransactionSummary,
  fetchCategoryBreakdown,
  fetchMonthlyData,
} from '../api/api'; // API service calls

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// Define TypeScript interfaces for type safety
interface TransactionSummary {
  total_income: number;
  total_expenses: number;
  balance: number;
}

interface CategoryBreakdown {
  category_name: string;
  total_amount: number;
  percentage: number;
}

interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}

/**
 * DashboardPage Component
 * Displays financial overview with responsive stats, pie chart for expense breakdown,
 * and line chart for monthly comparison. Follows React and TypeScript best practices.
 */
const DashboardPage = () => {
  // State management with TypeScript types
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [breakdownData, setBreakdownData] = useState<CategoryBreakdown[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Ref for pie chart SVG element with proper typing
  const pieChartRef = useRef<SVGSVGElement>(null);

  // Chakra UI color mode hooks for theme consistency
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.200');

  /**
   * Draw D3.js pie chart for expense breakdown
   * @param svgElement - The SVG element to render the chart
   * Optimized for responsiveness with dynamic sizing
   */
  const drawPieChart = useCallback((svgElement: SVGSVGElement) => {
    const container = svgElement.parentElement;
    if (!container) return;

    const width = container.clientWidth || 280; // Default width for small screens
    const height = Math.min(width, 400); // Cap height for proportionality
    const margin = 20;
    const radius = Math.min(width, height) / 2 - margin;

    const svg = d3
      .select(svgElement)
      .attr('width', '100%') // Responsive width
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    svg.selectAll('*').remove(); // Clear previous render

    const g = svg.append('g').attr('transform', `translate(${width / 2}, ${height / 2})`);

    const color = d3.scaleOrdinal<string>().domain(breakdownData.map(d => d.category_name)).range(d3.schemeSet2);

    const pie = d3.pie<CategoryBreakdown>().value((d: CategoryBreakdown) => d.total_amount);
    const arc = d3.arc<PieArcDatum<CategoryBreakdown>>().innerRadius(0).outerRadius(radius);

    const arcs = g
      .selectAll('.arc')
      .data(pie(breakdownData))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs
      .append('path')
      .attr('d', d => arc(d) || '')
      .attr('fill', (d: PieArcDatum<CategoryBreakdown>) => color(d.data.category_name));

    arcs
      .filter((d: PieArcDatum<CategoryBreakdown>) => d.endAngle - d.startAngle > 0.2)
      .append('text')
      .attr('transform', (d: PieArcDatum<CategoryBreakdown>) => `translate(${arc.centroid(d)})`)
      .attr('dy', '.35em')
      .style('text-anchor', 'middle')
      .style('font-size', `${Math.min(12, width / 25)}px`) // Dynamic font size
      .style('fill', '#fff')
      .text((d: PieArcDatum<CategoryBreakdown>) => d.data.category_name);
  }, [breakdownData]);

  /**
   * Fetch data from API on component mount
   * Uses Promise.all for parallel requests with error handling
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [summaryResponse, breakdownResponse, monthlyResponse] = await Promise.all([
          fetchTransactionSummary(),
          fetchCategoryBreakdown({ type: 'expense' }),
          fetchMonthlyData(),
        ]);

        setSummary(summaryResponse.data);
        setBreakdownData(breakdownResponse?.data);
        setMonthlyData(monthlyResponse?.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array for mount-only execution

  /**
   * Render pie chart when data and ref are available
   * Includes cleanup to prevent memory leaks
   */
  useEffect(() => {
    if (!loading && breakdownData.length > 0 && pieChartRef.current) {
      const currentRef = pieChartRef.current;
      drawPieChart(currentRef);
      
      return () => {
        d3.select(currentRef).selectAll('*').remove();
      };
    }
  }, [loading, breakdownData, drawPieChart]); // Include drawPieChart in dependencies

  // Type-safe Chart.js data configuration
  const lineChartData: ChartData<'line'> = {
    labels: monthlyData.slice(-6).map((d) => d.month),
    datasets: [
      {
        label: 'Income',
        data: monthlyData.slice(-6).map((d) => d.income),
        borderColor: '#4299E1',
        backgroundColor: 'rgba(66, 153, 225, 0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Expense',
        data: monthlyData.slice(-6).map((d) => d.expense),
        borderColor: '#F56565',
        backgroundColor: 'rgba(245, 101, 101, 0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  // Type-safe Chart.js options configuration
  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: textColor,
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: (context: TooltipItem<'line'>) =>
            `${context.dataset.label}: $${Number(context.raw).toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Month',
          color: textColor,
        },
        ticks: {
          color: textColor,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Amount ($)',
          color: textColor,
        },
        ticks: {
          color: textColor,
          callback: (value: number | string) => `$${Number(value).toFixed(2)}`,
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <AppLayout>
      {/* Loading state with centered spinner */}
      {loading ? (
        <Flex justify="center" align="center" minH="70vh">
          <Spinner size="xl" color="blue.500" thickness="4px" aria-label="Loading dashboard data" />
        </Flex>
      ) : error ? (
        /* Error state with centered message */
        <Flex justify="center" align="center" minH="70vh">
          <Text color="red.500" fontSize="lg">{error}</Text>
        </Flex>
      ) : (
        /* Main content with responsive padding */
        <Box p={{ base: 4, md: 6 }}>
          <Heading as="h2" size="lg" mb={6}>
            Dashboard
          </Heading>
          <Grid
            templateColumns={{ base: '1fr', lg: 'repeat(3, 1fr)' }} // Responsive grid layout
            gap={4}
            mb={8}
          >
            {/* Stat cards for financial overview */}
            <GridItem>
              <Card bg={cardBg} boxShadow="sm" borderRadius="lg" p={4}>
                <CardBody>
                  <Stat>
                    <StatLabel color={textColor}>Total Income</StatLabel>
                    <StatNumber fontSize={{ base: 'xl', md: '2xl' }} color="green.500">
                      ${Number(summary?.total_income || 0).toFixed(2)}
                    </StatNumber>
                    <StatHelpText>Current Period</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </GridItem>
            <GridItem>
              <Card bg={cardBg} boxShadow="sm" borderRadius="lg" p={4}>
                <CardBody>
                  <Stat>
                    <StatLabel color={textColor}>Total Expenses</StatLabel>
                    <StatNumber fontSize={{ base: 'xl', md: '2xl' }} color="red.500">
                      ${Number(summary?.total_expenses || 0).toFixed(2)}
                    </StatNumber>
                    <StatHelpText>Current Period</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </GridItem>
            <GridItem>
              <Card bg={cardBg} boxShadow="sm" borderRadius="lg" p={4}>
                <CardBody>
                  <Stat>
                    <StatLabel color={textColor}>Current Balance</StatLabel>
                    <StatNumber
                      fontSize={{ base: 'xl', md: '2xl' }}
                      color={summary && summary.balance >= 0 ? 'blue.500' : 'red.500'}
                    >
                      ${Number(summary?.balance || 0).toFixed(2)}
                    </StatNumber>
                    <StatHelpText>Income - Expenses</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={6}>
            {/* Expense Breakdown Card with D3 Pie Chart */}
            <Card bg={cardBg} boxShadow="sm" borderRadius="lg" minH={{ base: 'auto', md: '400px' }}>
              <CardHeader pb={0}>
                <Heading size="md">Expense Breakdown</Heading>
                <Text fontSize="sm" color={textColor}>
                  Where your money is going
                </Text>
              </CardHeader>
              <CardBody>
                {breakdownData.length > 0 ? (
                  <Flex direction="column" justify="center" align="center" w="full">
                    <Box as="svg" ref={pieChartRef} w="full" aria-label="Expense Breakdown Pie Chart" />
                    <Flex wrap="wrap" justify="center" mt={4} gap={4}>
                      {breakdownData.map((item, index) => (
                        <Flex key={item.category_name} align="center" minW="150px">
                          <Box
                            w="12px"
                            h="12px"
                            mr={2}
                            bg={d3.schemeSet2[index % d3.schemeSet2.length]}
                          />
                          <Text fontSize="sm">
                            {item.category_name} ({item.percentage}%)
                          </Text>
                        </Flex>
                      ))}
                    </Flex>
                  </Flex>
                ) : (
                  <Flex justify="center" align="center" h="full">
                    <Text color={textColor}>No expense data available</Text>
                  </Flex>
                )}
              </CardBody>
            </Card>

            {/* Monthly Comparison Card with Chart.js Line Chart */}
            <Card bg={cardBg} boxShadow="sm" borderRadius="lg" minH={{ base: 'auto', md: '400px' }}>
              <CardHeader pb={0}>
                <Heading size="md">Monthly Comparison</Heading>
                <Text fontSize="sm" color={textColor}>
                  Income vs Expenses over time
                </Text>
              </CardHeader>
              <CardBody>
                {monthlyData.length > 0 ? (
                  <Box h={{ base: '250px', md: '300px' }} w="full">
                    <Line data={lineChartData} options={lineChartOptions} />
                  </Box>
                ) : (
                  <Flex justify="center" align="center" h="full">
                    <Text color={textColor}>No monthly data available</Text>
                  </Flex>
                )}
              </CardBody>
            </Card>
          </SimpleGrid>
        </Box>
      )}
    </AppLayout>
  );
};

export default DashboardPage;