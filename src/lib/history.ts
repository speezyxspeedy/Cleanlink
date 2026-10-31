/**
 * CleanLink - Local Storage History Manager
 * Stores the last 10 previously cleaned URLs for quick reference and re-copying.
 */

import { CleanResult } from './cleaner';

export interface HistoryItem {
  id: string;
  originalUrl: string;
  cleanUrl: string;
  shortUrl: string;
  markdownLink: string;
  domain: string;
  savedCharacters: number;
  savedPercent: number;
  removedParamsCount: number;
  timestamp: number;
}

const STORAGE_KEY = 'cleanlink_recent_history';
const MAX_HISTORY_ITEMS = 10;

export function getCleanHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.slice(0, MAX_HISTORY_ITEMS);
    }
  } catch (err) {
    console.error('Error reading CleanLink history from localStorage:', err);
  }
  return [];
}

export function saveToCleanHistory(result: CleanResult): HistoryItem[] {
  if (!result || !result.cleanUrl || !result.isValid) {
    return getCleanHistory();
  }

  try {
    const history = getCleanHistory();

    // Deduplicate if identical cleanUrl already exists: remove older instance
    const filtered = history.filter(item => item.cleanUrl !== result.cleanUrl);

    const newItem: HistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      originalUrl: result.originalUrl,
      cleanUrl: result.cleanUrl,
      shortUrl: result.shortUrl || result.cleanUrl,
      markdownLink: result.markdownLink,
      domain: result.domain || 'link',
      savedCharacters: result.savedCharacters || 0,
      savedPercent: result.savedPercent || 0,
      removedParamsCount: result.removedParams ? result.removedParams.length : 0,
      timestamp: Date.now()
    };

    // Prepend to top and cap at MAX_HISTORY_ITEMS (10)
    const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error saving to CleanLink history:', err);
    return getCleanHistory();
  }
}

export function deleteHistoryItem(id: string): HistoryItem[] {
  try {
    const history = getCleanHistory();
    const updated = history.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error deleting CleanLink history item:', err);
    return getCleanHistory();
  }
}

export function clearCleanHistory(): HistoryItem[] {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Error clearing CleanLink history:', err);
  }
  return [];
}

export function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 15) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
