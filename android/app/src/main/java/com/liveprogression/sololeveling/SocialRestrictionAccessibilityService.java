package com.liveprogression.sololeveling;

import android.accessibilityservice.AccessibilityService;
import android.accessibilityservice.AccessibilityServiceInfo;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.provider.Settings;
import android.text.TextUtils;
import android.view.Gravity;
import android.view.View;
import android.view.WindowManager;
import android.view.accessibility.AccessibilityEvent;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Voluntary, session-scoped app cover. The service reads only AccessibilityEvent.packageName;
 * it never requests the active window, node tree, text, screenshots, or typed content.
 */
public class SocialRestrictionAccessibilityService extends AccessibilityService {
    private static final String PREFS = "voluntary_protection";
    private static final String KEY_ACTIVE = "focus_active";
    private static final String KEY_PACKAGES = "selected";
    private static final String KEY_TARGET_END = "focus_target_end";
    private static final String KEY_FOCUS_TITLE = "focus_title";
    private static final String KEY_BLOCKING = "block_selected_apps";
    private static final String KEY_PAUSED = "blocking_paused_for_focus";
    private static final String KEY_BYPASS_PACKAGE = "blocking_bypass_package";
    private static final String KEY_BYPASS_UNTIL = "blocking_bypass_until";
    private static final String DISABLED_PACKAGE = "com.liveprogression.sololeveling.no_active_focus";
    private static final String[] ALLOWED_PACKAGES = {
        "com.zhiliaoapp.musically", "com.instagram.android", "com.facebook.katana"
    };
    private static volatile SocialRestrictionAccessibilityService instance;

    private final android.os.Handler handler = new android.os.Handler(android.os.Looper.getMainLooper());
    private WindowManager windowManager;
    private View overlay;
    private String visiblePackage = "";
    private String overlayPackage = "";
    private String bypassPackage = "";
    private long bypassUntil;
    private Runnable expiryTask;

    public static boolean isEnabled(Context context) {
        String enabled = Settings.Secure.getString(context.getContentResolver(), Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES);
        if (TextUtils.isEmpty(enabled)) return false;
        ComponentName component = new ComponentName(context, SocialRestrictionAccessibilityService.class);
        TextUtils.SimpleStringSplitter splitter = new TextUtils.SimpleStringSplitter(':');
        splitter.setString(enabled);
        while (splitter.hasNext()) {
            if (component.flattenToString().equalsIgnoreCase(splitter.next())) return true;
        }
        return false;
    }

    public static void configureFocus(Context context, List<String> selectedPackages, long targetEnd, String focusTitle) {
        String safeSelection = joinPackages(sanitize(selectedPackages));
        String safeTitle = TextUtils.isEmpty(focusTitle) ? "việc đang làm" : focusTitle.trim();
        if (safeTitle.length() > 100) safeTitle = safeTitle.substring(0, 100);
        context.getSharedPreferences(PREFS, MODE_PRIVATE).edit()
            .putBoolean(KEY_ACTIVE, true)
            .putString(KEY_PACKAGES, safeSelection)
            .putString(KEY_FOCUS_TITLE, safeTitle)
            .putLong(KEY_TARGET_END, targetEnd)
            .putBoolean(KEY_PAUSED, false)
            .putString(KEY_BYPASS_PACKAGE, "")
            .putLong(KEY_BYPASS_UNTIL, 0)
            .apply();
        if (instance != null) {
            instance.bypassPackage = "";
            instance.bypassUntil = 0;
        }
        if (instance != null) instance.reloadConfiguration();
    }

    public static void stopFocus(Context context) {
        context.getSharedPreferences(PREFS, MODE_PRIVATE).edit()
            .putBoolean(KEY_ACTIVE, false)
            .putBoolean(KEY_PAUSED, false)
            .putString(KEY_BYPASS_PACKAGE, "")
            .putLong(KEY_BYPASS_UNTIL, 0)
            .apply();
        if (instance != null) {
            instance.bypassPackage = "";
            instance.bypassUntil = 0;
        }
        if (instance != null) instance.reloadConfiguration();
    }

    public static void setBlockingEnabled(Context context, boolean enabled) {
        context.getSharedPreferences(PREFS, MODE_PRIVATE).edit().putBoolean(KEY_BLOCKING, enabled).apply();
        if (instance != null) instance.reloadConfiguration();
    }

    private static List<String> sanitize(List<String> packages) {
        List<String> safe = new ArrayList<>();
        if (packages == null) return safe;
        for (String name : packages) {
            if (Arrays.asList(ALLOWED_PACKAGES).contains(name) && !safe.contains(name)) safe.add(name);
        }
        return safe;
    }

    private static String joinPackages(List<String> packages) {
        StringBuilder joined = new StringBuilder();
        for (String name : packages) {
            if (joined.length() > 0) joined.append(',');
            joined.append(name);
        }
        return joined.toString();
    }

