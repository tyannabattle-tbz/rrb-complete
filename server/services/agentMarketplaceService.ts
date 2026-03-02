import { db } from '../db';
import { agents, agentConnections } from '../../drizzle/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

export interface MarketplaceService {
  name: string;
  description: string;
  agentId: string;
  price: number;
  currency: string;
  autonomyLevel: number;
  capabilities: string[];
  rating: number;
  reviewCount: number;
  availability: 'available' | 'limited' | 'unavailable';
  responseTime: number;
  successRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceTransaction {
  transactionId: string;
  serviceId: string;
  buyerAgentId: string;
  sellerAgentId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'disputed';
  timestamp: Date;
  completedAt?: Date;
  metadata: Record<string, any>;
}

export interface ServiceReview {
  reviewId: string;
  serviceId: string;
  buyerAgentId: string;
  rating: number;
  comment: string;
  timestamp: Date;
}

export class AgentMarketplaceService {
  /**
   * List all available services in marketplace
   */
  async listServices(filters?: {
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    minAutonomy?: number;
    capability?: string;
    limit?: number;
    offset?: number;
  }): Promise<MarketplaceService[]> {
    try {
      const query = db.query.agents.findMany({
        where: and(
          filters?.minPrice !== undefined ? gte(agents.marketplacePrice, filters.minPrice) : undefined,
          filters?.maxPrice !== undefined ? lte(agents.marketplacePrice, filters.maxPrice) : undefined,
          filters?.minRating !== undefined ? gte(agents.marketplaceRating, filters.minRating) : undefined,
          filters?.minAutonomy !== undefined ? gte(agents.autonomyLevel, filters.minAutonomy) : undefined
        ),
        orderBy: desc(agents.marketplaceRating),
        limit: filters?.limit || 50,
        offset: filters?.offset || 0,
      });

      return query as any;
    } catch (error) {
      console.error('Error listing marketplace services:', error);
      throw new Error('Failed to list marketplace services');
    }
  }

  /**
   * Get service details
   */
  async getService(serviceId: string): Promise<MarketplaceService | null> {
    try {
      const service = await db.query.agents.findFirst({
        where: eq(agents.id, serviceId),
      });

      return service as any;
    } catch (error) {
      console.error('Error getting service details:', error);
      throw new Error('Failed to get service details');
    }
  }

  /**
   * Register service in marketplace
   */
  async registerService(
    agentId: string,
    serviceData: {
      name: string;
      description: string;
      price: number;
      currency: string;
      capabilities: string[];
      responseTime: number;
    }
  ): Promise<MarketplaceService> {
    try {
      const result = await db
        .update(agents)
        .set({
          marketplaceName: serviceData.name,
          marketplaceDescription: serviceData.description,
          marketplacePrice: serviceData.price,
          marketplaceCurrency: serviceData.currency,
          marketplaceCapabilities: JSON.stringify(serviceData.capabilities),
          marketplaceResponseTime: serviceData.responseTime,
          marketplaceAvailability: 'available',
          updatedAt: new Date(),
        })
        .where(eq(agents.id, agentId));

      const updated = await db.query.agents.findFirst({
        where: eq(agents.id, agentId),
      });

      return updated as any;
    } catch (error) {
      console.error('Error registering service:', error);
      throw new Error('Failed to register service');
    }
  }

