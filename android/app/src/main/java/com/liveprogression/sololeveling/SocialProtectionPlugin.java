package com.liveprogression.sololeveling;

import android.Manifest;
import android.app.AppOpsManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Process;
import android.provider.Settings;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import org.json.JSONException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.text.SimpleDateFormat;
import java.util.Locale;
import java.util.TimeZone;

@CapacitorPlugin(
    name = "SocialProtection",
    permissions = {@Permission(alias = "notifications", strings = {Manifest.permission.POST_NOTIFICATIONS})}
)
public class SocialProtectionPlugin extends Plugin {
    private static final String PREFS = "voluntary_protection";
    private static final String[] SOCIAL_PACKAGES = {
        "com.zhiliaoapp.musically", "com.instagram.android", "com.facebook.katana"
    };
    private static final String[] SOCIAL_LABELS = {"TikTok", "Instagram", "Facebook"};

    @PluginMethod
    public void getStatus(PluginCall call) {
        call.resolve(status());
    }

    @PluginMethod
    public void requestAccess(PluginCall call) {
        if (Build.VERSION.SDK_INT >= 33 && getPermissionState("notifications") != PermissionState.GRANTED) {
            requestPermissionForAlias("notifications", call, "afterNotificationPermission");
            return;
        }
        openUsageSettings(call);
    }

    @PermissionCallback
    private void afterNotificationPermission(PluginCall call) {
        openUsageSettings(call);
    }

