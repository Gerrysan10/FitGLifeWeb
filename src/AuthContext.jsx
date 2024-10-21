import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const signIn = (userData) => {
    setUser(userData);
  };

  const signOutC = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOutC }}>
      {children}
    </AuthContext.Provider>
  );
};
