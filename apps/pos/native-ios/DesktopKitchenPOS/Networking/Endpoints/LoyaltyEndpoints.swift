import Foundation

enum LoyaltyEndpoints {
    static func lookupByPhone(_ phone: String) -> Endpoint {
        Endpoint(path: "/loyalty/customers/phone/\(phone)")
    }

    static func register(request: RegisterCustomerRequest) -> Endpoint {
        Endpoint(path: "/loyalty/customers", method: .post, body: request)
    }

    static func addStamps(request: AddStampsRequest) -> Endpoint {
        Endpoint(path: "/loyalty/stamps", method: .post, body: request)
    }
}
