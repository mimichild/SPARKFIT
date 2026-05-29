import { type ReactNode } from 'react';
import { SQLiteProvider, useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';

import { DB_NAME } from '@/constants';

async function initDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA journal_mode = WAL;');
  // 在這裡加入建表 SQL
}

export function DBProvider({ children }: { children: ReactNode }) {
  return (
    <SQLiteProvider databaseName={DB_NAME} onInit={initDatabase}>
      {children}
    </SQLiteProvider>
  );
}

export function useDBContext(): SQLiteDatabase {
  return useSQLiteContext();
}
