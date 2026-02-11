import { CustomSummaryProfile } from '../types';

const STORAGE_KEY = 'stokemeet_custom_profiles';
const DEFAULT_PROFILE_KEY = 'stokemeet_default_profile';

export const customProfileService = {
  /**
   * Get the default profile ID
   */
  getDefaultProfileId(): string {
    return localStorage.getItem(DEFAULT_PROFILE_KEY) || 'General';
  },

  /**
   * Set the default profile ID
   */
  setDefaultProfileId(id: string): void {
    localStorage.setItem(DEFAULT_PROFILE_KEY, id);
  },

  /**
   * Get all custom profiles from local storage
   */
  getProfiles(): CustomSummaryProfile[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading custom profiles:', error);
      return [];
    }
  },

  /**
   * Get a specific profile by ID
   */
  getProfile(id: string): CustomSummaryProfile | null {
    const profiles = this.getProfiles();
    return profiles.find(p => p.id === id) || null;
  },

  /**
   * Save a new profile
   */
  saveProfile(profile: Omit<CustomSummaryProfile, 'id' | 'createdAt' | 'updatedAt'>): CustomSummaryProfile {
    const profiles = this.getProfiles();
    const now = new Date().toISOString();
    const newProfile: CustomSummaryProfile = {
      ...profile,
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now
    };
    
    profiles.push(newProfile);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    return newProfile;
  },

  /**
   * Update an existing profile
   */
  updateProfile(id: string, updates: Partial<Omit<CustomSummaryProfile, 'id' | 'createdAt'>>): CustomSummaryProfile | null {
    const profiles = this.getProfiles();
    const index = profiles.findIndex(p => p.id === id);
    
    if (index === -1) {
      console.error(`Profile with id ${id} not found`);
      return null;
    }

    const updated: CustomSummaryProfile = {
      ...profiles[index],
      ...updates,
      id: profiles[index].id,
      createdAt: profiles[index].createdAt,
      updatedAt: new Date().toISOString()
    };

    profiles[index] = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    return updated;
  },

  /**
   * Delete a profile
   */
  deleteProfile(id: string): boolean {
    const profiles = this.getProfiles();
    const filtered = profiles.filter(p => p.id !== id);
    
    if (filtered.length === profiles.length) {
      console.warn(`Profile with id ${id} not found`);
      return false;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },

  /**
   * Export profiles as JSON
   */
  exportProfiles(): string {
    const profiles = this.getProfiles();
    return JSON.stringify(profiles, null, 2);
  },

  /**
   * Import profiles from JSON
   */
  importProfiles(json: string): CustomSummaryProfile[] {
    try {
      const profiles = JSON.parse(json);
      if (!Array.isArray(profiles)) {
        throw new Error('Invalid format: expected array of profiles');
      }

      // Validate profile structure
      profiles.forEach((p, i) => {
        if (!p.id || !p.name || !p.systemPrompt) {
          throw new Error(`Profile at index ${i} is missing required fields`);
        }
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
      return profiles;
    } catch (error) {
      console.error('Error importing profiles:', error);
      throw error;
    }
  }
};
