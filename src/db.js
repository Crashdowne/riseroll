import Dexie from 'dexie';

// Use a more specific database name for better persistence across browsers
const dbName = `RiseRollDB_${typeof window !== 'undefined' ? window.location.origin.replace(/[^a-zA-Z0-9]/g, '_') : 'default'}`;
export const db = new Dexie(dbName);

// Configure Dexie for better Firefox compatibility
db.version(1).stores({
  activities: '++id, name, createdAt, updatedAt',
  settings: '++id, key, value, updatedAt',
  history: '++id, activity, timestamp, date'
});

// Simple database initialization
console.log('Initializing database:', dbName)

// Define the database schema types
export const Activity = {
  id: Number,
  name: String,
  createdAt: Date,
  updatedAt: Date
};

export const Setting = {
  id: Number,
  key: String,
  value: String,
  updatedAt: Date
};

export const HistoryEntry = {
  id: Number,
  activity: String,
  timestamp: Date,
  date: String
};

export default db;
