/**
 * Unified Avatar Management
 * Manage user avatars across all platforms and services
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export default function UnifiedAvatarManagement() {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [avatars, setAvatars] = useState<any[]>([]);

  // Fetch user avatars
  useEffect(() => {
    if (user?.id) {
      // TODO: Implement tRPC query to fetch avatars
      // const { data } = trpc.avatars.list.useQuery({ userId: user.id });
    }
  }, [user?.id]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // TODO: Implement avatar upload
      toast.success('Avatar uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Avatar Management</h1>
          <p className="text-muted-foreground">Manage your avatars across all platforms and services</p>
        </div>

        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="current">Current Avatar</TabsTrigger>
            <TabsTrigger value="gallery">Avatar Gallery</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Current Avatar</CardTitle>
                <CardDescription>Your active avatar across all platforms</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {user?.avatar ? (
                  <div className="flex items-center gap-4">
                    <img
                      src={user.avatar}
                      alt="Current avatar"
                      className="w-32 h-32 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm text-muted-foreground">Current avatar</p>
                      <p className="font-medium">{user.name || 'User'}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No avatar set</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gallery" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Avatar Gallery</CardTitle>
                <CardDescription>Your saved avatars</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {avatars.length > 0 ? (
                    avatars.map((avatar) => (
                      <div
                        key={avatar.id}
                        className="cursor-pointer rounded-lg overflow-hidden hover:opacity-80 transition"
                      >
                        <img
                          src={avatar.url}
                          alt={avatar.name}
                          className="w-full h-32 object-cover"
                        />
                      </div>
                    ))
                  ) : (
                    <p className="col-span-full text-muted-foreground">No avatars yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upload New Avatar</CardTitle>
                <CardDescription>Upload a new avatar image</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="avatar-upload">Avatar Image</Label>
                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                    className="mt-2"
                  />
                </div>
                <Button disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload Avatar'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Avatar Settings</CardTitle>
                <CardDescription>Configure avatar behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="avatar-name">Avatar Name</Label>
                  <Input
                    id="avatar-name"
                    placeholder="Enter avatar name"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                  />
                </div>
                <Button>Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
