/**
 * Merchandise Service
 * E-commerce and inventory management
 */

interface MerchandiseProduct {
  id: string;
  operatorId: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  category: 'apparel' | 'accessories' | 'digital' | 'physical' | 'bundle';
  images: string[];
  inventory: number;
  sku: string;
  variants: MerchandiseVariant[];
  status: 'active' | 'inactive' | 'discontinued';
  createdAt: Date;
  updatedAt: Date;
}

interface MerchandiseVariant {
  id: string;
  productId: string;
  name: string;
  options: Record<string, string>; // e.g., { size: 'M', color: 'blue' }
  sku: string;
  inventory: number;
  price: number;
}

interface MerchandiseOrder {
  id: string;
  operatorId: string;
  customerId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  shippingAddress: Address;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface OrderItem {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  discount?: number;
}

interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface InventoryAlert {
  id: string;
  productId: string;
  threshold: number;
  currentInventory: number;
  alertSent: boolean;
  createdAt: Date;
}

interface MerchandiseAnalytics {
  operatorId: string;
  totalSales: number;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: Array<{ productId: string; name: string; sales: number }>;
  inventoryTurnoveer: number;
  profitMargin: number;
}

class MerchandiseService {
  private products: Map<string, MerchandiseProduct> = new Map();
  private orders: Map<string, MerchandiseOrder> = new Map();
  private inventoryAlerts: Map<string, InventoryAlert> = new Map();
  private analytics: Map<string, MerchandiseAnalytics> = new Map();

