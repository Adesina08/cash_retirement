import { createContext, ReactNode, useContext } from 'react';
import { MemoryDataClient } from './memory-client';
import { DataClient } from './data-client';

const client = new MemoryDataClient();

const DataClientContext = createContext<DataClient>(client);

export function DataClientProvider({ children }: { children: ReactNode }) {
  return <DataClientContext.Provider value={client}>{children}</DataClientContext.Provider>;
}

export function useDataClient() {
  return useContext(DataClientContext);
}
