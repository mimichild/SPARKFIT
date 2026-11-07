import { initDatabase } from '@/providers/DBProvider';

function makeDb(existingColumns: string[]) {
  return {
    execAsync: jest.fn().mockResolvedValue(undefined),
    getAllAsync: jest.fn().mockResolvedValue(existingColumns.map(name => ({ name }))),
  };
}

describe('initDatabase', () => {
  it('adds the calf column to an existing table that lacks it', async () => {
    const db = makeDb(['date', 'weight', 'thigh', 'arm']);

    await initDatabase(db as never);

    expect(db.getAllAsync).toHaveBeenCalledWith('PRAGMA table_info(measurements)');
    expect(db.execAsync).toHaveBeenCalledWith('ALTER TABLE measurements ADD COLUMN calf REAL');
    expect(db.execAsync).toHaveBeenCalledWith('ALTER TABLE measurements ADD COLUMN skeletal_muscle REAL');
    expect(db.execAsync).toHaveBeenCalledWith('ALTER TABLE measurements ADD COLUMN underbust REAL');
  });

  it('adds only the columns that are missing', async () => {
    const db = makeDb(['date', 'weight', 'calf']);

    await initDatabase(db as never);

    expect(db.execAsync).not.toHaveBeenCalledWith('ALTER TABLE measurements ADD COLUMN calf REAL');
    expect(db.execAsync).toHaveBeenCalledWith('ALTER TABLE measurements ADD COLUMN skeletal_muscle REAL');
  });

  it('does not alter the table when calf already exists', async () => {
    const db = makeDb(['date', 'weight', 'thigh', 'calf', 'skeletal_muscle', 'underbust', 'arm']);

    await initDatabase(db as never);

    expect(db.execAsync).not.toHaveBeenCalledWith(expect.stringContaining('ALTER TABLE'));
  });

  it('creates new tables with the calf column', async () => {
    const db = makeDb(['calf']);

    await initDatabase(db as never);

    const createSql = db.execAsync.mock.calls.map(c => c[0]).find((s: string) => s.includes('CREATE TABLE'));
    expect(createSql).toMatch(/calf\s+REAL/);
    expect(createSql).toMatch(/skeletal_muscle\s+REAL/);
    expect(createSql).toMatch(/underbust\s+REAL/);
  });
});