  /**
   * Create merchandise product
   */
  createProduct(
    operatorId: string,
    name: string,
    description: string,
    price: number,
    cost: number,
    category: MerchandiseProduct['category'],
    images: string[],
    inventory: number,
    sku: string
  ): MerchandiseProduct {
    const product: MerchandiseProduct = {
      id: `product_${Date.now()}_${Math.random()}`,
      operatorId,
      name,
      description,
      price,
      cost,
      category,
      images,
      inventory,
      sku,
      variants: [],
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.products.set(product.id, product);
    this.checkInventoryAlerts(product.id);

    return product;
  }

  /**
   * Add product variant
   */
  addVariant(
    productId: string,
    name: string,
    options: Record<string, string>,
    sku: string,
    inventory: number,
    price?: number
  ): MerchandiseVariant | null {
    const product = this.products.get(productId);
    if (!product) return null;

    const variant: MerchandiseVariant = {
      id: `variant_${Date.now()}_${Math.random()}`,
      productId,
      name,
      options,
      sku,
      inventory,
      price: price || product.price,
    };

    product.variants.push(variant);
    product.updatedAt = new Date();

    return variant;
  }

  /**
   * Get products by operator
   */
  getProducts(operatorId: string, category?: string): MerchandiseProduct[] {
    return Array.from(this.products.values()).filter(
      (p) => p.operatorId === operatorId && (category ? p.category === category : true) && p.status === 'active'
    );
  }

  /**
   * Get product by ID
   */
  getProduct(productId: string): MerchandiseProduct | null {
    return this.products.get(productId) || null;
  }

  /**
   * Update product
   */
  updateProduct(productId: string, updates: Partial<MerchandiseProduct>): MerchandiseProduct | null {
    const product = this.products.get(productId);
    if (!product) return null;

    const updated = { ...product, ...updates, updatedAt: new Date() };
    this.products.set(productId, updated);

    return updated;
  }

  /**
   * Create order
   */
  createOrder(
    operatorId: string,
    customerId: string,
    items: OrderItem[],
    shippingAddress: Address
  ): MerchandiseOrder | null {
    // Validate inventory
    for (const item of items) {
      const product = this.products.get(item.productId);
      if (!product || product.inventory < item.quantity) {
        return null; // Insufficient inventory
      }
    }

    // Calculate total
    let totalAmount = 0;
    for (const item of items) {
      const product = this.products.get(item.productId);
      if (product) {
        totalAmount += item.price * item.quantity;
        if (item.discount) {
          totalAmount -= item.discount;
        }
      }
    }

    const order: MerchandiseOrder = {
      id: `order_${Date.now()}_${Math.random()}`,
      operatorId,
      customerId,
      items,
      totalAmount,
      status: 'pending',
      shippingAddress,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.orders.set(order.id, order);

    // Update inventory
    for (const item of items) {
      const product = this.products.get(item.productId);
      if (product) {
        product.inventory -= item.quantity;
        this.checkInventoryAlerts(item.productId);
      }
    }

    this.updateAnalytics(operatorId);

    return order;
  }

  /**
   * Get orders by operator
   */
  getOrders(operatorId: string, status?: string): MerchandiseOrder[] {
    return Array.from(this.orders.values()).filter(
      (o) => o.operatorId === operatorId && (status ? o.status === status : true)
    );
  }

  /**
   * Get order by ID
   */
  getOrder(orderId: string): MerchandiseOrder | null {
    return this.orders.get(orderId) || null;
  }

  /**
   * Update order status
   */
  updateOrderStatus(
    orderId: string,
    status: MerchandiseOrder['status'],
    trackingNumber?: string
  ): MerchandiseOrder | null {
    const order = this.orders.get(orderId);
    if (!order) return null;

    order.status = status;
    order.trackingNumber = trackingNumber;
    order.updatedAt = new Date();

    return order;
  }

  /**
   * Check inventory alerts
   */
  private checkInventoryAlerts(productId: string): void {
    const product = this.products.get(productId);
    if (!product) return;

    const threshold = Math.ceil(product.inventory * 0.2); // Alert at 20% inventory

    if (product.inventory <= threshold) {
      const alert: InventoryAlert = {
        id: `alert_${Date.now()}_${Math.random()}`,
        productId,
        threshold,
        currentInventory: product.inventory,
        alertSent: false,
        createdAt: new Date(),
      };

      this.inventoryAlerts.set(alert.id, alert);
      console.log(`[Inventory] Alert for product ${product.name}: ${product.inventory} units remaining`);
    }
  }

  /**
   * Get inventory alerts
   */
  getInventoryAlerts(operatorId: string): InventoryAlert[] {
    return Array.from(this.inventoryAlerts.values()).filter((a) => {
      const product = this.products.get(a.productId);
      return product && product.operatorId === operatorId;
    });
  }

  /**
   * Restock product
   */
  restockProduct(productId: string, quantity: number): MerchandiseProduct | null {
    const product = this.products.get(productId);
    if (!product) return null;

    product.inventory += quantity;
    product.updatedAt = new Date();

    return product;
  }

  /**
   * Update analytics
   */
  private updateAnalytics(operatorId: string): void {
    const operatorOrders = Array.from(this.orders.values()).filter((o) => o.operatorId === operatorId);
    const operatorProducts = Array.from(this.products.values()).filter((p) => p.operatorId === operatorId);

    let totalRevenue = 0;
    let totalCost = 0;

    for (const order of operatorOrders) {
      if (order.status !== 'cancelled' && order.status !== 'refunded') {
        totalRevenue += order.totalAmount;
      }
    }

    for (const product of operatorProducts) {
      totalCost += product.cost * (product.inventory + 100); // Rough estimate
    }

    const analytics: MerchandiseAnalytics = {
      operatorId,
      totalSales: operatorOrders.length,
      totalRevenue,
      totalOrders: operatorOrders.length,
      averageOrderValue: operatorOrders.length > 0 ? totalRevenue / operatorOrders.length : 0,
      topProducts: this.getTopProducts(operatorId),
      inventoryTurnoveer: totalRevenue / (totalCost || 1),
      profitMargin: totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0,
    };

    this.analytics.set(operatorId, analytics);
  }

  /**
   * Get top products
   */
  private getTopProducts(operatorId: string): Array<{ productId: string; name: string; sales: number }> {
    const productSales: Record<string, { name: string; sales: number }> = {};

    const operatorOrders = Array.from(this.orders.values()).filter((o) => o.operatorId === operatorId);

    for (const order of operatorOrders) {
      for (const item of order.items) {
        const product = this.products.get(item.productId);
        if (product) {
          if (!productSales[item.productId]) {
            productSales[item.productId] = { name: product.name, sales: 0 };
          }
          productSales[item.productId].sales += item.quantity;
        }
      }
    }

    return Object.entries(productSales)
      .map(([productId, data]) => ({ productId, ...data }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  }

  /**
   * Get analytics
   */
  getAnalytics(operatorId: string): MerchandiseAnalytics | null {
    return this.analytics.get(operatorId) || null;
  }

  /**
   * Generate sales report
   */
  generateSalesReport(operatorId: string, startDate: Date, endDate: Date): Record<string, any> {
    const operatorOrders = Array.from(this.orders.values()).filter(
      (o) => o.operatorId === operatorId && o.createdAt >= startDate && o.createdAt <= endDate
    );

    const report = {
      period: { startDate, endDate },
      totalOrders: operatorOrders.length,
      totalRevenue: operatorOrders.reduce((sum, o) => sum + o.totalAmount, 0),
      averageOrderValue: operatorOrders.length > 0 ? operatorOrders.reduce((sum, o) => sum + o.totalAmount, 0) / operatorOrders.length : 0,
      ordersByStatus: {
        pending: operatorOrders.filter((o) => o.status === 'pending').length,
        processing: operatorOrders.filter((o) => o.status === 'processing').length,
        shipped: operatorOrders.filter((o) => o.status === 'shipped').length,
        delivered: operatorOrders.filter((o) => o.status === 'delivered').length,
        cancelled: operatorOrders.filter((o) => o.status === 'cancelled').length,
        refunded: operatorOrders.filter((o) => o.status === 'refunded').length,
      },
    };

    return report;
  }

  /**
   * Apply discount code
   */
  applyDiscount(orderId: string, discountAmount: number): MerchandiseOrder | null {
    const order = this.orders.get(orderId);
    if (!order) return null;

    order.totalAmount -= discountAmount;
    order.updatedAt = new Date();

    return order;
  }
}

export const merchandiseService = new MerchandiseService();
