import Foundation

enum MenuEndpoints {
    static func getCategories() -> Endpoint {
        Endpoint(path: "/menu/categories")
    }

    static func getMenuItems(categoryId: Int? = nil) -> Endpoint {
        var queryItems: [URLQueryItem]? = nil
        if let categoryId {
            queryItems = [URLQueryItem(name: "category_id", value: String(categoryId))]
        }
        return Endpoint(path: "/menu/items", queryItems: queryItems)
    }

    static func toggleMenuItem(id: Int) -> Endpoint {
        Endpoint(path: "/menu/items/\(id)/toggle", method: .put)
    }

    static func createMenuItem(data: CreateMenuItemRequest) -> Endpoint {
        Endpoint(path: "/menu/items", method: .post, body: data)
    }

    static func updateMenuItem(id: Int, data: UpdateMenuItemRequest) -> Endpoint {
        Endpoint(path: "/menu/items/\(id)", method: .put, body: data)
    }
}

struct CreateMenuItemRequest: Codable, Sendable {
    let category_id: Int
    let name: String
    let price: Double
    let description: String?
}

struct UpdateMenuItemRequest: Codable, Sendable {
    let category_id: Int?
    let name: String?
    let price: Double?
    let description: String?
}
