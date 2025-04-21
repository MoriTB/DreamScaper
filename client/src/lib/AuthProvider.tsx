import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "./queryClient";

interface User {
  id: number;
  username: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  name?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
  updateUserProfile: (user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if user is already logged in on mount
  useEffect(() => {
    // Try to get user from localStorage
    const storedUser = localStorage.getItem("dreamscape-user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user", error);
        localStorage.removeItem("dreamscape-user");
      }
    }
    setIsLoading(false);
  }, []);
  
  const login = async (username: string, password: string) => {
    try {
      const response = await apiRequest("POST", "/api/login", { username, password });
      const userData = await response.json();
      
      // Store user data in localStorage
      localStorage.setItem("dreamscape-user", JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };
  
  const logout = () => {
    // Remove user data from localStorage
    localStorage.removeItem("dreamscape-user");
    setUser(null);
  };
  
  const register = async (data: RegisterData) => {
    try {
      await apiRequest("POST", "/api/register", data);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };
  
  const updateUserProfile = async (updatedUser: User) => {
    // In a real app, you would send this to an API
    // For now, we'll just update localStorage
    try {
      // Here would be an API call to update the user
      // await apiRequest("PATCH", `/api/users/${updatedUser.id}`, updatedUser);
      
      // Update local storage and state
      localStorage.setItem("dreamscape-user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return Promise.resolve();
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error;
    }
  };
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      logout, 
      register,
      updateUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
