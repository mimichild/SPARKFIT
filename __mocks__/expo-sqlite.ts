const mockDb = {
  execAsync: jest.fn().mockResolvedValue(undefined),
  runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 1, changes: 1 }),
  getAllAsync: jest.fn().mockResolvedValue([]),
  getFirstAsync: jest.fn().mockResolvedValue(null),
};

export const SQLiteProvider = ({ children }: { children: React.ReactNode }) => children;

export const useSQLiteContext = () => mockDb;

export type SQLiteDatabase = typeof mockDb;
