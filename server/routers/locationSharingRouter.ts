import { router, protectedProcedure, publicProcedure } from '../_core/trpc';
import { z } from 'zod';

// In-memory location storage (in production, use database)
const sharedLocations = new Map<string, any>();

export const locationSharingRouter = router({
  /**
   * Share current location with team members
   */
  shareLocation: protectedProcedure
    .input(z.object({
      latitude: z.number(),
      longitude: z.number(),
      accuracy: z.number(),
      teamMemberIds: z.array(z.string()),
      label: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const locationId = `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const locationData = {
          id: locationId,
          userId: ctx.user.id,
          latitude: input.latitude,
          longitude: input.longitude,
          accuracy: input.accuracy,
          label: input.label || 'Shared Location',
          timestamp: new Date(),
          sharedWith: input.teamMemberIds,
        };

        sharedLocations.set(locationId, locationData);

        return {
          success: true,
          locationId,
          sharedWith: input.teamMemberIds.length,
          message: `Location shared with ${input.teamMemberIds.length} team member(s)`,
        };
      } catch (error) {
        console.error('Location sharing error:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to share location',
        };
      }
    }),

  /**
   * Get shared locations for current user
   */
  getSharedLocations: protectedProcedure.query(async ({ ctx }) => {
    try {
      const locations = Array.from(sharedLocations.values()).filter(
        loc => loc.sharedWith.includes(ctx.user.id)
      );

      return {
        success: true,
        locations: locations.map(loc => ({
          id: loc.id,
          userId: loc.userId,
          latitude: loc.latitude,
          longitude: loc.longitude,
          accuracy: loc.accuracy,
          label: loc.label,
          timestamp: loc.timestamp,
        })),
        count: locations.length,
      };
    } catch (error) {
      console.error('Error fetching shared locations:', error);
      return {
        success: false,
        locations: [],
        count: 0,
        error: error instanceof Error ? error.message : 'Failed to fetch locations',
      };
    }
  }),

  /**
   * Get location history for current user
   */
  getLocationHistory: protectedProcedure
    .input(z.object({
      limit: z.number().default(50),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const history = Array.from(sharedLocations.values())
          .filter(loc => loc.userId === ctx.user.id)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, input.limit);

        return {
          success: true,
          history,
        };
      } catch (error) {
        console.error('Error fetching location history:', error);
        return {
          success: false,
          history: [],
          error: error instanceof Error ? error.message : 'Failed to fetch history',
        };
      }
    }),

  /**
   * Delete a shared location
   */
  deleteSharedLocation: protectedProcedure
    .input(z.object({
      locationId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const location = sharedLocations.get(input.locationId);
        
        if (!location || location.userId !== ctx.user.id) {
          return {
            success: false,
            error: 'Location not found or unauthorized',
          };
        }

        sharedLocations.delete(input.locationId);

        return {
          success: true,
          message: 'Location deleted',
        };
      } catch (error) {
        console.error('Error deleting location:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to delete location',
        };
      }
    }),

  /**
   * Get nearby shared locations
   */
  getNearbyLocations: publicProcedure
    .input(z.object({
      latitude: z.number(),
      longitude: z.number(),
      radiusKm: z.number().default(10),
    }))
    .query(async ({ input }) => {
      try {
        // Simple distance calculation (Haversine formula)
        const toRad = (deg: number) => (deg * Math.PI) / 180;
        const R = 6371; // Earth's radius in km

        const nearby = Array.from(sharedLocations.values())
          .map(loc => {
            const dLat = toRad(loc.latitude - input.latitude);
            const dLng = toRad(loc.longitude - input.longitude);
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(input.latitude)) *
                Math.cos(toRad(loc.latitude)) *
                Math.sin(dLng / 2) *
                Math.sin(dLng / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c;

            return { ...loc, distance };
          })
          .filter(loc => loc.distance <= input.radiusKm)
          .sort((a, b) => a.distance - b.distance);

        return {
          success: true,
          locations: nearby,
          count: nearby.length,
        };
      } catch (error) {
        console.error('Error finding nearby locations:', error);
        return {
          success: false,
          locations: [],
          count: 0,
          error: error instanceof Error ? error.message : 'Failed to find nearby locations',
        };
      }
    }),
});
