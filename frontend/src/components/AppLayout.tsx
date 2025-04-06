import { ReactNode } from 'react';
import { Box, Flex, Text, IconButton, Link, HStack, useDisclosure, Button, Icon, CloseButton } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMenu, FiHome, FiDollarSign, FiList, FiLogOut } from 'react-icons/fi';

interface NavItemProps {
    to: string;
    icon: React.ElementType;
    children: ReactNode;
}

const NavItem = ({ to, icon, children }: NavItemProps) => {
    const location = useLocation();
    const isActive = location.pathname === to;
    
    return (
        <Link
            as={RouterLink}
            to={to}
            display="flex"
            alignItems="center"
            p={2}
            borderRadius="md"
            fontWeight={isActive ? "bold" : "normal"}
            color={isActive ? "blue.500" : "gray.600"}
            bg={isActive ? "blue.50" : "transparent"}
            _hover={{
                bg: "blue.50",
                color: "blue.500",
            }}
        >
            <Icon as={icon} mr={3} />
            <Text>{children}</Text>
        </Link>
    );
};

interface AppLayoutProps {
    children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { user, logout } = useAuth();
    
    return (
        <Box minH="100vh" bg="gray.50">
            {/* Sidebar for larger screens */}
            <Box
                display={{ base: "none", md: "block" }}
                w="250px"
                boxShadow="md"
                position="fixed"
                h="100vh"
                bg="white"
                zIndex={2}
            >
                <Flex h="20" alignItems="center" px="4" justifyContent="space-between">
                    <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                        Budget Tracker
                    </Text>
                </Flex>
                
                <Box px="4" py="2">
                    <Text fontSize="sm" fontWeight="medium" color="gray.500" mb="2">
                        Welcome, {user?.username}
                    </Text>
                    
                    <Box mt="4">
                        <NavItem to="/dashboard" icon={FiHome}>Dashboard</NavItem>
                        <NavItem to="/transactions" icon={FiList}>Transactions</NavItem>
                        <NavItem to="/budget" icon={FiDollarSign}>Budget</NavItem>
                    </Box>
                    
                    <Button 
                        leftIcon={<FiLogOut />}
                        colorScheme="red"
                        variant="outline"
                        size="sm"
                        width="full"
                        mt="8"
                        onClick={logout}
                    >
                        Logout
                    </Button>
                </Box>
            </Box>
            
            {/* Mobile navbar */}
            <Box
                display={{ base: "block", md: "none" }}
                position="fixed"
                top={0}
                right={0}
                left={0}
                zIndex={1}
                bg="white"
                boxShadow="md"
                p={4}
            >
                <Flex justify="space-between" align="center">
                    <Text fontSize="xl" fontWeight="bold" color="blue.500">
                        Budget Tracker
                    </Text>
                    <IconButton
                        aria-label="Open menu"
                        icon={<FiMenu />}
                        variant="ghost"
                        onClick={onOpen}
                    />
                </Flex>
            </Box>
            
            {/* Mobile sidebar drawer */}
            {isOpen && (
                <Box
                    position="fixed"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    bg="white"
                    zIndex={3}
                    p={4}
                >
                    <Flex justify="space-between" align="center" mb={8}>
                        <Text fontSize="xl" fontWeight="bold" color="blue.500">
                            Budget Tracker
                        </Text>
                        <CloseButton onClick={onClose} />
                    </Flex>
                    
                    <Box>
                        <Text fontSize="sm" fontWeight="medium" color="gray.500" mb="4">
                            Welcome, {user?.username}
                        </Text>
                        
                        <NavItem to="/dashboard" icon={FiHome}>Dashboard</NavItem>
                        <NavItem to="/transactions" icon={FiList}>Transactions</NavItem>
                        <NavItem to="/budget" icon={FiDollarSign}>Budget</NavItem>
                        
                        <Button 
                            leftIcon={<FiLogOut />}
                            colorScheme="red"
                            variant="outline"
                            size="sm"
                            width="full"
                            mt="8"
                            onClick={logout}
                        >
                            Logout
                        </Button>
                    </Box>
                </Box>
            )}
            
            {/* Main content */}
            <Box ml={{ base: 0, md: "250px" }} p={{ base: 4, md: 8 }} pt={{ base: "80px", md: "32px" }}>
                <HStack spacing={4} mb={6} display={{ base: "none", md: "flex" }}>
                    <Text fontSize="2xl" fontWeight="bold">
                        {
                            location.pathname === '/dashboard' ? 'Dashboard' :
                            location.pathname === '/transactions' ? 'Transactions' :
                            location.pathname === '/budget' ? 'Budget Management' : ''
                        }
                    </Text>
                </HStack>
                
                {children}
            </Box>
        </Box>
    );
};

export default AppLayout; 