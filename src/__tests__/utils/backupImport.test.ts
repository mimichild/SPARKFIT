import {
  BackupFormatError,
  describeImportError,
  importMeasurements,
  parseBackup,
} from '@/utils/backupImport';

function makeDb(overrides: Partial<Record<'runAsync', jest.Mock>> = {}) {
  const db = {
    runAsync: overrides.runAsync ?? jest.fn().mockResolvedValue({ changes: 1 }),
    withTransactionAsync: jest.fn(async (task: () => Promise<void>) => {
      await task();
    }),
  };
  return db;
}

describe('parseBackup', () => {
  it('returns the parsed backup when measurements is an array', () => {
    const backup = parseBackup(JSON.stringify({ measurements: [{ date: '2026-11-01', weight: 60 }] }));
    expect(backup.measurements).toHaveLength(1);
  });

  it('throws BackupFormatError for invalid JSON', () => {
    expect(() => parseBackup('not json')).toThrow(BackupFormatError);
  });

  it('throws BackupFormatError when measurements is missing', () => {
    expect(() => parseBackup(JSON.stringify({ foo: 1 }))).toThrow(BackupFormatError);
  });
});

describe('importMeasurements', () => {
  it('runs the overwrite delete and all inserts inside one transaction', async () => {
    const db = makeDb();
    const calls: string[] = [];
    db.runAsync.mockImplementation(async (sql: string) => {
      calls.push(db.withTransactionAsync.mock.calls.length ? 'in-tx' : 'outside');
      return { changes: 1 };
    });

    await importMeasurements(db as never, [{ date: '2026-11-01', weight: 60 }], 'overwrite');

    expect(db.withTransactionAsync).toHaveBeenCalledTimes(1);
    expect(db.runAsync.mock.calls[0][0]).toBe('DELETE FROM measurements');
    expect(db.runAsync).toHaveBeenCalledTimes(2);
    expect(calls).toEqual(['in-tx', 'in-tx']);
  });

  it('does not delete existing data in merge mode', async () => {
    const db = makeDb();
    await importMeasurements(db as never, [{ date: '2026-11-01' }], 'merge');
    expect(db.runAsync).not.toHaveBeenCalledWith('DELETE FROM measurements');
  });

  it('propagates insert errors so the transaction rolls back', async () => {
    const db = makeDb({ runAsync: jest.fn().mockRejectedValue(new Error('boom')) });
    await expect(
      importMeasurements(db as never, [{ date: '2026-11-01' }], 'overwrite'),
    ).rejects.toThrow('boom');
  });

  it('skips records without a valid date and reports counts', async () => {
    const db = makeDb();
    const result = await importMeasurements(
      db as never,
      [{ date: '2026-11-01', weight: 60 }, { weight: 61 }, null, { date: '' }],
      'merge',
    );
    expect(result).toEqual({ imported: 1, skipped: 3 });
    expect(db.runAsync).toHaveBeenCalledTimes(1);
  });

  it('binds missing fields as null and keeps the date first', async () => {
    const db = makeDb();
    await importMeasurements(db as never, [{ date: '2026-11-01', weight: 60 }], 'merge');
    const params = db.runAsync.mock.calls[0][1] as unknown[];
    expect(params[0]).toBe('2026-11-01');
    expect(params[1]).toBe(60);
    expect(params.slice(2).every(v => v === null)).toBe(true);
  });

  it('reports progress per record', async () => {
    const db = makeDb();
    const onProgress = jest.fn();
    await importMeasurements(db as never, [{ date: 'a' }, { date: 'b' }], 'merge', onProgress);
    expect(onProgress).toHaveBeenLastCalledWith(2, 2);
  });
});

describe('describeImportError', () => {
  it('uses the format message for format errors', () => {
    expect(describeImportError(new BackupFormatError('x'))).toBe('請確認檔案格式是否正確');
  });

  it('includes the real error message for other errors', () => {
    const msg = describeImportError(new Error('database is locked'));
    expect(msg).toContain('database is locked');
    expect(msg).toContain('原本的資料沒有變動');
  });
});
