import Foundation

struct Tenant: Codable, Identifiable {
    let id: UUID
    let name: String
    let slug: String
    let currency: String
    let plan: String
    let logoUrl: String?
    let createdAt: Date

    enum CodingKeys: String, CodingKey {
        case id, name, slug, currency, plan
        case logoUrl = "logo_url"
        case createdAt = "created_at"
    }
}

struct Product: Codable, Identifiable {
    let id: UUID
    let tenantId: UUID
    let name: String
    let slug: String
    let description: String?
    let price: String
    let compareAtPrice: String?
    let quantity: Int
    let status: String
    let sku: String?
    let images: [ProductImage]?
    let createdAt: Date
    let updatedAt: Date

    enum CodingKeys: String, CodingKey {
        case id, name, slug, description, price, quantity, status, sku, images
        case tenantId = "tenant_id"
        case compareAtPrice = "compare_at_price"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

struct ProductImage: Codable {
    let url: String
    let alt: String?
}

struct Order: Codable, Identifiable {
    let id: UUID
    let tenantId: UUID
    let orderNumber: String
    let status: String
    let paymentStatus: String
    let fulfillmentStatus: String
    let subtotal: String
    let total: String
    let currency: String
    let customerName: String?
    let customerEmail: String?
    let itemsCount: Int
    let createdAt: Date
    let updatedAt: Date

    enum CodingKeys: String, CodingKey {
        case id, status, subtotal, total, currency
        case tenantId = "tenant_id"
        case orderNumber = "order_number"
        case paymentStatus = "payment_status"
        case fulfillmentStatus = "fulfillment_status"
        case customerName = "customer_name"
        case customerEmail = "customer_email"
        case itemsCount = "items_count"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

struct OrderItem: Codable, Identifiable {
    let id: UUID
    let orderId: UUID
    let productName: String
    let productSku: String?
    let quantity: Int
    let unitPrice: String
    let totalPrice: String

    enum CodingKeys: String, CodingKey {
        case id, quantity
        case orderId = "order_id"
        case productName = "product_name"
        case productSku = "product_sku"
        case unitPrice = "unit_price"
        case totalPrice = "total_price"
    }
}

struct Customer: Codable, Identifiable {
    let id: UUID
    let tenantId: UUID
    let email: String
    let firstName: String?
    let lastName: String?
    let phone: String?
    let isActive: Bool
    let createdAt: Date

    enum CodingKeys: String, CodingKey {
        case id, email, phone
        case tenantId = "tenant_id"
        case firstName = "first_name"
        case lastName = "last_name"
        case isActive = "is_active"
        case createdAt = "created_at"
    }
}

struct DashboardStats {
    let totalRevenue: Double
    let totalOrders: Int
    let totalCustomers: Int
    let totalProducts: Int
}
