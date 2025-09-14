import { BrowserProvider, JsonRpcSigner } from 'ethers';
import { DocumentStats, ActivityItem, StorageInfo } from '../types/document.types';

export interface IDocumentService {
  isStorageAvailable(): boolean;
  getDocumentStats(): DocumentStats;
  getRecentActivity(limit: number): ActivityItem[];
  getStorageInfo(): StorageInfo;
}

export class DocumentService implements IDocumentService {
  private provider: BrowserProvider | null;
  private signer: JsonRpcSigner | null;

  constructor(provider: BrowserProvider | null, signer: JsonRpcSigner | null) {
    this.provider = provider;
    this.signer = signer;
  }

  isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  getDocumentStats(): DocumentStats {
    try {
      const stored = localStorage.getItem('documentStats');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          totalDocuments: parsed.totalDocuments || 0,
          verifiedDocuments: parsed.verifiedDocuments || 0,
          pendingDocuments: parsed.pendingDocuments || 0,
          totalVerifications: parsed.totalVerifications || 0,
        };
      }
    } catch (error) {
      console.error('Error parsing document stats:', error);
    }

    return {
      totalDocuments: 0,
      verifiedDocuments: 0,
      pendingDocuments: 0,
      totalVerifications: 0,
    };
  }

  getRecentActivity(limit: number = 10): ActivityItem[] {
    try {
      const stored = localStorage.getItem('recentActivity');
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed.slice(0, limit) : [];
      }
    } catch (error) {
      console.error('Error parsing recent activity:', error);
    }
    return [];
  }

  getStorageInfo(): StorageInfo {
    try {
      if (!this.isStorageAvailable()) {
        return { available: false, used: 0, total: 0 };
      }

      let used = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length;
        }
      }

      // Most browsers allow ~5-10MB for localStorage
      const total = 10 * 1024 * 1024; // 10MB estimate
      
      return {
        available: true,
        used,
        total,
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return { available: false, used: 0, total: 0 };
    }
  }
}
