/**
 * Test Suite for FuturisticDesignSystem Components
 * 
 * Tests all reusable futuristic UI components with:
 * - Rendering verification
 * - Props handling
 * - CSS class application
 * - Animation effects
 */

import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  FuturisticCard,
  FuturisticButton,
  FuturisticBadge,
  FuturisticHeader,
  FuturisticGrid,
  FuturisticMetric,
  FuturisticSection,
  FuturisticDivider,
  FuturisticLoading,
  FuturisticStat,
} from "./FuturisticDesignSystem";
import { Brain } from "lucide-react";

describe("FuturisticDesignSystem Components", () => {
  describe("FuturisticCard", () => {
    it("should render with children", () => {
      render(
        <FuturisticCard>
          <p>Test content</p>
        </FuturisticCard>
      );
      expect(screen.getByText("Test content")).toBeDefined();
    });

    it("should apply glow class for cyan", () => {
      const { container } = render(
        <FuturisticCard glow="cyan">
          <p>Test</p>
        </FuturisticCard>
      );
      expect((container.firstChild as HTMLElement).classList.contains("neon-glow")).toBe(true);
    });

    it("should apply glow class for magenta", () => {
      const { container } = render(
        <FuturisticCard glow="magenta">
          <p>Test</p>
        </FuturisticCard>
      );
      expect((container.firstChild as HTMLElement).classList.contains("neon-glow-magenta")).toBe(true);
    });

    it("should apply holographic class", () => {
      const { container } = render(
        <FuturisticCard holographic>
          <p>Test</p>
        </FuturisticCard>
      );
      expect((container.firstChild as HTMLElement).classList.contains("holographic")).toBe(true);
    });
  });

  describe("FuturisticButton", () => {
    it("should render with children", () => {
      render(<FuturisticButton>Click me</FuturisticButton>);
      expect(screen.getByText("Click me")).toBeDefined();
    });

    it("should apply primary variant class", () => {
      const { container } = render(
        <FuturisticButton variant="primary">Click</FuturisticButton>
      );
      expect((container.querySelector("button") as HTMLElement).classList.contains("btn-primary")).toBe(true);
    });

    it("should apply secondary variant class", () => {
      const { container } = render(
        <FuturisticButton variant="secondary">Click</FuturisticButton>
      );
      expect((container.querySelector("button") as HTMLElement).classList.contains("btn-secondary")).toBe(true);
    });

    it("should apply ghost variant class", () => {
      const { container } = render(
        <FuturisticButton variant="ghost">Click</FuturisticButton>
      );
      expect((container.querySelector("button") as HTMLElement).classList.contains("btn-ghost")).toBe(true);
    });

    it("should apply glow animation when glow prop is true", () => {
      const { container } = render(
        <FuturisticButton glow>Click</FuturisticButton>
      );
      expect((container.querySelector("button") as HTMLElement).classList.contains("animate-glow-pulse")).toBe(true);
    });
  });

  describe("FuturisticBadge", () => {
    it("should render with children", () => {
      render(<FuturisticBadge>Badge</FuturisticBadge>);
      expect(screen.getByText("Badge")).toBeDefined();
    });

    it("should apply primary variant class", () => {
      const { container } = render(
        <FuturisticBadge variant="primary">Badge</FuturisticBadge>
      );
      expect((container.firstChild as HTMLElement).classList.contains("badge-primary")).toBe(true);
    });

    it("should apply success variant class", () => {
      const { container } = render(
        <FuturisticBadge variant="success">Badge</FuturisticBadge>
      );
      expect((container.firstChild as HTMLElement).classList.contains("badge-success")).toBe(true);
    });

    it("should apply warning variant class", () => {
      const { container } = render(
        <FuturisticBadge variant="warning">Badge</FuturisticBadge>
      );
      expect((container.firstChild as HTMLElement).classList.contains("badge-warning")).toBe(true);
    });

    it("should apply error variant class", () => {
      const { container } = render(
        <FuturisticBadge variant="error">Badge</FuturisticBadge>
      );
      expect((container.firstChild as HTMLElement).classList.contains("badge-error")).toBe(true);
    });

    it("should apply glow animation when glow prop is true", () => {
      const { container } = render(
        <FuturisticBadge glow>Badge</FuturisticBadge>
      );
      expect((container.firstChild as HTMLElement).classList.contains("animate-glow-pulse")).toBe(true);
    });
  });

  describe("FuturisticHeader", () => {
    it("should render title", () => {
      render(<FuturisticHeader title="Test Title" />);
      expect(screen.getByText("Test Title")).toBeDefined();
    });

    it("should render subtitle when provided", () => {
      render(
        <FuturisticHeader
          title="Title"
          subtitle="Test Subtitle"
        />
      );
      expect(screen.getByText("Test Subtitle")).toBeDefined();
    });

    it("should render icon when provided", () => {
      const { container } = render(
        <FuturisticHeader
          title="Title"
          icon={<Brain data-testid="test-icon" />}
        />
      );
      expect(container.querySelector('[data-testid="test-icon"]')).not.toBeNull();
    });

    it("should apply gradient-text class to title", () => {
      const { container } = render(
        <FuturisticHeader title="Title" />
      );
      const titleElement = container.querySelector("h1");
      expect((titleElement as HTMLElement).classList.contains("gradient-text")).toBe(true);
    });
  });

  describe("FuturisticGrid", () => {
    it("should render children", () => {
      render(
        <FuturisticGrid>
          <div>Item 1</div>
          <div>Item 2</div>
        </FuturisticGrid>
      );
      expect(screen.getByText("Item 1")).toBeDefined();
      expect(screen.getByText("Item 2")).toBeDefined();
    });

    it("should apply correct grid columns class", () => {
      const { container } = render(
        <FuturisticGrid columns={3}>
          <div>Item</div>
        </FuturisticGrid>
      );
      const grid = container.firstChild as HTMLElement;
      expect(grid.classList.contains("grid-cols-1")).toBe(true);
      expect(grid.classList.contains("md:grid-cols-2")).toBe(true);
      expect(grid.classList.contains("lg:grid-cols-3")).toBe(true);
    });

    it("should apply correct gap class", () => {
      const { container } = render(
        <FuturisticGrid gap="lg">
          <div>Item</div>
        </FuturisticGrid>
      );
      expect((container.firstChild as HTMLElement).classList.contains("gap-6")).toBe(true);
    });
  });

  describe("FuturisticMetric", () => {
    it("should render label and value", () => {
      render(
        <FuturisticMetric
          label="Test Label"
          value={42}
        />
      );
      expect(screen.getByText("Test Label")).toBeDefined();
      expect(screen.getByText("42")).toBeDefined();
    });

    it("should render unit when provided", () => {
      render(
        <FuturisticMetric
          label="Test"
          value={100}
          unit="ms"
        />
      );
      expect(screen.getByText("ms")).toBeDefined();
    });

    it("should render trend indicator", () => {
      render(
        <FuturisticMetric
          label="Test"
          value={100}
          trend="up"
        />
      );
      expect(screen.getByText("↑ Increasing")).toBeDefined();
    });

    it("should render down trend", () => {
      render(
        <FuturisticMetric
          label="Test"
          value={100}
          trend="down"
        />
      );
      expect(screen.getByText("↓ Decreasing")).toBeDefined();
    });
  });

  describe("FuturisticSection", () => {
    it("should render title and children", () => {
      render(
        <FuturisticSection title="Test Section">
          <p>Content</p>
        </FuturisticSection>
      );
      expect(screen.getByText("Test Section")).toBeDefined();
      expect(screen.getByText("Content")).toBeDefined();
    });

    it("should render description when provided", () => {
      render(
        <FuturisticSection
          title="Title"
          description="Test Description"
        >
          <p>Content</p>
        </FuturisticSection>
      );
      expect(screen.getByText("Test Description")).toBeDefined();
    });

    it("should apply glass-neon class to container", () => {
      const { container } = render(
        <FuturisticSection title="Title">
          <p>Content</p>
        </FuturisticSection>
      );
      const glassContainer = container.querySelector(".glass-neon");
      expect(glassContainer).not.toBeNull();
    });
  });

  describe("FuturisticDivider", () => {
    it("should render divider element", () => {
      const { container } = render(<FuturisticDivider />);
      expect((container.firstChild as HTMLElement).classList.contains("h-px")).toBe(true);
    });

    it("should apply animation style when animated prop is true", () => {
      const { container } = render(<FuturisticDivider animated />);
      const divider = container.firstChild as HTMLElement;
      expect(divider.style.animation).toBe("shimmer 3s infinite");
    });
  });

  describe("FuturisticLoading", () => {
    it("should render loading indicator", () => {
      const { container } = render(<FuturisticLoading />);
      expect(container.querySelector(".relative")).not.toBeNull();
    });

    it("should render loading text when provided", () => {
      render(<FuturisticLoading text="Loading..." />);
      expect(screen.getByText("Loading...")).toBeDefined();
    });

    it("should apply correct size classes", () => {
      const { container } = render(<FuturisticLoading size="lg" />);
      const loader = container.querySelector(".relative") as HTMLElement;
      expect(loader.classList.contains("w-16")).toBe(true);
      expect(loader.classList.contains("h-16")).toBe(true);
    });
  });

  describe("FuturisticStat", () => {
    it("should render label and value", () => {
      render(
        <FuturisticStat
          label="Test Label"
          value={100}
        />
      );
      expect(screen.getByText("Test Label")).toBeDefined();
      expect(screen.getByText("100")).toBeDefined();
    });

    it("should render change text when provided", () => {
      render(
        <FuturisticStat
          label="Test"
          value={100}
          change="+5%"
        />
      );
      expect(screen.getByText("+5%")).toBeDefined();
    });

    it("should apply positive change color", () => {
      const { container } = render(
        <FuturisticStat
          label="Test"
          value={100}
          change="+5%"
          changeType="positive"
        />
      );
      const changeElement = container.querySelector(".text-green-400");
      expect(changeElement).not.toBeNull();
    });

    it("should apply negative change color", () => {
      const { container } = render(
        <FuturisticStat
          label="Test"
          value={100}
          change="-5%"
          changeType="negative"
        />
      );
      const changeElement = container.querySelector(".text-red-400");
      expect(changeElement).not.toBeNull();
    });
  });
});
