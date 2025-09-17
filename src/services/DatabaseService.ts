import * as SQLite from 'expo-sqlite';
import { Pet, Log, User, Task, Streak } from '../types';

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async init() {
    try {
      this.db = await SQLite.openDatabaseAsync('catable.db');
      await this.createTables();
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }

  private async createTables() {
    if (!this.db) return;

    // Users table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        displayName TEXT NOT NULL,
        region TEXT NOT NULL,
        language TEXT NOT NULL,
        isGuest INTEGER NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);

    // Pets table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS pets (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        name TEXT NOT NULL,
        avatar TEXT,
        breed TEXT NOT NULL,
        age INTEGER NOT NULL,
        gender TEXT NOT NULL,
        personality TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users (id)
      );
    `);

    // Logs table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS logs (
        id TEXT PRIMARY KEY,
        petId TEXT NOT NULL,
        logTypeId TEXT NOT NULL,
        value TEXT NOT NULL,
        notes TEXT,
        loggedAt TEXT NOT NULL,
        synced INTEGER NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (petId) REFERENCES pets (id)
      );
    `);

    // Tasks table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        petId TEXT NOT NULL,
        logTypeId TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        isCompleted INTEGER NOT NULL DEFAULT 0,
        dueDate TEXT NOT NULL,
        completedAt TEXT,
        FOREIGN KEY (petId) REFERENCES pets (id)
      );
    `);

    // Streaks table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS streaks (
        id TEXT PRIMARY KEY,
        petId TEXT NOT NULL,
        currentStreak INTEGER NOT NULL DEFAULT 0,
        longestStreak INTEGER NOT NULL DEFAULT 0,
        lastLoggedAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (petId) REFERENCES pets (id)
      );
    `);
  }

  // User operations
  async saveUser(user: User): Promise<void> {
    if (!this.db) return;

    await this.db.runAsync(
      `INSERT OR REPLACE INTO users (id, email, displayName, region, language, isGuest, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user.id, user.email, user.displayName, user.region, user.language, user.isGuest ? 1 : 0, user.createdAt.toISOString(), user.updatedAt.toISOString()]
    );
  }

  async getUser(id: string): Promise<User | null> {
    if (!this.db) return null;

    const result = await this.db.getFirstAsync(
      `SELECT * FROM users WHERE id = ?`,
      [id]
    ) as any;

    if (!result) return null;

    return {
      ...result,
      isGuest: result.isGuest === 1,
      createdAt: new Date(result.createdAt),
      updatedAt: new Date(result.updatedAt),
    };
  }

  // Pet operations
  async savePet(pet: Pet): Promise<void> {
    if (!this.db) return;

    await this.db.runAsync(
      `INSERT OR REPLACE INTO pets (id, userId, name, avatar, breed, age, gender, personality, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [pet.id, pet.userId, pet.name, pet.avatar || null, pet.breed, pet.age, pet.gender, pet.personality, pet.createdAt.toISOString(), pet.updatedAt.toISOString()]
    );
  }

  async getPets(userId: string): Promise<Pet[]> {
    if (!this.db) return [];

    const result = await this.db.getAllAsync(
      `SELECT * FROM pets WHERE userId = ? ORDER BY createdAt DESC`,
      [userId]
    ) as any[];

    return result.map(pet => ({
      ...pet,
      createdAt: new Date(pet.createdAt),
      updatedAt: new Date(pet.updatedAt),
    }));
  }

  async deletePet(petId: string): Promise<void> {
    if (!this.db) return;

    await this.db.runAsync(`DELETE FROM pets WHERE id = ?`, [petId]);
    await this.db.runAsync(`DELETE FROM logs WHERE petId = ?`, [petId]);
    await this.db.runAsync(`DELETE FROM tasks WHERE petId = ?`, [petId]);
    await this.db.runAsync(`DELETE FROM streaks WHERE petId = ?`, [petId]);
  }

  // Log operations
  async saveLog(log: Log): Promise<void> {
    if (!this.db) return;

    await this.db.runAsync(
      `INSERT OR REPLACE INTO logs (id, petId, logTypeId, value, notes, loggedAt, synced, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [log.id, log.petId, log.logTypeId, log.value.toString(), log.notes || null, log.loggedAt.toISOString(), log.synced ? 1 : 0, log.createdAt.toISOString()]
    );
  }

  async getLogs(petId: string, limit?: number): Promise<Log[]> {
    if (!this.db) return [];

    const limitClause = limit ? `LIMIT ${limit}` : '';
    const result = await this.db.getAllAsync(
      `SELECT * FROM logs WHERE petId = ? ORDER BY loggedAt DESC ${limitClause}`,
      [petId]
    ) as any[];

    return result.map(log => ({
      ...log,
      loggedAt: new Date(log.loggedAt),
      createdAt: new Date(log.createdAt),
      synced: log.synced === 1,
    }));
  }

  async getUnsyncedLogs(): Promise<Log[]> {
    if (!this.db) return [];

    const result = await this.db.getAllAsync(
      `SELECT * FROM logs WHERE synced = 0 ORDER BY createdAt ASC`
    ) as any[];

    return result.map(log => ({
      ...log,
      loggedAt: new Date(log.loggedAt),
      createdAt: new Date(log.createdAt),
      synced: log.synced === 1,
    }));
  }

  async markLogAsSynced(logId: string): Promise<void> {
    if (!this.db) return;

    await this.db.runAsync(
      `UPDATE logs SET synced = 1 WHERE id = ?`,
      [logId]
    );
  }

  // Task operations
  async saveTask(task: Task): Promise<void> {
    if (!this.db) return;

    await this.db.runAsync(
      `INSERT OR REPLACE INTO tasks (id, petId, logTypeId, title, description, isCompleted, dueDate, completedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [task.id, task.petId, task.logTypeId, task.title, task.description, task.isCompleted ? 1 : 0, task.dueDate.toISOString(), task.completedAt?.toISOString() || null]
    );
  }

  async getTasks(petId: string): Promise<Task[]> {
    if (!this.db) return [];

    const result = await this.db.getAllAsync(
      `SELECT * FROM tasks WHERE petId = ? ORDER BY dueDate ASC`,
      [petId]
    ) as any[];

    return result.map(task => ({
      ...task,
      isCompleted: task.isCompleted === 1,
      dueDate: new Date(task.dueDate),
      completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
    }));
  }

  // Streak operations
  async saveStreak(streak: Streak): Promise<void> {
    if (!this.db) return;

    await this.db.runAsync(
      `INSERT OR REPLACE INTO streaks (id, petId, currentStreak, longestStreak, lastLoggedAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [streak.id, streak.petId, streak.currentStreak, streak.longestStreak, streak.lastLoggedAt.toISOString(), streak.updatedAt.toISOString()]
    );
  }

  async getStreak(petId: string): Promise<Streak | null> {
    if (!this.db) return null;

    const result = await this.db.getFirstAsync(
      `SELECT * FROM streaks WHERE petId = ?`,
      [petId]
    ) as any;

    if (!result) return null;

    return {
      ...result,
      lastLoggedAt: new Date(result.lastLoggedAt),
      updatedAt: new Date(result.updatedAt),
    };
  }

  // Utility methods
  async clearAllData(): Promise<void> {
    if (!this.db) return;

    await this.db.execAsync(`DELETE FROM logs`);
    await this.db.execAsync(`DELETE FROM tasks`);
    await this.db.execAsync(`DELETE FROM streaks`);
    await this.db.execAsync(`DELETE FROM pets`);
    await this.db.execAsync(`DELETE FROM users`);
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }
}

export default new DatabaseService();
