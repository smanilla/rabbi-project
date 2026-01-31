import { useEffect, useState } from "react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const useAuthBackend = () => {
  const [user, setUser] = useState(null);
  const [regiError, setRegiError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Error parsing saved user:", error);
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const registerNewUser = async (email, password, name) => {
    try {
      setRegiError("");
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
      });

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error("Server error: Invalid response format. Make sure backend is running.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Auto login after registration
      const loginResponse = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      // Check login response is JSON
      const loginContentType = loginResponse.headers.get("content-type");
      if (!loginContentType || !loginContentType.includes("application/json")) {
        const text = await loginResponse.text();
        console.error("Non-JSON login response:", text);
        throw new Error("Server error: Invalid response format. Make sure backend is running.");
      }

      const loginData = await loginResponse.json();

      if (loginResponse.ok && loginData.success) {
        const userData = {
          email: loginData.user.email,
          displayName: loginData.user.name,
          name: loginData.user.name,
          role: loginData.user.role,
        };
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        setRegiError("");
        return Promise.resolve({ user: userData });
      } else {
        throw new Error(loginData.error || "Auto-login failed");
      }
    } catch (error) {
      // Handle network errors
      if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
        setRegiError("Cannot connect to server. Make sure backend is running on " + API_URL);
      } else {
        setRegiError(error.message);
      }
      return Promise.reject(error);
    }
  };

  const processLogin = async (email, password) => {
    try {
      setRegiError("");
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error("Server error: Invalid response format. Make sure backend is running.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (data.success) {
        const userData = {
          email: data.user.email,
          displayName: data.user.name,
          name: data.user.name,
          role: data.user.role,
        };
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        setRegiError("");
        return Promise.resolve({ user: userData });
      } else {
        throw new Error(data.error || "Login failed");
      }
    } catch (error) {
      // Handle network errors
      if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
        setRegiError("Cannot connect to server. Make sure backend is running on " + API_URL);
      } else {
        setRegiError(error.message);
      }
      return Promise.reject(error);
    }
  };

  const logOut = () => {
    setUser(null);
    localStorage.removeItem("user");
    return Promise.resolve();
  };

  const handleUserInfo = async (email, method) => {
    try {
      await fetch(`${API_URL}/addUserInfo`, {
        method: method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch (error) {
      console.error("Error saving user info:", error);
    }
  };

  // Google sign-in (simplified - can be enhanced later)
  const signInUsingGoogle = () => {
    return Promise.reject(
      new Error("Google sign-in not implemented. Please use email/password.")
    );
  };

  return {
    user,
    regiError,
    isLoading,
    setIsLoading,
    logOut,
    signInUsingGoogle,
    handleUserInfo,
    registerNewUser,
    processLogin,
  };
};

export default useAuthBackend;
