import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Moon, Sun, Bell, Lock, Palette } from "lucide-react";

export function SettingsPanel() {
  const { theme, toggleTheme, switchable } = useTheme();
  const [notificationSettings, setNotificationSettings] = useState({
    quotaAlerts: true,
    sessionNotifications: true,
    collaborationInvites: true,
    typingIndicators: true,
    emailNotifications: false,
  });

  const handleNotificationChange = (key: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your preferences and account settings</p>
      </div>

      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Theme Settings
              </CardTitle>
              <CardDescription>
                Customize the appearance of your interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {theme === "dark" ? (
                      <Moon className="w-5 h-5 text-slate-600" />
                    ) : (
                      <Sun className="w-5 h-5 text-yellow-500" />
                    )}
                    <div>
                      <Label className="text-base font-medium cursor-pointer">
                        Dark Mode
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {theme === "dark" ? "Currently using dark theme" : "Currently using light theme"}
                      </p>
                    </div>
                  </div>
                  {switchable && (
                    <Switch
                      checked={theme === "dark"}
                      onCheckedChange={toggleTheme}
                    />
                  )}
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                  <p className="text-sm font-medium mb-3">Theme Preview</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white dark:bg-slate-800 border rounded text-center text-xs font-medium">
                      Light Mode
                    </div>
                    <div className="p-3 bg-slate-900 text-white rounded text-center text-xs font-medium">
                      Dark Mode
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Color Scheme</CardTitle>
              <CardDescription>
                Choose your preferred color scheme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3">
                {["blue", "purple", "green", "orange"].map((color) => (
                  <button
                    key={color}
                    className={`p-4 rounded-lg border-2 capitalize font-medium transition-all ${
                      color === "blue"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose which notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  key: "quotaAlerts" as const,
                  label: "Quota Alerts",
                  description: "Get notified when you reach 50%, 75%, and 90% of your monthly quota",
                },
                {
                  key: "sessionNotifications" as const,
                  label: "Session Notifications",
                  description: "Receive updates when sessions are created, renamed, or deleted",
                },
                {
                  key: "collaborationInvites" as const,
                  label: "Collaboration Invites",
                  description: "Get notified when someone invites you to collaborate",
                },
                {
                  key: "typingIndicators" as const,
                  label: "Typing Indicators",
                  description: "See when collaborators are typing in shared sessions",
                },
                {
                  key: "emailNotifications" as const,
                  label: "Email Notifications",
                  description: "Receive important updates via email",
                },
              ].map((setting) => (
                <div
                  key={setting.key}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <Label className="text-base font-medium cursor-pointer">
                      {setting.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  </div>
                  <Switch
                    checked={notificationSettings[setting.key]}
                    onCheckedChange={() => handleNotificationChange(setting.key)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Frequency</CardTitle>
              <CardDescription>
                Control how often you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {["Immediate", "Hourly", "Daily", "Weekly"].map((frequency) => (
                <button
                  key={frequency}
                  className="w-full p-3 text-left border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                  {frequency}
                </button>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Privacy Settings
              </CardTitle>
              <CardDescription>
                Manage your privacy and security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label className="text-base font-medium">Profile Visibility</Label>
                    <p className="text-sm text-muted-foreground">Allow others to see your profile</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label className="text-base font-medium">Session History</Label>
                    <p className="text-sm text-muted-foreground">Keep your session history private</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label className="text-base font-medium">Activity Tracking</Label>
                    <p className="text-sm text-muted-foreground">Allow analytics tracking</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Export or delete your data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full">
                Export My Data
              </Button>
              <Button variant="outline" className="w-full text-red-600 hover:text-red-700">
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
