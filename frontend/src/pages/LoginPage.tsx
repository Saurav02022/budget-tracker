import { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  Container,
  Alert,
  AlertIcon,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, isAuthenticated, error, isLoading } = useAuth();

  // Responsive values
  const headingSize = useBreakpointValue({ base: "xl", md: "2xl" });
  const containerPadding = useBreakpointValue({ base: 4, md: 10 });
  const boxPadding = useBreakpointValue({ base: 6, md: 8 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(username, password);
  };

  // If user is already authenticated, redirect to dashboard
  if (isAuthenticated && !isLoading) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <Container
      maxW={{ base: "95%", sm: "90%", md: "xl" }}
      py={containerPadding}
    >
      <Box
        p={boxPadding}
        boxShadow="lg"
        borderRadius="md"
        bg="white"
        mx={{ base: 2, sm: "auto" }}
      >
        <VStack spacing={{ base: 4, md: 6 }} align="stretch">
          <Heading
            textAlign="center"
            mb={{ base: 1, md: 2 }}
            size={headingSize}
          >
            Personal Budget Tracker
          </Heading>
          <Text
            textAlign="center"
            color="gray.600"
            mb={{ base: 4, md: 6 }}
            fontSize={{ base: "sm", md: "md" }}
          >
            Login to manage your finances
          </Text>

          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize={{ base: "sm", md: "md" }}>
                  Username
                </FormLabel>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  size={{ base: "sm", md: "md" }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize={{ base: "sm", md: "md" }}>
                  Password
                </FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  size={{ base: "sm", md: "md" }}
                />
              </FormControl>

              <Button
                colorScheme="blue"
                width="full"
                mt={4}
                type="submit"
                isLoading={isLoading}
                size={{ base: "md", md: "lg" }}
              >
                Login
              </Button>
            </VStack>
          </form>

          <Text
            textAlign="center"
            fontSize={{ base: "xs", md: "sm" }}
            color="gray.500"
            mt={{ base: 2, md: 4 }}
          >
            Demo credentials: demouser / demopassword
          </Text>
        </VStack>
      </Box>
    </Container>
  );
};

export default LoginPage;