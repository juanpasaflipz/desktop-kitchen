import Foundation

enum BrandingEndpoints {
    static func get() -> Endpoint {
        Endpoint(path: "/branding")
    }
}
