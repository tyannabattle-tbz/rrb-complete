/**
 * Custom Dashboard Widget System
 * Drag-and-drop widget system for personalized dashboards
 */

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  config: Record<string, unknown>;
  data?: unknown;
  refreshInterval?: number;
  isVisible: boolean;
}

export type WidgetType =
  | 'metric'
  | 'chart'
  | 'timeline'
  | 'table'
  | 'gauge'
  | 'heatmap'
  | 'status'
  | 'list'
  | 'calendar'
  | 'map'
  | 'custom';

export interface Dashboard {
  id: string;
  name: string;
  widgets: Widget[];
  gridSize: { columns: number; rows: number };
  theme: 'light' | 'dark';
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WidgetTemplate {
  id: string;
  name: string;
  type: WidgetType;
  description: string;
  defaultConfig: Record<string, unknown>;
  previewImage?: string;
}

export class CustomWidgets {
  private dashboards: Map<string, Dashboard> = new Map();
  private widgets: Map<string, Widget> = new Map();
  private templates: Map<string, WidgetTemplate> = new Map();
  private widgetHistory: Array<{ action: string; widget: Widget; timestamp: Date }> = [];

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Initialize widget templates
   */
  private initializeTemplates(): void {
    const templates: WidgetTemplate[] = [
      {
        id: 'template-metric',
        name: 'Metric Widget',
        type: 'metric',
        description: 'Display a single metric value',
        defaultConfig: {
          metric: 'cpu_usage',
          unit: '%',
          threshold: 80,
        },
      },
      {
        id: 'template-chart',
        name: 'Chart Widget',
        type: 'chart',
        description: 'Display data in chart format',
        defaultConfig: {
          chartType: 'line',
          timeRange: '24h',
          metrics: [],
        },
      },
      {
        id: 'template-status',
        name: 'Status Widget',
        type: 'status',
        description: 'Display system status',
        defaultConfig: {
          showDetails: true,
          autoRefresh: true,
        },
      },
      {
        id: 'template-table',
        name: 'Table Widget',
        type: 'table',
        description: 'Display data in table format',
        defaultConfig: {
          columns: [],
          sortBy: 'name',
          pageSize: 10,
        },
      },
      {
        id: 'template-gauge',
        name: 'Gauge Widget',
        type: 'gauge',
        description: 'Display metric as gauge',
        defaultConfig: {
          metric: 'success_rate',
          min: 0,
          max: 100,
        },
      },
    ];

    templates.forEach((t) => this.templates.set(t.id, t));
  }

  /**
   * Create dashboard
   */
  createDashboard(name: string, isDefault: boolean = false): Dashboard {
    const dashboard: Dashboard = {
      id: `dashboard-${Date.now()}`,
      name,
      widgets: [],
      gridSize: { columns: 12, rows: 8 },
      theme: 'dark',
      isDefault,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.dashboards.set(dashboard.id, dashboard);
    return dashboard;
  }

  /**
   * Add widget to dashboard
   */
  addWidget(
    dashboardId: string,
    widgetType: WidgetType,
    title: string,
    config: Record<string, unknown>,
    position?: { x: number; y: number }
  ): Widget | null {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) return null;

    const widget: Widget = {
      id: `widget-${Date.now()}`,
      type: widgetType,
      title,
      position: position || { x: 0, y: 0 },
      size: { width: 3, height: 2 },
      config,
      isVisible: true,
      refreshInterval: 30000,
    };

    dashboard.widgets.push(widget);
    this.widgets.set(widget.id, widget);
    dashboard.updatedAt = new Date();

    this.recordWidgetAction('add', widget);
    return widget;
  }

  /**
   * Remove widget from dashboard
   */
  removeWidget(dashboardId: string, widgetId: string): boolean {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) return false;

    const index = dashboard.widgets.findIndex((w) => w.id === widgetId);
    if (index === -1) return false;

    const widget = dashboard.widgets[index];
    dashboard.widgets.splice(index, 1);
    this.widgets.delete(widgetId);
    dashboard.updatedAt = new Date();

    this.recordWidgetAction('remove', widget);
    return true;
  }

  /**
   * Update widget position
   */
  updateWidgetPosition(
    widgetId: string,
    position: { x: number; y: number }
  ): boolean {
    const widget = this.widgets.get(widgetId);
    if (!widget) return false;

    widget.position = position;
    this.recordWidgetAction('move', widget);
    return true;
  }

  /**
   * Update widget size
   */
  updateWidgetSize(widgetId: string, size: { width: number; height: number }): boolean {
    const widget = this.widgets.get(widgetId);
    if (!widget) return false;

    widget.size = size;
    this.recordWidgetAction('resize', widget);
    return true;
  }

  /**
   * Update widget config
   */
  updateWidgetConfig(widgetId: string, config: Record<string, unknown>): boolean {
    const widget = this.widgets.get(widgetId);
    if (!widget) return false;

    widget.config = { ...widget.config, ...config };
    this.recordWidgetAction('configure', widget);
    return true;
  }