    @PluginMethod
    public void requestRestrictionAccess(PluginCall call) {
        boolean disclosed = getContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .getBoolean("blocking_disclosure_accepted", false);
        if (!disclosed) {
            call.reject("Hãy đọc và chấp thuận phần giải thích trong Solo Leveling trước khi mở quyền Trợ năng.");
            return;
        }
        getActivity().startActivity(new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS));
        call.resolve();
    }

    @PluginMethod
    public void setRestrictionEnabled(PluginCall call) {
        boolean enabled = call.getBoolean("enabled", false);
        boolean disclosed = call.getBoolean("disclosed", false);
        android.content.SharedPreferences prefs = getContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        if (enabled && !disclosed && !prefs.getBoolean("blocking_disclosure_accepted", false)) {
            call.reject("Cần xác nhận đã đọc giải thích quyền Trợ năng.");
            return;
        }
        if (enabled) prefs.edit().putBoolean("blocking_disclosure_accepted", true).apply();
        SocialRestrictionAccessibilityService.setBlockingEnabled(getContext(), enabled);
        call.resolve(status());
    }

    private void openUsageSettings(PluginCall call) {
        Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
        intent.setData(Uri.parse("package:" + getContext().getPackageName()));
        getActivity().startActivity(intent);
        call.resolve();
    }

    @PluginMethod
    public void listApps(PluginCall call) {
        JSArray apps = new JSArray();
        PackageManager manager = getContext().getPackageManager();
        for (int i = 0; i < SOCIAL_PACKAGES.length; i++) {
            try {
                ApplicationInfo info;
                if (Build.VERSION.SDK_INT >= 33) {
                    info = manager.getApplicationInfo(SOCIAL_PACKAGES[i], PackageManager.ApplicationInfoFlags.of(0));
                } else {
                    info = manager.getApplicationInfo(SOCIAL_PACKAGES[i], 0);
                }
                JSObject app = new JSObject();
                app.put("id", SOCIAL_PACKAGES[i]);
                app.put("label", manager.getApplicationLabel(info).toString());
                apps.put(app);
            } catch (PackageManager.NameNotFoundException ignored) {
                // Only expose the supported social apps that are actually installed.
            }
        }
        JSObject result = new JSObject();
        result.put("apps", apps);
        call.resolve(result);
    }

    @PluginMethod
    public void saveSelection(PluginCall call) {
        List<String> selected = readIds(call.getArray("appIds"));
        getContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit().putString("selected", String.join(",", selected)).apply();
        call.resolve();
    }

    @PluginMethod
    public void pickApps(PluginCall call) {
        call.resolve(new JSObject().put("selectedCount", 0));
    }

    @PluginMethod
    public void startFocusProtection(PluginCall call) {
        boolean sendReminders = call.getBoolean("sendReminders", true);
        boolean blockSelectedApps = call.getBoolean("blockSelectedApps", false);
        List<String> selected = readIds(call.getArray("appIds"));
        if (selected.isEmpty() || (!sendReminders && !blockSelectedApps)) {
            call.reject("Hãy chọn ít nhất một ứng dụng và bật lời nhắc hoặc che ứng dụng.");
            return;
        }
        long targetEnd;
        try {
            SimpleDateFormat parser = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US);
            parser.setLenient(false);
            parser.setTimeZone(TimeZone.getTimeZone("UTC"));
            targetEnd = parser.parse(call.getString("targetEnd")).getTime();
        } catch (Exception ex) {
            call.reject("Thời điểm kết thúc Focus không hợp lệ.", ex);
            return;
        }
        String focusTitle = call.getString("focusTitle", "việc đang làm");
        if (blockSelectedApps) {
            android.content.SharedPreferences prefs = getContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
            if (!prefs.getBoolean("blocking_disclosure_accepted", false) || !prefs.getBoolean("block_selected_apps", false)) {
                call.reject("Đọc và xác nhận giải thích quyền Trợ năng trước khi bật che ứng dụng.");
                return;
            }
            if (!SocialRestrictionAccessibilityService.isEnabled(getContext())) {
                call.reject("Cần bật dịch vụ Solo Leveling trong Cài đặt Trợ năng Android.");
                return;
            }
        }
        if (sendReminders) {
            if (!hasUsageAccess()) {
                call.reject("Cần cấp quyền Truy cập dữ liệu sử dụng trong Cài đặt Android.");
                return;
            }
            if (Build.VERSION.SDK_INT >= 33 && getPermissionState("notifications") != PermissionState.GRANTED) {
                call.reject("Cần cho phép thông báo để nhận lời nhắc trong phiên Focus.");
                return;
            }
            Intent intent = new Intent(getContext(), UsageProtectionService.class);
            intent.setAction(UsageProtectionService.ACTION_START);
            intent.putStringArrayListExtra(UsageProtectionService.EXTRA_PACKAGES, new ArrayList<>(selected));
            intent.putExtra(UsageProtectionService.EXTRA_BREAK_INTERVAL, call.getInt("breakInterval", 50));
            intent.putExtra(UsageProtectionService.EXTRA_TARGET_END, targetEnd);
            intent.putExtra(UsageProtectionService.EXTRA_FOCUS_TITLE, focusTitle);
            if (Build.VERSION.SDK_INT >= 26) getContext().startForegroundService(intent);
            else getContext().startService(intent);
            getContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putBoolean("monitoring", true).apply();
        } else {
            Intent intent = new Intent(getContext(), UsageProtectionService.class);
            intent.setAction(UsageProtectionService.ACTION_STOP);
            getContext().startService(intent);
            getContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putBoolean("monitoring", false).apply();
        }
        // Keep the session configuration available even when blocking is currently off.
        // The user may enable the voluntary cover while this Focus session is running.
        SocialRestrictionAccessibilityService.configureFocus(getContext(), selected, targetEnd, focusTitle);
        call.resolve(status());
    }

    @PluginMethod
    public void stopFocusProtection(PluginCall call) {
        Intent intent = new Intent(getContext(), UsageProtectionService.class);
        intent.setAction(UsageProtectionService.ACTION_STOP);
        getContext().startService(intent);
        SocialRestrictionAccessibilityService.stopFocus(getContext());
        getContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putBoolean("monitoring", false).apply();
        call.resolve();
    }

    private JSObject status() {
        boolean granted = hasUsageAccess() && (Build.VERSION.SDK_INT < 33 || getPermissionState("notifications") == PermissionState.GRANTED);
        android.content.SharedPreferences prefs = getContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        boolean monitoring = prefs.getBoolean("monitoring", false);
        boolean accessibilityGranted = SocialRestrictionAccessibilityService.isEnabled(getContext());
        boolean restrictionEnabled = prefs.getBoolean("block_selected_apps", false);
        boolean blockingMonitoring = restrictionEnabled && accessibilityGranted && prefs.getBoolean("focus_active", false)
            && prefs.getLong("focus_target_end", 0) > System.currentTimeMillis() && !prefs.getBoolean("blocking_paused_for_focus", false);
        JSObject result = new JSObject();
        result.put("platform", "android");
        result.put("supported", true);
        result.put("permissionGranted", granted);
        result.put("monitoring", monitoring);
        result.put("selectedCount", prefs.getString("selected", "").isEmpty() ? 0 : prefs.getString("selected", "").split(",").length);
        result.put("accessibilityPermissionGranted", accessibilityGranted);
        result.put("restrictionEnabled", restrictionEnabled);
        result.put("blockingMonitoring", blockingMonitoring);
        result.put("message", granted ? "Quyền sử dụng và thông báo đã sẵn sàng." : "Cần quyền sử dụng ứng dụng và thông báo.");
        return result;
    }

    private boolean hasUsageAccess() {
        AppOpsManager appOps = (AppOpsManager) getContext().getSystemService(Context.APP_OPS_SERVICE);
        int mode = appOps.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), getContext().getPackageName());
        return mode == AppOpsManager.MODE_ALLOWED;
    }

    private List<String> readIds(JSArray array) {
        List<String> ids = new ArrayList<>();
        if (array == null) return ids;
        for (int i = 0; i < array.length(); i++) {
            try {
                String value = array.getString(i);
                if (Arrays.asList(SOCIAL_PACKAGES).contains(value) && !ids.contains(value)) ids.add(value);
            } catch (JSONException ignored) {}
        }
        return ids;
    }
}
