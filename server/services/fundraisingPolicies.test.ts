import { describe, it, expect, beforeEach } from "vitest";
import {
  DonorOutreachPolicy,
  GrantApplicationPolicy,
  EmergencyAlertPriorityPolicy,
  FundraisingCampaignPolicy,
  WellnessCheckInPolicy,
} from "./fundraisingPolicies";

describe("Sweet Miracles Fundraising Policies", () => {
  describe("DonorOutreachPolicy", () => {
    it("should determine outreach for overdue platinum donor", async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await DonorOutreachPolicy.evaluateOutreach({
        donorId: 1,
        donorTier: "platinum",
        lastContactDate: thirtyDaysAgo,
        totalDonated: 10000,
        donationFrequency: 14,
        campaignUrgency: "high",
        seasonalFactor: 0.8,
      });

      expect(result.shouldOutreach).toBe(true);
      expect(result.priority).toBe("high");
      expect(result.recommendedChannel).toBe("phone");
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it("should recommend email for gold tier donor", async () => {
      const fifteenDaysAgo = new Date();
      fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

      const result = await DonorOutreachPolicy.evaluateOutreach({
        donorId: 2,
        donorTier: "gold",
        lastContactDate: fifteenDaysAgo,
        totalDonated: 2500,
        donationFrequency: 30,
        campaignUrgency: "medium",
        seasonalFactor: 0.5,
      });

      expect(result.recommendedChannel).toBe("email");
      expect(result.priority).toMatch(/low|medium|high/);
    });

    it("should execute outreach decision", async () => {
      const decision = {
        shouldOutreach: true,
        priority: "high" as const,
        recommendedChannel: "phone" as const,
        message: "Test outreach",
        confidence: 0.8,
      };

      const result = await DonorOutreachPolicy.executeOutreach(1, decision);

      expect(result.success).toBe(true);
      expect(result.policyId).toBe("donor_outreach_policy");
      expect(result.action.donorId).toBe(1);
    });
  });

  describe("GrantApplicationPolicy", () => {
    it("should prioritize high-match grant with near deadline", async () => {
      const twoWeeksAway = new Date();
      twoWeeksAway.setDate(twoWeeksAway.getDate() + 14);

      const result = await GrantApplicationPolicy.evaluateGrantPriority({
        grantId: 1,
        matchScore: 0.9,
        fundingAmount: 500000,
        deadline: twoWeeksAway,
        organizationalCapacity: 0.7,
        fundingGap: 100000,
        applicationComplexity: "medium",
      });

      expect(result.shouldApply).toBe(true);
      expect(result.priority).toMatch(/medium|high|critical/);
      expect(result.estimatedROI).toBeGreaterThan(0);
    });

    it("should not recommend low-match grant", async () => {
      const twoMonthsAway = new Date();
      twoMonthsAway.setDate(twoMonthsAway.getDate() + 60);

      const result = await GrantApplicationPolicy.evaluateGrantPriority({
        grantId: 2,
        matchScore: 0.2,
        fundingAmount: 50000,
        deadline: twoMonthsAway,
        organizationalCapacity: 0.5,
        fundingGap: 10000,
        applicationComplexity: "high",
      });

      expect(result.shouldApply).toBe(false);
      expect(result.priority).toBe("low");
    });

    it("should execute grant application decision", async () => {
      const decision = {
        shouldApply: true,
        priority: "high" as const,
        estimatedROI: 50000,
        recommendedApplicationDate: new Date(),
        confidence: 0.85,
      };

      const result = await GrantApplicationPolicy.executeGrantApplication(1, decision);

      expect(result.success).toBe(true);
      expect(result.policyId).toBe("grant_application_policy");
    });
  });

  describe("EmergencyAlertPriorityPolicy", () => {
    it("should mark critical alert with high impact", async () => {
      const result = await EmergencyAlertPriorityPolicy.evaluateAlertPriority({
        alertId: 1,
        severity: "critical",
        affectedPopulation: 50000,
        affectedRegions: ["TX", "OK", "AR"],
        responseTimeRequired: "immediate",
        broadcastChannels: ["sms", "email", "app_notification", "radio"],
        estimatedImpact: 0.95,
      });

      expect(result.priority).toBe("critical");
      expect(result.escalationRequired).toBe(true);
      expect(result.recommendedChannels.length).toBeGreaterThan(0);
    });

    it("should recommend subset of channels for medium priority", async () => {
      const result = await EmergencyAlertPriorityPolicy.evaluateAlertPriority({
        alertId: 2,
        severity: "medium",
        affectedPopulation: 5000,
        affectedRegions: ["TX"],
        responseTimeRequired: "standard",
        broadcastChannels: ["sms", "email", "app_notification"],
        estimatedImpact: 0.5,
      });

      expect(result.priority).toMatch(/low|medium/);
      expect(result.escalationRequired).toBe(false);
      expect(result.recommendedChannels.length).toBeGreaterThanOrEqual(1);
    });

    it("should estimate reach time based on channels and population", async () => {
      const result = await EmergencyAlertPriorityPolicy.evaluateAlertPriority({
        alertId: 3,
        severity: "high",
        affectedPopulation: 100000,
        affectedRegions: ["TX", "OK"],
        responseTimeRequired: "urgent",
        broadcastChannels: ["sms", "email", "app_notification"],
        estimatedImpact: 0.8,
      });

      expect(result.estimatedReachTime).toBeGreaterThan(0);
      expect(typeof result.estimatedReachTime).toBe("number");
    });

    it("should execute alert prioritization decision", async () => {
      const decision = {
        priority: "critical" as const,
        recommendedChannels: ["sms", "email"],
        escalationRequired: true,
        estimatedReachTime: 15,
        confidence: 0.9,
      };

      const result = await EmergencyAlertPriorityPolicy.executeAlertPrioritization(1, decision);

      expect(result.success).toBe(true);
      expect(result.priority).toBe("critical");
    });
  });

  describe("FundraisingCampaignPolicy", () => {
    it("should launch campaign during high season with urgent need", async () => {
      const result = await FundraisingCampaignPolicy.evaluateCampaignTiming({
        campaignId: 1,
        campaignType: "emergency",
        fundingGoal: 100000,
        currentFunding: 10000,
        targetAudience: ["platinum", "gold"],
        seasonalFactor: 0.9,
        urgency: "critical",
        estimatedDuration: 30,
      });

      expect(result.shouldLaunch).toBe(true);
      expect(result.targetDonorTiers).toContain("platinum");
      expect(result.estimatedReachRate).toBeGreaterThan(0.3);
    });

    it("should not launch if funding goal nearly met", async () => {
      const result = await FundraisingCampaignPolicy.evaluateCampaignTiming({
        campaignId: 2,
        campaignType: "ongoing",
        fundingGoal: 50000,
        currentFunding: 48000,
        targetAudience: ["silver", "bronze"],
        seasonalFactor: 0.3,
        urgency: "low",
        estimatedDuration: 60,
      });

      expect(result.shouldLaunch).toBe(false);
    });

    it("should execute campaign launch decision", async () => {
      const decision = {
        shouldLaunch: true,
        recommendedLaunchDate: new Date(),
        targetDonorTiers: ["platinum", "gold"],
        estimatedReachRate: 0.65,
        confidence: 0.8,
      };

      const result = await FundraisingCampaignPolicy.executeCampaignLaunch(1, decision);

      expect(result.success).toBe(true);
      expect(result.policyId).toBe("fundraising_campaign_policy");
    });
  });

  describe("WellnessCheckInPolicy", () => {
    it("should schedule critical priority check-in for high-risk senior", async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const result = await WellnessCheckInPolicy.evaluateCheckInSchedule({
        seniorId: 1,
        lastCheckInDate: sevenDaysAgo,
        checkInFrequency: 3,
        riskLevel: "critical",
        responseRate: 0.5,
        preferredContactMethod: "phone",
      });

      expect(result.shouldSchedule).toBe(true);
      expect(result.priority).toBe("critical");
      expect(result.escalationRequired).toBe(true);
    });

    it("should schedule medium priority for medium-risk senior", async () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const result = await WellnessCheckInPolicy.evaluateCheckInSchedule({
        seniorId: 2,
        lastCheckInDate: twoDaysAgo,
        checkInFrequency: 7,
        riskLevel: "medium",
        responseRate: 0.8,
        preferredContactMethod: "email",
      });

      expect(result.priority).toMatch(/low|medium|high|critical/);
      expect(result.contactMethod).toBe("email");
    });

    it("should execute check-in scheduling decision", async () => {
      const decision = {
        shouldSchedule: true,
        priority: "high" as const,
        recommendedCheckInDate: new Date(),
        contactMethod: "phone",
        escalationRequired: true,
        confidence: 0.85,
      };

      const result = await WellnessCheckInPolicy.executeCheckInScheduling(1, decision);

      expect(result.success).toBe(true);
      expect(result.priority).toBe("high");
    });
  });

  describe("Policy Integration", () => {
    it("should handle multiple concurrent policy evaluations", async () => {
      const donorResult = await DonorOutreachPolicy.evaluateOutreach({
        donorId: 1,
        donorTier: "gold",
        lastContactDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        totalDonated: 2500,
        donationFrequency: 30,
        campaignUrgency: "high",
        seasonalFactor: 0.7,
      });

      const grantResult = await GrantApplicationPolicy.evaluateGrantPriority({
        grantId: 1,
        matchScore: 0.85,
        fundingAmount: 250000,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        organizationalCapacity: 0.6,
        fundingGap: 50000,
        applicationComplexity: "medium",
      });

      const alertResult = await EmergencyAlertPriorityPolicy.evaluateAlertPriority({
        alertId: 1,
        severity: "high",
        affectedPopulation: 25000,
        affectedRegions: ["TX"],
        responseTimeRequired: "urgent",
        broadcastChannels: ["sms", "email"],
        estimatedImpact: 0.75,
      });

      expect(donorResult.shouldOutreach).toBeDefined();
      expect(grantResult.shouldApply).toBeDefined();
      expect(alertResult.priority).toBeDefined();
    });

    it("should maintain policy isolation", async () => {
      const policy1 = await DonorOutreachPolicy.evaluateOutreach({
        donorId: 1,
        donorTier: "platinum",
        lastContactDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        totalDonated: 15000,
        donationFrequency: 14,
        campaignUrgency: "critical",
        seasonalFactor: 0.9,
      });

      const policy2 = await DonorOutreachPolicy.evaluateOutreach({
        donorId: 2,
        donorTier: "bronze",
        lastContactDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        totalDonated: 100,
        donationFrequency: 90,
        campaignUrgency: "low",
        seasonalFactor: 0.2,
      });

      expect(policy1.priority).not.toBe(policy2.priority);
      expect(policy1.recommendedChannel).not.toBe(policy2.recommendedChannel);
    });
  });

  describe("Policy Decision Execution", () => {
    it("should return proper result structure", async () => {
      const decision = {
        shouldOutreach: true,
        priority: "high" as const,
        recommendedChannel: "email" as const,
        message: "Test",
        confidence: 0.8,
      };

      const result = await DonorOutreachPolicy.executeOutreach(1, decision);

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("action");
      expect(result).toHaveProperty("policyId");
      expect(result.success).toBe(true);
    });

    it("should include action metadata in execution result", async () => {
      const decision = {
        shouldApply: true,
        priority: "critical" as const,
        estimatedROI: 100000,
        recommendedApplicationDate: new Date(),
        confidence: 0.9,
      };

      const result = await GrantApplicationPolicy.executeGrantApplication(5, decision);

      expect(result.action).toHaveProperty("type");
      expect(result.action).toHaveProperty("grantId");
      expect(result.action.grantId).toBe(5);
    });
  });
});