    @Override public void onServiceConnected() {
        super.onServiceConnected();
        instance = this;
        windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);
        reloadConfiguration();
    }

    private void reloadConfiguration() {
        android.content.SharedPreferences prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
        bypassPackage = prefs.getString(KEY_BYPASS_PACKAGE, "");
        bypassUntil = prefs.getLong(KEY_BYPASS_UNTIL, 0);
        boolean active = prefs.getBoolean(KEY_ACTIVE, false)
            && prefs.getBoolean(KEY_BLOCKING, false)
            && !prefs.getBoolean(KEY_PAUSED, false)
            && prefs.getLong(KEY_TARGET_END, 0) > System.currentTimeMillis();
        List<String> selected = sanitize(Arrays.asList(prefs.getString(KEY_PACKAGES, "").split(",")));
        AccessibilityServiceInfo info = getServiceInfo();
        if (info != null) {
            info.eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED;
            info.feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC;
            info.notificationTimeout = 80;
            info.packageNames = active && !selected.isEmpty() ? selected.toArray(new String[0]) : new String[]{DISABLED_PACKAGE};
            setServiceInfo(info);
        }
        if (!active) hideOverlay();
        else if (selected.contains(visiblePackage)
            && !(visiblePackage.equals(bypassPackage) && bypassUntil > System.currentTimeMillis())) {
            showOverlay(visiblePackage);
        }
        scheduleFocusExpiry(prefs.getLong(KEY_TARGET_END, 0));
    }

    private void scheduleFocusExpiry(long targetEnd) {
        if (expiryTask != null) handler.removeCallbacks(expiryTask);
        if (targetEnd <= System.currentTimeMillis()) return;
        expiryTask = () -> {
            android.content.SharedPreferences prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
            if (prefs.getLong(KEY_TARGET_END, 0) <= System.currentTimeMillis()) stopFocus(getApplicationContext());
            else scheduleFocusExpiry(prefs.getLong(KEY_TARGET_END, 0));
        };
        handler.postDelayed(expiryTask, Math.max(1, targetEnd - System.currentTimeMillis()));
    }

    @Override public void onAccessibilityEvent(AccessibilityEvent event) {
        if (event == null || event.getEventType() != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return;
        CharSequence packageName = event.getPackageName();
        if (packageName == null) return;
        String foreground = packageName.toString();
        android.content.SharedPreferences prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
        long targetEnd = prefs.getLong(KEY_TARGET_END, 0);
        if (!prefs.getBoolean(KEY_ACTIVE, false) || targetEnd <= System.currentTimeMillis()) {
            stopFocus(getApplicationContext());
            return;
        }
        boolean selected = prefs.getBoolean(KEY_BLOCKING, false)
            && !prefs.getBoolean(KEY_PAUSED, false)
            && sanitize(Arrays.asList(prefs.getString(KEY_PACKAGES, "").split(","))).contains(foreground);
        if (!selected) {
            visiblePackage = "";
            hideOverlay();
            return;
        }
        visiblePackage = foreground;
        if (foreground.equals(bypassPackage) && bypassUntil > System.currentTimeMillis()) {
            hideOverlay();
            return;
        }
        if (bypassUntil <= System.currentTimeMillis()) {
            bypassPackage = "";
            bypassUntil = 0;
            prefs.edit().remove(KEY_BYPASS_PACKAGE).putLong(KEY_BYPASS_UNTIL, 0).apply();
        }
        showOverlay(foreground);
    }

    private void showOverlay(String packageName) {
        if (windowManager == null || packageName == null || packageName.isEmpty()) return;
        if (overlay != null && packageName.equals(overlayPackage)) return;
        hideOverlay();
        String focusTitle = getSharedPreferences(PREFS, MODE_PRIVATE).getString(KEY_FOCUS_TITLE, "việc đang làm");
        overlay = buildOverlay(packageName, focusTitle);
        WindowManager.LayoutParams params = new WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY,
            WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT
        );
        params.gravity = Gravity.TOP | Gravity.START;
        params.setTitle("Solo Leveling — lời nhắc Focus");
        try { windowManager.addView(overlay, params); overlayPackage = packageName; }
        catch (RuntimeException error) { overlay = null; overlayPackage = ""; }
    }

    private View buildOverlay(String packageName, String focusTitle) {
        int navy = Color.rgb(10, 20, 37), panel = Color.rgb(18, 35, 57), cyan = Color.rgb(88, 218, 232), muted = Color.rgb(197, 211, 230);
        LinearLayout root = new LinearLayout(this);
        root.setGravity(Gravity.CENTER);
        root.setPadding(dp(24), dp(24), dp(24), dp(24));
        root.setBackgroundColor(0xF20A1425);
        ScrollView scroll = new ScrollView(this);
        LinearLayout card = new LinearLayout(this);
        card.setOrientation(LinearLayout.VERTICAL);
        card.setPadding(dp(24), dp(26), dp(24), dp(24));
        GradientDrawable background = new GradientDrawable(GradientDrawable.Orientation.TL_BR, new int[]{0xFF18314D, panel});
        background.setCornerRadius(dp(18));
        background.setStroke(dp(1), 0xFF3B697C);
        card.setBackground(background);
        TextView eyebrow = text("SOLO LEVELING · FOCUS", 12, cyan, true); eyebrow.setLetterSpacing(.08f); card.addView(eyebrow);
        TextView title = text("Bạn đang mở " + appLabel(packageName), 25, Color.WHITE, true); title.setPadding(0, dp(16), 0, dp(10)); card.addView(title);
        TextView task = text("Việc bạn chọn: " + focusTitle, 16, cyan, true); task.setMaxLines(2); task.setEllipsize(android.text.TextUtils.TruncateAt.END); task.setPadding(0, 0, 0, dp(12)); card.addView(task);
        TextView detail = text("Bạn đã tự chọn che ứng dụng này trong phiên Focus. Hãy cân nhắc quay lại việc đang làm.", 15, muted, false); detail.setPadding(0, 0, 0, dp(12)); card.addView(detail);
        TextView contact = text("Cần gọi hoặc nhắn tin bên trong ứng dụng này? Tạm cho phép 10 phút rồi tự trở lại lời nhắc.", 13, muted, false); contact.setPadding(0, 0, 0, dp(16)); card.addView(contact);
        Button returnButton = button("Mở Solo Leveling", cyan, navy);
        returnButton.setOnClickListener(v -> openSoloLeveling()); card.addView(returnButton);
        Button allowButton = button("Tạm cho phép 10 phút", 0xFF24435B, Color.WHITE);
        allowButton.setOnClickListener(v -> allowTemporarily(packageName)); card.addView(allowButton);
        Button pauseButton = button("Tắt che cho phiên Focus này", 0xFF2B3545, Color.WHITE);
        pauseButton.setOnClickListener(v -> pauseForCurrentFocus()); card.addView(pauseButton);
        scroll.addView(card);
        root.addView(scroll, new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT));
        return root;
    }

    private TextView text(String value, float size, int color, boolean bold) {
        TextView view = new TextView(this);
        view.setText(value); view.setTextSize(size); view.setTextColor(color);
        if (bold) view.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        view.setGravity(Gravity.CENTER_HORIZONTAL);
        return view;
    }

    private Button button(String value, int background, int foreground) {
        Button button = new Button(this);
        button.setText(value); button.setAllCaps(false); button.setTextColor(foreground); button.setTextSize(14);
        GradientDrawable shape = new GradientDrawable(); shape.setColor(background); shape.setCornerRadius(dp(10));
        button.setBackground(shape); button.setMinHeight(dp(48));
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        params.topMargin = dp(9); button.setLayoutParams(params);
        return button;
    }

    private void openSoloLeveling() {
        hideOverlay();
        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        try { startActivity(intent); } catch (RuntimeException ignored) { performGlobalAction(GLOBAL_ACTION_HOME); }
    }

    private void allowTemporarily(String packageName) {
        bypassPackage = packageName;
        bypassUntil = System.currentTimeMillis() + 10 * 60_000L;
        getSharedPreferences(PREFS, MODE_PRIVATE).edit()
            .putString(KEY_BYPASS_PACKAGE, bypassPackage).putLong(KEY_BYPASS_UNTIL, bypassUntil).apply();
        hideOverlay();
        handler.postDelayed(() -> {
            if (packageName.equals(bypassPackage) && packageName.equals(visiblePackage) && bypassUntil <= System.currentTimeMillis()) {
                bypassPackage = "";
                bypassUntil = 0;
                getSharedPreferences(PREFS, MODE_PRIVATE).edit().remove(KEY_BYPASS_PACKAGE).putLong(KEY_BYPASS_UNTIL, 0).apply();
                showOverlay(packageName);
            }
        }, 10 * 60_000L);
    }

    private void pauseForCurrentFocus() {
        getSharedPreferences(PREFS, MODE_PRIVATE).edit().putBoolean(KEY_PAUSED, true).apply();
        reloadConfiguration();
    }

    private void hideOverlay() {
        if (overlay != null && windowManager != null) {
            try { windowManager.removeView(overlay); } catch (RuntimeException ignored) {}
        }
        overlay = null;
        overlayPackage = "";
    }

    private String appLabel(String packageName) {
        if ("com.zhiliaoapp.musically".equals(packageName)) return "TikTok";
        if ("com.instagram.android".equals(packageName)) return "Instagram";
        if ("com.facebook.katana".equals(packageName)) return "Facebook";
        return "ứng dụng đã chọn";
    }

    private int dp(int value) { return (int) (value * getResources().getDisplayMetrics().density + .5f); }

    @Override public void onInterrupt() { hideOverlay(); }
    @Override public void onDestroy() {
        hideOverlay();
        if (expiryTask != null) handler.removeCallbacks(expiryTask);
        if (instance == this) instance = null;
        super.onDestroy();
    }
}
