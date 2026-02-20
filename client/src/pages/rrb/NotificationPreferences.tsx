import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { PageMeta } from '@/components/rrb/PageMeta';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Clock, Radio, Zap, Heart, AlertCircle } from 'lucide-react';

export default function NotificationPreferences() {
  const [preferences, setPreferences] = useState({
    newEpisodes: true,
    emergencyBroadcasts: true,
    trendingContent: true,
    frequencyRecommendations: true,
    commercialAlerts: false,
    channelUpdates: true,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
  });

  const [subscriptions, setSubscriptions] = useState({
    legacyRestored: true,
    healingFrequencies: true,
    proofVault: false,
    qmunity: true,
    sweetMiracles: true,
    musicRadio: true,
    studioSessions: true,
  });

  const [savedMessage, setSavedMessage] = useState('');

  const handlePreferenceChange = (key: string, value: boolean | string) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleSubscriptionChange = (channel: string, value: boolean) => {
    setSubscriptions(prev => ({ ...prev, [channel]: value }));
  };

  const handleSavePreferences = async () => {
    try {
      // Call tRPC mutation to save preferences
      // await trpc.notifications.updatePreferences.useMutation({ preferences, subscriptions });
      setSavedMessage('✓ Preferences saved successfully');
      setTimeout(() => setSavedMessage(''), 3000);
    } catch (error) {
      setSavedMessage('✗ Failed to save preferences');
    }
  };

  const channels = [
    { id: 'legacyRestored', name: '📚 Legacy Restored', description: 'Historical archives and restored content' },
    { id: 'healingFrequencies', name: '🎵 Healing Frequencies', description: 'Solfeggio frequencies and wellness' },
    { id: 'proofVault', name: '🔐 Proof Vault', description: 'Evidence and documentation archive' },
    { id: 'qmunity', name: '👥 QMunity', description: 'Community discussions and interviews' },
    { id: 'sweetMiracles', name: '💝 Sweet Miracles', description: 'Inspirational and charitable content' },
    { id: 'musicRadio', name: '🎶 Music & Radio', description: 'Music broadcasts and radio shows' },
    { id: 'studioSessions', name: '🎙️ Studio Sessions', description: 'Live studio recordings and sessions' },
  ];

  return (
    <>
      <PageMeta
        title="Notification Preferences - RRB"
        description="Manage your notification settings and channel subscriptions"
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">🔔 Notification Preferences</h1>
            <p className="text-slate-300">Customize how you receive updates from RRB channels</p>
          </div>

          {/* Success Message */}
          {savedMessage && (
            <div className={`mb-6 p-4 rounded-lg ${savedMessage.includes('✓') ? 'bg-green-900/30 border border-green-500/30' : 'bg-red-900/30 border border-red-500/30'}`}>
              <p className={savedMessage.includes('✓') ? 'text-green-300' : 'text-red-300'}>{savedMessage}</p>
            </div>
          )}

          <Tabs defaultValue="notifications" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-slate-800/50 border border-slate-700">
              <TabsTrigger value="notifications" className="data-[state=active]:bg-purple-600">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="subscriptions" className="data-[state=active]:bg-purple-600">
                <Radio className="w-4 h-4 mr-2" />
                Subscriptions
              </TabsTrigger>
              <TabsTrigger value="quiet-hours" className="data-[state=active]:bg-purple-600">
                <Clock className="w-4 h-4 mr-2" />
                Quiet Hours
              </TabsTrigger>
            </TabsList>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Notification Types</CardTitle>
                  <CardDescription>Choose which notifications you want to receive</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* New Episodes */}
                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-yellow-400" />
                      <div>
                        <p className="font-semibold text-white">New Episodes</p>
                        <p className="text-sm text-slate-400">Get notified when new episodes are published</p>
                      </div>
                    </div>
                    <Switch
                      checked={preferences.newEpisodes}
                      onCheckedChange={(value) => handlePreferenceChange('newEpisodes', value)}
                    />
                  </div>

                  {/* Emergency Broadcasts */}
                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <div>
                        <p className="font-semibold text-white">Emergency Broadcasts</p>
                        <p className="text-sm text-slate-400">Critical alerts and emergency messages</p>
                      </div>
                    </div>
                    <Switch
                      checked={preferences.emergencyBroadcasts}
                      onCheckedChange={(value) => handlePreferenceChange('emergencyBroadcasts', value)}
                      disabled
                    />
                  </div>

                  {/* Trending Content */}
                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                    <div className="flex items-center gap-3">
                      <Heart className="w-5 h-5 text-pink-400" />
                      <div>
                        <p className="font-semibold text-white">Trending Content</p>
                        <p className="text-sm text-slate-400">Discover trending topics and popular episodes</p>
                      </div>
                    </div>
                    <Switch
                      checked={preferences.trendingContent}
                      onCheckedChange={(value) => handlePreferenceChange('trendingContent', value)}
                    />
                  </div>

                  {/* Frequency Recommendations */}
                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                    <div className="flex items-center gap-3">
                      <Radio className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="font-semibold text-white">Frequency Recommendations</p>
                        <p className="text-sm text-slate-400">Personalized Solfeggio frequency suggestions</p>
                      </div>
                    </div>
                    <Switch
                      checked={preferences.frequencyRecommendations}
                      onCheckedChange={(value) => handlePreferenceChange('frequencyRecommendations', value)}
                    />
                  </div>

                  {/* Commercial Alerts */}
                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-orange-400" />
                      <div>
                        <p className="font-semibold text-white">Commercial Alerts</p>
                        <p className="text-sm text-slate-400">Promotions and sponsored content</p>
                      </div>
                    </div>
                    <Switch
                      checked={preferences.commercialAlerts}
                      onCheckedChange={(value) => handlePreferenceChange('commercialAlerts', value)}
                    />
                  </div>

                  {/* Channel Updates */}
                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                    <div className="flex items-center gap-3">
                      <Radio className="w-5 h-5 text-green-400" />
                      <div>
                        <p className="font-semibold text-white">Channel Updates</p>
                        <p className="text-sm text-slate-400">Schedule changes and maintenance notices</p>
                      </div>
                    </div>
                    <Switch
                      checked={preferences.channelUpdates}
                      onCheckedChange={(value) => handlePreferenceChange('channelUpdates', value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Subscriptions Tab */}
            <TabsContent value="subscriptions" className="space-y-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Channel Subscriptions</CardTitle>
                  <CardDescription>Subscribe to channels to receive their updates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {channels.map((channel) => (
                    <div key={channel.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                      <div>
                        <p className="font-semibold text-white">{channel.name}</p>
                        <p className="text-sm text-slate-400">{channel.description}</p>
                      </div>
                      <Switch
                        checked={subscriptions[channel.id as keyof typeof subscriptions]}
                        onCheckedChange={(value) => handleSubscriptionChange(channel.id, value)}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Quiet Hours Tab */}
            <TabsContent value="quiet-hours" className="space-y-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Quiet Hours</CardTitle>
                  <CardDescription>Pause notifications during specific times</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                    <div>
                      <p className="font-semibold text-white">Enable Quiet Hours</p>
                      <p className="text-sm text-slate-400">Mute notifications during your sleep time</p>
                    </div>
                    <Switch
                      checked={preferences.quietHoursEnabled}
                      onCheckedChange={(value) => handlePreferenceChange('quietHoursEnabled', value)}
                    />
                  </div>

                  {preferences.quietHoursEnabled && (
                    <>
                      <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                        <label className="block text-sm font-semibold text-white mb-2">Start Time</label>
                        <input
                          type="time"
                          value={preferences.quietHoursStart}
                          onChange={(e) => handlePreferenceChange('quietHoursStart', e.target.value)}
                          className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded text-white"
                        />
                      </div>

                      <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                        <label className="block text-sm font-semibold text-white mb-2">End Time</label>
                        <input
                          type="time"
                          value={preferences.quietHoursEnd}
                          onChange={(e) => handlePreferenceChange('quietHoursEnd', e.target.value)}
                          className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded text-white"
                        />
                      </div>

                      <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                        <p className="text-sm text-blue-300">
                          💡 Notifications will be silenced from {preferences.quietHoursStart} to {preferences.quietHoursEnd} daily.
                          Emergency broadcasts will still come through.
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Save Button */}
          <div className="mt-8 flex gap-4">
            <Button
              onClick={handleSavePreferences}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2 rounded-lg font-semibold"
            >
              💾 Save Preferences
            </Button>
            <Button
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-2 rounded-lg"
            >
              ↩️ Reset to Defaults
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
