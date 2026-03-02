/**
 * Autonomous Task Router Tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import { autonomousTaskRouter } from "./autonomousTaskRouter";

describe("Autonomous Task Router", () => {
  describe("submitTask", () => {
    it("should have submitTask procedure", () => {
      const procedures = autonomousTaskRouter._def.procedures;
      expect(procedures.submitTask).toBeDefined();
    });
  });

  describe("submitEcosystemCommand", () => {
    it("should have submitEcosystemCommand procedure", () => {
      const procedures = autonomousTaskRouter._def.procedures;
      expect(procedures.submitEcosystemCommand).toBeDefined();
    });
  });

  describe("createGoal", () => {
    it("should have createGoal procedure", () => {
      const procedures = autonomousTaskRouter._def.procedures;
      expect(procedures.createGoal).toBeDefined();
    });
  });

  describe("generatePlan", () => {
    it("should have generatePlan procedure", () => {
      const procedures = autonomousTaskRouter._def.procedures;
      expect(procedures.generatePlan).toBeDefined();
    });
  });

  describe("executePlan", () => {
    it("should have executePlan procedure", () => {
      const procedures = autonomousTaskRouter._def.procedures;
      expect(procedures.executePlan).toBeDefined();
    });
  });

  describe("getStatus", () => {
    it("should have getStatus query", () => {
      const procedures = autonomousTaskRouter._def.procedures;
      expect(procedures.getStatus).toBeDefined();
    });
  });

  describe("getMemoryFacts", () => {
    it("should have getMemoryFacts query", () => {
      const procedures = autonomousTaskRouter._def.procedures;
      expect(procedures.getMemoryFacts).toBeDefined();
    });
  });

  describe("getActivePlans", () => {
    it("should have getActivePlans query", () => {
      const procedures = autonomousTaskRouter._def.procedures;
      expect(procedures.getActivePlans).toBeDefined();
    });
  });

  describe("getCommandHistory", () => {
    it("should have getCommandHistory query", () => {
      const procedures = autonomousTaskRouter._def.procedures;
      expect(procedures.getCommandHistory).toBeDefined();
    });
  });

  describe("getLearnings", () => {
    it("should have getLearnings query", () => {
      const procedures = autonomousTaskRouter._def.procedures;
      expect(procedures.getLearnings).toBeDefined();
    });
  });

  describe("getSuccessRate", () => {
    it("should have getSuccessRate query", () => {
      const procedures = autonomousTaskRouter._def.procedures;
      expect(procedures.getSuccessRate).toBeDefined();
    });
  });

  it("should have all 11 procedures", () => {
    const procedures = autonomousTaskRouter._def.procedures;
    const procedureNames = Object.keys(procedures);

    expect(procedureNames).toContain("submitTask");
    expect(procedureNames).toContain("submitEcosystemCommand");
    expect(procedureNames).toContain("createGoal");
    expect(procedureNames).toContain("generatePlan");
    expect(procedureNames).toContain("executePlan");
    expect(procedureNames).toContain("getStatus");
    expect(procedureNames).toContain("getMemoryFacts");
    expect(procedureNames).toContain("getActivePlans");
    expect(procedureNames).toContain("getCommandHistory");
    expect(procedureNames).toContain("getLearnings");
    expect(procedureNames).toContain("getSuccessRate");

    expect(procedureNames.length).toBe(11);
  });
});
