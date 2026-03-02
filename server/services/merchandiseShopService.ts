/**
 * Merchandise Shop Service
 * RRB merchandise catalog and orders
 */

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  inventory: number;
  category: string;
}

export interface Order {
  id: string;
  products: Array<{ productId: number; quantity: number }>;
  total: number;
  status: 'pending' | 'shipped' | 'delivered';
  createdAt: string;
}

class MerchandiseShopService {
  private products: Map<number, Product> = new Map();
  private orders: Map<string, Order> = new Map();

  constructor() {
    this.initializeProducts();
  }

  private initializeProducts(): void {
    const defaultProducts: Product[] = [
      {
        id: 1,
        name: 'RRB T-Shirt',
        description: 'Classic Rockin\' Rockin\' Boogie t-shirt',
        price: 25,
        inventory: 100,
        category: 'apparel',
      },
      {
        id: 2,
        name: 'Healing Frequencies CD',
        description: 'Complete Solfeggio frequency collection',
        price: 15,
        inventory: 50,
        category: 'media',
      },
      {
        id: 3,
        name: 'RRB Hoodie',
        description: 'Comfortable RRB branded hoodie',
        price: 45,
        inventory: 75,
        category: 'apparel',
      },
    ];

    defaultProducts.forEach((p) => this.products.set(p.id, p));
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async createOrder(
    productIds: Array<{ productId: number; quantity: number }>
  ): Promise<Order> {
    const id = `order-${Date.now()}`;
    let total = 0;

    for (const item of productIds) {
      const product = this.products.get(item.productId);
      if (product) {
        total += product.price * item.quantity;
        product.inventory -= item.quantity;
      }
    }

    const order: Order = {
      id,
      products: productIds,
      total,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    this.orders.set(id, order);
    return order;
  }

  async getOrder(orderId: string): Promise<Order | null> {
    return this.orders.get(orderId) || null;
  }
}

export const merchandiseShopService = new MerchandiseShopService();
