import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface QueuedPhoto {
  id: string;
  projectId: string;
  organizationId: string;
  uploadedBy: string;
  file: Blob;
  fileName: string;
  fileSize: number;
  mimeType: string;
  caption?: string;
  notes?: string;
  isBeforePhoto: boolean;
  isAfterPhoto: boolean;
  roomType?: string;
  locationLat?: number;
  locationLng?: number;
  timestamp: number;
}

interface OfflineQueueDB extends DBSchema {
  'photo-queue': {
    key: string;
    value: QueuedPhoto;
  };
}

let db: IDBPDatabase<OfflineQueueDB> | null = null;

async function getDB() {
  if (db) return db;

  db = await openDB<OfflineQueueDB>('offline-photo-queue', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('photo-queue')) {
        db.createObjectStore('photo-queue', { keyPath: 'id' });
      }
    },
  });

  return db;
}

export async function addToQueue(photo: Omit<QueuedPhoto, 'id' | 'timestamp'>) {
  const database = await getDB();
  const id = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  
  await database.add('photo-queue', {
    ...photo,
    id,
    timestamp: Date.now(),
  });

  return id;
}

export async function getQueue(): Promise<QueuedPhoto[]> {
  const database = await getDB();
  return database.getAll('photo-queue');
}

export async function removeFromQueue(id: string) {
  const database = await getDB();
  await database.delete('photo-queue', id);
}

export async function clearQueue() {
  const database = await getDB();
  await database.clear('photo-queue');
}

export async function getQueueCount(): Promise<number> {
  const database = await getDB();
  return database.count('photo-queue');
}

export function isOnline(): boolean {
  return navigator.onLine;
}

export function onOnlineStatusChange(callback: (online: boolean) => void) {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}
