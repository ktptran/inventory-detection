import React, { createContext } from 'react';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  return <UserContext.Provider>{children}</UserContext.Provider>;
};

export default UserContext;
