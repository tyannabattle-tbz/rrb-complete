import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function NotificationPreferencesDashboard() {
  const [preferences, setPreferences] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const getPreferencesQuery = trpc.finalFeatures.notifications.getPreferences.useQuery();
  const getStatisticsQuery = trpc.finalFeatures.notifications.getStatistics.useQuery();
  const setPreferencesMutation = trpc.finalFeatures.notifications.setPreferences.useMutation();

  useEffect(() => {
    if (getPreferencesQuery.data) {
      setPreferences(getPreferencesQuery.data);
      setLoading(false);
    }
  }, [getPreferencesQuery.data]);

  const handlePreferenceChange = async (key: string, value: any) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);

    try {
      await setPreferencesMutation.mutateAsync(updated);
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading notification preferences...</div>;
  }

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold">Notification Preferences</h1>
        <p className="text-gray-600 mt-2">Manage how you receive notifications from Rockin Rockin Boogie</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notification Channels */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Channels</CardTitle>
            <CardDescription>Choose how you want to receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Email Notifications</label>
              <Switch
                checked={preferences?.emailNotifications}
                onCheckedChange={(value) => handlePreferenceChange('emailNotifications', value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">SMS Notifications</label>
              <Switch
                checked={preferences?.smsNotifications}
                onCheckedChange={(value) => handlePreferenceChange('smsNotifications', value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Alert Types */}
        <Card>
          <CardHeader>
            <CardTitle>Alert Types</CardTitle>
            <CardDescription>Choose which alerts you want to receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Favorite Channel Alerts</label>
              <Switch
                checked={preferences?.favoriteChannelAlerts}
                onCheckedChange={(value) => handlePreferenceChange('favoriteChannelAlerts', value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">New Episode Alerts</label>
              <Switch
                checked={preferences?.newEpisodeAlerts}
                onCheckedChange={(value) => handlePreferenceChange('newEpisodeAlerts', value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Sponsorship Alerts</label>
              <Switch
                checked={preferences?.sponsorshipAlerts}
                onCheckedChange={(value) => handlePreferenceChange('sponsorshipAlerts', value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Frequency & Digest */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Frequency</CardTitle>
            <CardDescription>How often do you want to receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">Frequency</label>
              <Select
                value={preferences?.notificationFrequency}
                onValueChange={(value) => handlePreferenceChange('notificationFrequency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Daily Digest</label>
              <Switch
                checked={preferences?.dailyDigest}
                onCheckedChange={(value) => handlePreferenceChange('dailyDigest', value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Statistics</CardTitle>
            <CardDescription>Your notification activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {getStatisticsQuery.data && (
              <>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Total Notifications</span>
                  <span className="text-lg font-bold">{getStatisticsQuery.data.totalNotifications}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Unread</span>
                  <span className="text-lg font-bold text-blue-600">{getStatisticsQuery.data.unreadCount}</span>
                </div>
                <div className="pt-2 border-t space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Channel Alerts</span>
                    <span>{getStatisticsQuery.data.byType.favorite_channel}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Episode Alerts</span>
                    <span>{getStatisticsQuery.data.byType.new_episode}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Sponsorships</span>
                    <span>{getStatisticsQuery.data.byType.sponsorship}</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button variant="default" onClick={() => window.location.reload()}>
          Save Changes
        </Button>
        <Button variant="outline">Reset to Defaults</Button>
      </div>
    </div>
  );
}
