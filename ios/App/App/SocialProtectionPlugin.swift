import Capacitor

@objc(SocialProtectionPlugin)
public class SocialProtectionPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SocialProtectionPlugin"
    public let jsName = "SocialProtection"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getStatus", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestAccess", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "listApps", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "saveSelection", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "pickApps", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "startFocusProtection", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopFocusProtection", returnType: CAPPluginReturnPromise)
    ]

    @objc public func getStatus(_ call: CAPPluginCall) {
        call.resolve([
            "platform": "ios",
            "supported": false,
            "permissionGranted": false,
            "monitoring": false,
            "selectedCount": 0,
            "message": "Cần Family Controls entitlement, app extension và provisioning của Apple trước khi bật giới hạn ứng dụng."
        ])
    }

    @objc public func requestAccess(_ call: CAPPluginCall) {
        call.reject("Restriction trên iOS chưa được bật. Cần Apple cấp Family Controls entitlement và ký app extension.")
    }

    @objc public func listApps(_ call: CAPPluginCall) {
        call.resolve(["apps": []])
    }

    @objc public func saveSelection(_ call: CAPPluginCall) {
        call.resolve()
    }

    @objc public func pickApps(_ call: CAPPluginCall) {
        call.reject("Bộ chọn Screen Time chỉ hoạt động sau khi cấu hình Family Controls entitlement.")
    }

    @objc public func startFocusProtection(_ call: CAPPluginCall) {
        call.reject("iOS chỉ có bộ đếm giờ trong bản này; chưa bật che ứng dụng Screen Time.")
    }

    @objc public func stopFocusProtection(_ call: CAPPluginCall) {
        call.resolve()
    }
}
