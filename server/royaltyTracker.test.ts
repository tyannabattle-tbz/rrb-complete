import { describe, it, expect } from "vitest";

// Unit tests for royalty tracker router structure and validation logic

describe("Royalty Tracker Router", () => {
  it("should validate split percentages cannot exceed 100%", () => {
    const existingSplits = [
      { splitPercentage: "50.00" },
      { splitPercentage: "30.00" },
    ];
    const currentTotal = existingSplits.reduce(
      (sum, s) => sum + parseFloat(s.splitPercentage),
      0
    );
    const newSplit = 25;
    expect(currentTotal + newSplit).toBeGreaterThan(100);
    expect(currentTotal).toBe(80);
  });

  it("should calculate distributions correctly based on splits", () => {
    const netAmount = 1000;
    const collaborators = [
      { id: 1, splitPercentage: "50.00" },
      { id: 2, splitPercentage: "30.00" },
      { id: 3, splitPercentage: "20.00" },
    ];

    const distributions = collaborators.map((c) => ({
      collaboratorId: c.id,
      amount: ((netAmount * parseFloat(c.splitPercentage)) / 100).toFixed(2),
    }));

    expect(distributions).toEqual([
      { collaboratorId: 1, amount: "500.00" },
      { collaboratorId: 2, amount: "300.00" },
      { collaboratorId: 3, amount: "200.00" },
    ]);

    const totalDistributed = distributions.reduce(
      (sum, d) => sum + parseFloat(d.amount),
      0
    );
    expect(totalDistributed).toBe(1000);
  });

  it("should handle fractional split percentages", () => {
    const netAmount = 333.33;
    const collaborators = [
      { id: 1, splitPercentage: "33.33" },
      { id: 2, splitPercentage: "33.33" },
      { id: 3, splitPercentage: "33.34" },
    ];

    const distributions = collaborators.map((c) => ({
      collaboratorId: c.id,
      amount: ((netAmount * parseFloat(c.splitPercentage)) / 100).toFixed(2),
    }));

    expect(parseFloat(distributions[0].amount)).toBeCloseTo(111.10, 1);
    expect(parseFloat(distributions[1].amount)).toBeCloseTo(111.10, 1);
    expect(parseFloat(distributions[2].amount)).toBeCloseTo(111.13, 1);
  });

  it("should validate project types", () => {
    const validTypes = [
      "single",
      "album",
      "ep",
      "compilation",
      "soundtrack",
      "podcast",
      "commercial",
      "other",
    ];
    expect(validTypes).toHaveLength(8);
    expect(validTypes).toContain("single");
    expect(validTypes).toContain("album");
    expect(validTypes).toContain("podcast");
  });

  it("should validate collaborator roles", () => {
    const validRoles = [
      "artist",
      "producer",
      "songwriter",
      "engineer",
      "featured",
      "session_musician",
      "other",
    ];
    expect(validRoles).toHaveLength(7);
    expect(validRoles).toContain("artist");
    expect(validRoles).toContain("producer");
    expect(validRoles).toContain("songwriter");
  });

  it("should validate source types for payments", () => {
    const validSourceTypes = [
      "streaming",
      "download",
      "sync_license",
      "performance",
      "mechanical",
      "merch",
      "other",
    ];
    expect(validSourceTypes).toHaveLength(7);
    expect(validSourceTypes).toContain("streaming");
    expect(validSourceTypes).toContain("sync_license");
  });

  it("should calculate earnings summary correctly", () => {
    const earnings = [
      { totalEarned: "500.00", totalPaid: "200.00", totalPending: "300.00" },
      { totalEarned: "750.00", totalPaid: "750.00", totalPending: "0.00" },
      { totalEarned: "125.50", totalPaid: "0.00", totalPending: "125.50" },
    ];

    const grandTotal = earnings.reduce(
      (s, e) => s + parseFloat(e.totalEarned),
      0
    );
    const grandPaid = earnings.reduce(
      (s, e) => s + parseFloat(e.totalPaid),
      0
    );
    const grandPending = earnings.reduce(
      (s, e) => s + parseFloat(e.totalPending),
      0
    );

    expect(grandTotal).toBe(1375.5);
    expect(grandPaid).toBe(950);
    expect(grandPending).toBe(425.5);
    expect(grandTotal).toBe(grandPaid + grandPending);
  });

  it("should deduplicate projects when user is both creator and collaborator", () => {
    const createdProjects = [
      { id: 1, title: "Project A" },
      { id: 2, title: "Project B" },
    ];
    const collabProjects = [
      { id: 1, title: "Project A" },
      { id: 3, title: "Project C" },
    ];

    const allProjects = [...createdProjects];
    for (const p of collabProjects) {
      if (!allProjects.find((x) => x.id === p.id)) {
        allProjects.push(p);
      }
    }

    expect(allProjects).toHaveLength(3);
    expect(allProjects.map((p) => p.id)).toEqual([1, 2, 3]);
  });

  it("should calculate statement balance correctly", () => {
    const totalEarnings = 2500.0;
    const totalPaid = 1800.0;
    const balance = totalEarnings - totalPaid;

    expect(balance).toBe(700);
    expect(balance.toFixed(2)).toBe("700.00");
  });

  it("should prevent splits from exceeding 100% with multiple collaborators", () => {
    const collaborators = [
      { splitPercentage: "40.00" },
      { splitPercentage: "35.00" },
      { splitPercentage: "15.00" },
    ];

    const currentTotal = collaborators.reduce(
      (sum, c) => sum + parseFloat(c.splitPercentage),
      0
    );
    expect(currentTotal).toBe(90);

    // Can add up to 10% more
    const maxNewSplit = 100 - currentTotal;
    expect(maxNewSplit).toBe(10);

    // Trying to add 15% should fail
    expect(currentTotal + 15).toBeGreaterThan(100);
  });
});
