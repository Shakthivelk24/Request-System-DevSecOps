import { createContext, useState } from "react";
import axios from "axios";
import { useEffect } from "react";

axios.defaults.baseURL = import.meta.env.VITE_API_URL || "/api"; // Set the base URL for axios requests

// Create a context for user data
export const userDataContext = createContext();

export const UserDataProvider = ({ children }) => {
  // Function to fetch current user data from the server

  const handleCurrentUser = async () => {
    try {
      const result = await axios.get(
        `${axios.defaults.baseURL}/requests/current`,
        {
          withCredentials: true,
        },
      );

      console.log("Current User Data:", result.data);
    } catch (error) {
      console.error("Error fetching current user data:", error);
    }
  };
  console.log("Creating UserDataProvider with axios:", axios.defaults.baseURL); // Debugging log
  const value = { axios };

  useEffect(() => {
    handleCurrentUser();
  }, []);

  return (
    <userDataContext.Provider value={value}>
      {children}
    </userDataContext.Provider>
  );
};