  /**
   * Create service transaction
   */
  async createTransaction(
    buyerAgentId: string,
    sellerAgentId: string,
    serviceId: string,
    amount: number,
    currency: string,
    metadata?: Record<string, any>
  ): Promise<ServiceTransaction> {
    try {
      const transactionId = `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Verify buyer and seller exist
      const buyer = await db.query.agents.findFirst({
        where: eq(agents.id, buyerAgentId),
      });

      const seller = await db.query.agents.findFirst({
        where: eq(agents.id, sellerAgentId),
      });

      if (!buyer || !seller) {
        throw new Error('Buyer or seller agent not found');
      }

      // Create transaction record
      const transaction: ServiceTransaction = {
        transactionId,
        serviceId,
        buyerAgentId,
        sellerAgentId,
        amount,
        currency,
        status: 'pending',
        timestamp: new Date(),
        metadata: metadata || {},
      };

      // Store transaction (in production, use dedicated transactions table)
      console.log('Transaction created:', transaction);

      return transaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw new Error('Failed to create transaction');
    }
  }

  /**
   * Complete service transaction
   */
  async completeTransaction(transactionId: string): Promise<ServiceTransaction> {
    try {
      const transaction: ServiceTransaction = {
        transactionId,
        serviceId: '',
        buyerAgentId: '',
        sellerAgentId: '',
        amount: 0,
        currency: '',
        status: 'completed',
        timestamp: new Date(),
        completedAt: new Date(),
        metadata: {},
      };

      console.log('Transaction completed:', transaction);
      return transaction;
    } catch (error) {
      console.error('Error completing transaction:', error);
      throw new Error('Failed to complete transaction');
    }
  }

  /**
   * Dispute service transaction
   */
  async disputeTransaction(
    transactionId: string,
    reason: string,
    disputerAgentId: string
  ): Promise<ServiceTransaction> {
    try {
      const transaction: ServiceTransaction = {
        transactionId,
        serviceId: '',
        buyerAgentId: '',
        sellerAgentId: '',
        amount: 0,
        currency: '',
        status: 'disputed',
        timestamp: new Date(),
        metadata: { reason, disputerAgentId },
      };

      console.log('Transaction disputed:', transaction);
      return transaction;
    } catch (error) {
      console.error('Error disputing transaction:', error);
      throw new Error('Failed to dispute transaction');
    }
  }

  /**
   * Submit service review
   */
  async submitReview(
    serviceId: string,
    buyerAgentId: string,
    rating: number,
    comment: string
  ): Promise<ServiceReview> {
    try {
      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      const review: ServiceReview = {
        reviewId: `rev-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        serviceId,
        buyerAgentId,
        rating,
        comment,
        timestamp: new Date(),
      };

      // Update service rating
      const service = await db.query.agents.findFirst({
        where: eq(agents.id, serviceId),
      });

      if (service) {
        const currentRating = (service as any).marketplaceRating || 0;
        const currentReviews = (service as any).marketplaceReviewCount || 0;
        const newRating = (currentRating * currentReviews + rating) / (currentReviews + 1);

        await db
          .update(agents)
          .set({
            marketplaceRating: newRating,
            marketplaceReviewCount: currentReviews + 1,
            updatedAt: new Date(),
          })
          .where(eq(agents.id, serviceId));
      }

      console.log('Review submitted:', review);
      return review;
    } catch (error) {
      console.error('Error submitting review:', error);
      throw new Error('Failed to submit review');
    }
  }

  /**
   * Get service reviews
   */
  async getServiceReviews(serviceId: string, limit = 10): Promise<ServiceReview[]> {
    try {
      // In production, query from reviews table
      return [];
    } catch (error) {
      console.error('Error getting service reviews:', error);
      throw new Error('Failed to get service reviews');
    }
  }

  /**
   * Search marketplace services
   */
  async searchServices(query: string, filters?: any): Promise<MarketplaceService[]> {
    try {
      const services = await db.query.agents.findMany({
        where: and(
          filters?.minPrice !== undefined ? gte(agents.marketplacePrice, filters.minPrice) : undefined,
          filters?.maxPrice !== undefined ? lte(agents.marketplacePrice, filters.maxPrice) : undefined
        ),
        limit: 20,
      });

      return services as any;
    } catch (error) {
      console.error('Error searching services:', error);
      throw new Error('Failed to search services');
    }
  }

  /**
   * Get marketplace statistics
   */
  async getMarketplaceStats(): Promise<{
    totalServices: number;
    totalTransactions: number;
    totalRevenue: number;
    averageRating: number;
    topServices: MarketplaceService[];
  }> {
    try {
      const services = await db.query.agents.findMany({
        limit: 1000,
      });

      const totalServices = services.length;
      const averageRating =
        services.reduce((sum, s) => sum + ((s as any).marketplaceRating || 0), 0) / totalServices || 0;

      return {
        totalServices,
        totalTransactions: 0,
        totalRevenue: 0,
        averageRating,
        topServices: services.slice(0, 5) as any,
      };
    } catch (error) {
      console.error('Error getting marketplace stats:', error);
      throw new Error('Failed to get marketplace statistics');
    }
  }

  /**
   * Get agent's service performance
   */
  async getAgentPerformance(agentId: string): Promise<{
    totalTransactions: number;
    completedTransactions: number;
    failedTransactions: number;
    totalRevenue: number;
    averageRating: number;
    responseTime: number;
    successRate: number;
  }> {
    try {
      const agent = await db.query.agents.findFirst({
        where: eq(agents.id, agentId),
      });

      if (!agent) {
        throw new Error('Agent not found');
      }

      return {
        totalTransactions: 0,
        completedTransactions: 0,
        failedTransactions: 0,
        totalRevenue: 0,
        averageRating: (agent as any).marketplaceRating || 0,
        responseTime: (agent as any).marketplaceResponseTime || 0,
        successRate: 100,
      };
    } catch (error) {
      console.error('Error getting agent performance:', error);
      throw new Error('Failed to get agent performance');
    }
  }
}

export const agentMarketplaceService = new AgentMarketplaceService();
