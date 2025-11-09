import React, { createContext, useState, useContext } from 'react';

const OrbitSyncContext = createContext();

export const useOrbitSync = () => useContext(OrbitSyncContext);

export const OrbitSyncProvider = ({ children }) => {
  const [cameraState, setCameraState] = useState({
    position: null,
    target: null,
  });

  return (
    <OrbitSyncContext.Provider value={{ cameraState, setCameraState }}>
      {children}
    </OrbitSyncContext.Provider>
  );
};
