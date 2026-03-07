package kitchen.desktop.pos.plugins;

/**
 * Stub for the Getnet Tap on Phone Capacitor plugin.
 *
 * IMPLEMENTATION NOTES:
 * - Requires the Getnet Tap on Phone SDK (contact Getnet for access)
 * - Requires Android device with NFC support
 * - Add to AndroidManifest.xml:
 *     <uses-permission android:name="android.permission.NFC" />
 *     <uses-feature android:name="android.hardware.nfc" android:required="false" />
 *
 * This stub provides the Capacitor bridge interface.
 * The actual SDK integration will call:
 * 1. GetnetPayment.initialize(context, merchantId, environment)
 * 2. GetnetPayment.startPayment(amount, orderId, callback)
 * 3. GetnetPayment.cancelPayment()
 *
 * To register this plugin, add to MainActivity.java:
 *   registerPlugin(GetnetTapPlugin.class);
 */
public class GetnetTapPlugin {
    // TODO: Implement with actual Getnet Tap on Phone SDK
    // This is a stub file for the Capacitor plugin bridge.
    //
    // Methods to implement:
    // - isAvailable(): Check NFC hardware
    // - initialize(options): Initialize Getnet SDK
    // - startPayment(options): Start NFC payment flow
    // - cancelPayment(): Cancel in-progress payment
}
