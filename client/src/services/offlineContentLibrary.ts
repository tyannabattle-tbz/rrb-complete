/**
 * Offline Content Library Service
 * Manages emergency procedures, first aid guides, and local resources
 * Persists to IndexedDB for offline access
 */

export interface OfflineContent {
  id: string;
  title: string;
  category: 'emergency-procedure' | 'first-aid' | 'local-resource' | 'mental-health';
  content: string;
  lastUpdated: number;
  size: number; // in bytes
}

export class OfflineContentLibrary {
  private dbName = 'RRB-OfflineContent';
  private storeName = 'content';
  private db: IDBDatabase | null = null;

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
    });
  }

  /**
   * Add content to offline library
   */
  async addContent(content: OfflineContent): Promise<void> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(content);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Get content by ID
   */
  async getContent(id: string): Promise<OfflineContent | null> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  /**
   * Get all content by category
   */
  async getContentByCategory(category: OfflineContent['category']): Promise<OfflineContent[]> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const results = request.result.filter(item => item.category === category);
        resolve(results);
      };
    });
  }

  /**
   * Get all offline content
   */
  async getAllContent(): Promise<OfflineContent[]> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Delete content by ID
   */
  async deleteContent(id: string): Promise<void> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Seed default emergency content
   */
  async seedDefaultContent(): Promise<void> {
    const defaultContent: OfflineContent[] = [
      {
        id: 'emergency-sos',
        title: 'SOS Emergency Response',
        category: 'emergency-procedure',
        content: `# SOS Emergency Response

When you press SOS:
1. Your location is automatically sent to emergency responders
2. A priority alert is broadcast on all channels
3. Responders are assigned based on specialization and availability
4. You will receive confirmation within 30 seconds

**If offline:** Your SOS is queued and will transmit via mesh network to nearby nodes.

**What to expect:**
- Medical responders for health emergencies
- Security responders for safety threats
- Mental health specialists for crisis support

**Stay calm and provide details when responders contact you.**`,
        lastUpdated: Date.now(),
        size: 450,
      },
      {
        id: 'first-aid-cpr',
        title: 'CPR and First Aid',
        category: 'first-aid',
        content: `# CPR and First Aid Guide

## CPR Steps (Cardiopulmonary Resuscitation)

1. **Check Responsiveness** - Tap shoulders and shout
2. **Call for Help** - Use SOS button or call 911
3. **Position** - Place person on firm, flat surface
4. **Hand Position** - Place heel of hand on center of chest
5. **Compressions** - Push hard and fast at 100-120 compressions per minute
6. **Airway** - Tilt head back slightly to open airway
7. **Rescue Breaths** - Give 2 rescue breaths after every 30 compressions

## Continue until:**
- Emergency responders arrive
- Person shows signs of life
- You are too exhausted to continue

## Recovery Position**
- Turn person on their side
- Tilt head back to keep airway open
- Monitor breathing until help arrives`,
        lastUpdated: Date.now(),
        size: 520,
      },
      {
        id: 'mental-health-crisis',
        title: 'Mental Health Crisis Support',
        category: 'mental-health',
        content: `# Mental Health Crisis Support

## If you're in crisis:

1. **Reach out** - Contact a trusted friend, family member, or counselor
2. **Use SOS** - Press the I'm OK button to notify your support network
3. **Ground yourself** - Use the 5-4-3-2-1 technique:
   - 5 things you can see
   - 4 things you can touch
   - 3 things you can hear
   - 2 things you can smell
   - 1 thing you can taste

## Solfeggio Frequencies for Calm:
- **528 Hz** - Healing and love
- **432 Hz** - Deep relaxation
- **639 Hz** - Connection and compassion

## Resources:
- National Crisis Hotline: 988
- Crisis Text Line: Text HOME to 741741
- International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/`,
        lastUpdated: Date.now(),
        size: 480,
      },
      {
        id: 'local-resources',
        title: 'Local Emergency Resources',
        category: 'local-resource',
        content: `# Local Emergency Resources

## Emergency Services:
- **Police:** 911
- **Fire/Ambulance:** 911
- **Poison Control:** 1-800-222-1222

## Hospitals Nearby:
- Check your local area for nearest hospitals
- Use the map feature to locate facilities

## Community Resources:
- Local food banks
- Homeless shelters
- Mental health clinics
- Substance abuse treatment centers

## RRB Community Support:
- Sweet Miracles Foundation: Donations and grants
- Community Empowerment: Local programs
- Emergency Broadcast: Real-time alerts

**Save this page for offline access.**`,
        lastUpdated: Date.now(),
        size: 400,
      },
    ];

    for (const content of defaultContent) {
      await this.addContent(content);
    }
  }

  /**
   * Get total offline content size
   */
  async getTotalSize(): Promise<number> {
    const allContent = await this.getAllContent();
    return allContent.reduce((sum, item) => sum + item.size, 0);
  }

  /**
   * Clear all offline content
   */
  async clearAll(): Promise<void> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

export const offlineContentLibrary = new OfflineContentLibrary();
