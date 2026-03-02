import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Bell, Palette, Globe, LayoutGrid } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";

export default function UserPreferencesPanel() {
  const { theme, setTheme } = useTheme();
  const [preferences, setPreferences] = useState({
    theme: theme || "light",
    language: "en",
    notifications: {
      email: true,
      push: true,
      sound: true,
      desktop: true,
    },
    dashboard: {
      autoRefresh: true,
      refreshInterval: "30s",
      compactView: false,
      showNotifications: true,
    },
    privacy: {
      shareActivity: true,
      shareLocation: false,
      allowAnalytics: true,
    },
  });

  const handleThemeChange = (newTheme: string) => {
    setPreferences({ ...preferences, theme: newTheme });
    setTheme(newTheme as any);
    toast.success(`Theme changed to ${newTheme}`);
  };

  const handleLanguageChange = (lang: string) => {
    setPreferences({ ...preferences, language: lang });
    toast.success(`Language changed to ${lang}`);
  };

  const handleNotificationChange = (key: string) => {
    setPreferences({
      ...preferences,
      notifications: {
        ...preferences.notifications,
        [key]: !preferences.notifications[key as keyof typeof preferences.notifications],
      },
    });
  };

  const handleDashboardChange = (key: string) => {
    setPreferences({
      ...preferences,
      dashboard: {
        ...preferences.dashboard,
        [key]: !preferences.dashboard[key as keyof typeof preferences.dashboard],
      },
    });
  };

  const handlePrivacyChange = (key: string) => {
    setPreferences({
      ...preferences,
      privacy: {
        ...preferences.privacy,
        [key]: !preferences.privacy[key as keyof typeof preferences.privacy],
      },
    });
  };

  const handleSavePreferences = () => {
    localStorage.setItem("userPreferences", JSON.stringify(preferences));
    toast.success("Preferences saved successfully");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary" />
            User Preferences
          </h1>
          <p className="text-slate-600">Customize your Qumus experience</p>
        </div>

        <div className="grid gap-6">
          {/* Theme Settings */}
          <Card className="p-6 border-0 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-slate-900">Appearance</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Theme</label>
                <Select value={preferences.theme} onValueChange={handleThemeChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">Auto (System)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Language Settings */}
          <Card className="p-6 border-0 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-slate-900">Language</h2>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Preferred Language</label>
              <Select value={preferences.language} onValueChange={handleLanguageChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                  <SelectItem value="zh">中文</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Notification Settings */}
          <Card className="p-6 border-0 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-slate-900">Notifications</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-700">Email Notifications</span>
                <Switch
                  checked={preferences.notifications.email}
                  onCheckedChange={() => handleNotificationChange("email")}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-700">Push Notifications</span>
                <Switch
                  checked={preferences.notifications.push}
                  onCheckedChange={() => handleNotificationChange("push")}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-700">Sound Alerts</span>
                <Switch
                  checked={preferences.notifications.sound}
                  onCheckedChange={() => handleNotificationChange("sound")}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-700">Desktop Notifications</span>
                <Switch
                  checked={preferences.notifications.desktop}
                  onCheckedChange={() => handleNotificationChange("desktop")}
                />
              </div>
            </div>
          </Card>

          {/* Dashboard Settings */}
          <Card className="p-6 border-0 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <LayoutGrid className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-slate-900">Dashboard</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-700">Auto-refresh Data</span>
                <Switch
                  checked={preferences.dashboard.autoRefresh}
                  onCheckedChange={() => handleDashboardChange("autoRefresh")}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Refresh Interval</label>
                <Select value={preferences.dashboard.refreshInterval} onValueChange={(val) => {
                  setPreferences({
                    ...preferences,
                    dashboard: { ...preferences.dashboard, refreshInterval: val },
                  });
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10s">10 seconds</SelectItem>
                    <SelectItem value="30s">30 seconds</SelectItem>
                    <SelectItem value="60s">1 minute</SelectItem>
                    <SelectItem value="300s">5 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-700">Compact View</span>
                <Switch
                  checked={preferences.dashboard.compactView}
                  onCheckedChange={() => handleDashboardChange("compactView")}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-700">Show Notifications</span>
                <Switch
                  checked={preferences.dashboard.showNotifications}
                  onCheckedChange={() => handleDashboardChange("showNotifications")}
                />
              </div>
            </div>
          </Card>

          {/* Privacy Settings */}
          <Card className="p-6 border-0 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-slate-900">Privacy & Security</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-700">Share Activity Status</span>
                <Switch
                  checked={preferences.privacy.shareActivity}
                  onCheckedChange={() => handlePrivacyChange("shareActivity")}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-700">Share Location</span>
                <Switch
                  checked={preferences.privacy.shareLocation}
                  onCheckedChange={() => handlePrivacyChange("shareLocation")}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-700">Allow Analytics</span>
                <Switch
                  checked={preferences.privacy.allowAnalytics}
                  onCheckedChange={() => handlePrivacyChange("allowAnalytics")}
                />
              </div>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => window.history.back()}>
              Cancel
            </Button>
            <Button onClick={handleSavePreferences} className="gap-2">
              <Settings className="w-4 h-4" />
              Save Preferences
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
