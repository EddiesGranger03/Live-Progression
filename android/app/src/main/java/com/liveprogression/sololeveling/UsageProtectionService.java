package com.liveprogression.sololeveling;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.app.usage.UsageEvents;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import androidx.core.app.NotificationCompat;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;

public class UsageProtectionService extends Service {
    public static final String ACTION_START = "com.liveprogression.sololeveling.START_PROTECTION";
    public static final String ACTION_STOP = "com.liveprogression.sololeveling.STOP_PROTECTION";
    public static final String EXTRA_PACKAGES = "selected_packages";
    public static final String EXTRA_BREAK_INTERVAL = "break_interval";
    public static final String EXTRA_TARGET_END = "target_end";
    public static final String EXTRA_FOCUS_TITLE = "focus_title";
    private static final String PREFS = "voluntary_protection";
    private static final String CHANNEL = "focus_protection";
    private static final int FOREGROUND_NOTIFICATION = 4401;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Runnable poller = new Runnable() { @Override public void run() { pollUsage(); } };
    private final Set<String> selected = new HashSet<>();
    private long focusStartedAt;
    private long focusTargetEnd;
    private long breakAfterMillis;
    private boolean breakNotified;
    private String currentPackage = "";
    private String focusTitle = "việc đang làm";

    @Override public void onCreate() { super.onCreate(); createChannels(); }

    @Override public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null || ACTION_STOP.equals(intent.getAction())) { stopSelf(); return START_NOT_STICKY; }
        if (ACTION_START.equals(intent.getAction())) {
            ArrayList<String> packages = intent.getStringArrayListExtra(EXTRA_PACKAGES);
            selected.clear();
            if (packages != null) selected.addAll(packages);
            focusStartedAt = System.currentTimeMillis();
            focusTargetEnd = intent.getLongExtra(EXTRA_TARGET_END, focusStartedAt);
            focusTitle = intent.getStringExtra(EXTRA_FOCUS_TITLE);
            if (focusTitle == null || focusTitle.trim().isEmpty()) focusTitle = "việc đang làm";
            else if (focusTitle.length() > 100) focusTitle = focusTitle.substring(0, 100);
            breakAfterMillis = intent.getIntExtra(EXTRA_BREAK_INTERVAL, 50) * 60_000L;
            breakNotified = false;
            currentPackage = "";
            startForegroundNotification();
            handler.removeCallbacks(poller);
            handler.post(poller);
        }
        return START_NOT_STICKY;
    }

    private void startForegroundNotification() {
        Notification notification = new NotificationCompat.Builder(this, CHANNEL)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentTitle("Bảo vệ Focus đang bật")
            .setContentText("Chỉ kiểm tra ứng dụng đã chọn đến khi phiên kết thúc.")
            .setOngoing(true)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .build();
        if (Build.VERSION.SDK_INT >= 34) startForeground(FOREGROUND_NOTIFICATION, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE);
        else startForeground(FOREGROUND_NOTIFICATION, notification);
    }

    private void pollUsage() {
        long now = System.currentTimeMillis();
        if (now >= focusTargetEnd) { stopSelf(); return; }
        UsageStatsManager manager = (UsageStatsManager) getSystemService(Context.USAGE_STATS_SERVICE);
        UsageEvents events = manager.queryEvents(Math.max(focusStartedAt, now - 60_000L), now);
        UsageEvents.Event event = new UsageEvents.Event();
        String foreground = currentPackage;
        while (events != null && events.hasNextEvent()) {
            events.getNextEvent(event);
            int type = event.getEventType();
            if (type == UsageEvents.Event.ACTIVITY_RESUMED || type == UsageEvents.Event.MOVE_TO_FOREGROUND) {
                String eventPackage = event.getPackageName();
                foreground = selected.contains(eventPackage) ? eventPackage : "";
            } else if ((type == UsageEvents.Event.ACTIVITY_PAUSED || type == UsageEvents.Event.MOVE_TO_BACKGROUND)
                && selected.contains(event.getPackageName()) && event.getPackageName().equals(foreground)) {
                foreground = "";
            }
        }
        if (!foreground.equals(currentPackage)) {
            currentPackage = foreground;
            if (selected.contains(foreground)) postReminder("Mở ứng dụng mạng xã hội?", "Bạn đã chọn nhận lời nhắc. Có thể quay lại: " + focusTitle, 4402);
        }
        if (!breakNotified && now - focusStartedAt >= breakAfterMillis) {
            breakNotified = true;
            postReminder("Đến lúc đổi tư thế", "Bạn đã Focus một lúc. Cân nhắc đứng lên vận động rồi quay lại.", 4403);
        }
        handler.postDelayed(poller, 15_000L);
    }

    private void postReminder(String title, String body, int id) {
        Intent open = new Intent(this, MainActivity.class);
        PendingIntent pending = PendingIntent.getActivity(this, id, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        Notification notification = new NotificationCompat.Builder(this, CHANNEL)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
            .setContentIntent(pending)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .build();
        ((NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE)).notify(id, notification);
    }

    private void createChannels() {
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(new NotificationChannel(CHANNEL, "Nhắc trong phiên Focus", NotificationManager.IMPORTANCE_DEFAULT));
        }
    }

    @Override public void onDestroy() {
        handler.removeCallbacks(poller);
        getSharedPreferences(PREFS, MODE_PRIVATE).edit().putBoolean("monitoring", false).apply();
        super.onDestroy();
    }

    @Override public IBinder onBind(Intent intent) { return null; }
}