  /**
   * Toggle widget visibility
   */
  toggleWidgetVisibility(widgetId: string): boolean {
    const widget = this.widgets.get(widgetId);
    if (!widget) return false;

    widget.isVisible = !widget.isVisible;
    this.recordWidgetAction('toggle', widget);
    return true;
  }

  /**
   * Get dashboard
   */
  getDashboard(dashboardId: string): Dashboard | undefined {
    return this.dashboards.get(dashboardId);
  }

  /**
   * Get all dashboards
   */
  getDashboards(): Dashboard[] {
    return Array.from(this.dashboards.values());
  }

  /**
   * Get default dashboard
   */
  getDefaultDashboard(): Dashboard | undefined {
    return Array.from(this.dashboards.values()).find((d) => d.isDefault);
  }

  /**
   * Duplicate dashboard
   */
  duplicateDashboard(dashboardId: string, newName: string): Dashboard | null {
    const original = this.dashboards.get(dashboardId);
    if (!original) return null;

    const duplicate: Dashboard = {
      id: `dashboard-${Date.now()}`,
      name: newName,
      widgets: original.widgets.map((w) => ({
        ...w,
        id: `widget-${Date.now()}-${Math.random()}`,
      })),
      gridSize: original.gridSize,
      theme: original.theme,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.dashboards.set(duplicate.id, duplicate);
    return duplicate;
  }

  /**
   * Save widget layout
   */
  saveWidgetLayout(dashboardId: string): string {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) return '';

    return JSON.stringify({
      dashboardId,
      widgets: dashboard.widgets.map((w) => ({
        id: w.id,
        position: w.position,
        size: w.size,
      })),
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Restore widget layout
   */
  restoreWidgetLayout(dashboardId: string, layout: string): boolean {
    try {
      const parsed = JSON.parse(layout);
      const dashboard = this.dashboards.get(dashboardId);
      if (!dashboard) return false;

      parsed.widgets.forEach(
        (layoutWidget: { id: string; position: { x: number; y: number }; size: { width: number; height: number } }) => {
          const widget = dashboard.widgets.find((w) => w.id === layoutWidget.id);
          if (widget) {
            widget.position = layoutWidget.position;
            widget.size = layoutWidget.size;
          }
        }
      );

      dashboard.updatedAt = new Date();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get widget templates
   */
  getWidgetTemplates(): WidgetTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get widget template
   */
  getWidgetTemplate(templateId: string): WidgetTemplate | undefined {
    return this.templates.get(templateId);
  }

  /**
   * Create widget from template
   */
  createWidgetFromTemplate(dashboardId: string, templateId: string): Widget | null {
    const template = this.templates.get(templateId);
    if (!template) return null;

    return this.addWidget(
      dashboardId,
      template.type,
      template.name,
      template.defaultConfig
    );
  }

  /**
   * Record widget action
   */
  private recordWidgetAction(action: string, widget: Widget): void {
    this.widgetHistory.push({
      action,
      widget: { ...widget },
      timestamp: new Date(),
    });

    // Keep only last 100 actions
    if (this.widgetHistory.length > 100) {
      this.widgetHistory.shift();
    }
  }

  /**
   * Get widget history
   */
  getWidgetHistory(limit: number = 20): Array<{ action: string; widget: Widget; timestamp: Date }> {
    return this.widgetHistory.slice(-limit);
  }

  /**
   * Export dashboard configuration
   */
  exportDashboard(dashboardId: string): string {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) return '';

    return JSON.stringify(dashboard, null, 2);
  }

  /**
   * Import dashboard configuration
   */
  importDashboard(config: string): Dashboard | null {
    try {
      const parsed = JSON.parse(config);
      const dashboard: Dashboard = {
        ...parsed,
        id: `dashboard-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.dashboards.set(dashboard.id, dashboard);
      dashboard.widgets.forEach((w) => this.widgets.set(w.id, w));

      return dashboard;
    } catch {
      return null;
    }
  }

  /**
   * Get dashboard statistics
   */
  getDashboardStatistics(): {
    totalDashboards: number;
    totalWidgets: number;
    widgetsByType: Record<string, number>;
    averageWidgetsPerDashboard: number;
  } {
    const dashboards = Array.from(this.dashboards.values());
    const totalWidgets = dashboards.reduce((acc, d) => acc + d.widgets.length, 0);
    const widgetsByType: Record<string, number> = {};

    dashboards.forEach((d) => {
      d.widgets.forEach((w) => {
        widgetsByType[w.type] = (widgetsByType[w.type] || 0) + 1;
      });
    });

    return {
      totalDashboards: dashboards.length,
      totalWidgets,
      widgetsByType,
      averageWidgetsPerDashboard: dashboards.length > 0 ? totalWidgets / dashboards.length : 0,
    };
  }
}

export const customWidgets = new CustomWidgets();
