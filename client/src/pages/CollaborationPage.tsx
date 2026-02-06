import { useState, useEffect } from 'react';
import { Users, MessageCircle, MapPin, Eye, Clock, Zap, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface User {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: Date;
  currentLocation?: string;
  isTyping?: boolean;
  activity?: string;
}

const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    avatar: '👩‍💻',
    status: 'online',
    lastSeen: new Date(),
    currentLocation: 'New York',
    isTyping: false,
    activity: 'Listening to podcast',
  },
  {
    id: '2',
    name: 'Bob Smith',
    avatar: '👨‍💼',
    status: 'online',
    lastSeen: new Date(),
    currentLocation: 'London',
    isTyping: true,
    activity: 'Typing in chat',
  },
  {
    id: '3',
    name: 'Carol Davis',
    avatar: '👩‍🎨',
    status: 'away',
    lastSeen: new Date(Date.now() - 5 * 60000),
    currentLocation: 'Tokyo',
    isTyping: false,
    activity: 'Watching broadcast',
  },
  {
    id: '4',
    name: 'David Wilson',
    avatar: '👨‍🔬',
    status: 'offline',
    lastSeen: new Date(Date.now() - 30 * 60000),
    currentLocation: 'Berlin',
    isTyping: false,
    activity: 'Last seen 30 min ago',
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'online':
      return 'bg-green-500';
    case 'away':
      return 'bg-yellow-500';
    case 'offline':
      return 'bg-gray-500';
    default:
      return 'bg-gray-400';
  }
};

const formatLastSeen = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
};

export default function CollaborationPage() {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [activeTab, setActiveTab] = useState('presence');

  const onlineUsers = users.filter((u) => u.status === 'online');
  const awayUsers = users.filter((u) => u.status === 'away');
  const offlineUsers = users.filter((u) => u.status === 'offline');

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setUsers((prevUsers) =>
        prevUsers.map((user) => {
          if (user.id === '2' && Math.random() > 0.7) {
            return { ...user, isTyping: !user.isTyping };
          }
          return user;
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">🤝 Real-Time Collaboration</h1>
          <p className="text-slate-600">See who's online, track presence, and collaborate in real-time</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-white border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-slate-900">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </Card>

          <Card className="p-6 bg-white border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Online Now</p>
                <p className="text-3xl font-bold text-green-600">{onlineUsers.length}</p>
              </div>
              <Activity className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </Card>

          <Card className="p-6 bg-white border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Typing</p>
                <p className="text-3xl font-bold text-purple-600">
                  {users.filter((u) => u.isTyping).length}
                </p>
              </div>
              <Zap className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
          </Card>

          <Card className="p-6 bg-white border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Locations</p>
                <p className="text-3xl font-bold text-orange-600">
                  {new Set(users.map((u) => u.currentLocation)).size}
                </p>
              </div>
              <MapPin className="w-8 h-8 text-orange-500 opacity-50" />
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-white border-slate-200">
            <TabsTrigger value="presence">Presence</TabsTrigger>
            <TabsTrigger value="activity">Activity Feed</TabsTrigger>
            <TabsTrigger value="typing">Typing Indicators</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
          </TabsList>

          {/* Presence Tab */}
          <TabsContent value="presence" className="space-y-4">
            {/* Online Users */}
            {onlineUsers.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  Online ({onlineUsers.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {onlineUsers.map((user) => (
                    <Card
                      key={user.id}
                      className={`p-4 cursor-pointer transition-all border-2 ${
                        selectedUser === user.id
                          ? 'bg-blue-50 border-blue-300'
                          : 'bg-white border-slate-200 hover:border-blue-300'
                      }`}
                      onClick={() => setSelectedUser(user.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <span className="text-3xl">{user.avatar}</span>
                          <div className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(user.status)} rounded-full border-2 border-white`}></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900">{user.name}</p>
                          {user.isTyping && (
                            <p className="text-xs text-blue-600 font-semibold animate-pulse">
                              ✏️ typing...
                            </p>
                          )}
                          <div className="flex items-center gap-1 text-xs text-slate-600 mt-1">
                            <MapPin className="w-3 h-3" />
                            <span>{user.currentLocation}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{user.activity}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Away Users */}
            {awayUsers.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                  Away ({awayUsers.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {awayUsers.map((user) => (
                    <Card
                      key={user.id}
                      className="p-4 bg-white border-slate-200 opacity-75 hover:opacity-100 transition-opacity"
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <span className="text-3xl">{user.avatar}</span>
                          <div className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(user.status)} rounded-full border-2 border-white`}></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900">{user.name}</p>
                          <div className="flex items-center gap-1 text-xs text-slate-600 mt-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatLastSeen(user.lastSeen)}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Offline Users */}
            {offlineUsers.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 bg-gray-500 rounded-full"></span>
                  Offline ({offlineUsers.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {offlineUsers.map((user) => (
                    <Card
                      key={user.id}
                      className="p-4 bg-white border-slate-200 opacity-50"
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <span className="text-3xl grayscale">{user.avatar}</span>
                          <div className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(user.status)} rounded-full border-2 border-white`}></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-600">{user.name}</p>
                          <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatLastSeen(user.lastSeen)}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Activity Feed Tab */}
          <TabsContent value="activity" className="space-y-3">
            <Card className="p-6 bg-white border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <span className="text-2xl">👩‍💻</span>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">Alice Johnson</p>
                    <p className="text-sm text-slate-600">Started listening to podcast</p>
                    <p className="text-xs text-slate-500 mt-1">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <span className="text-2xl">👨‍💼</span>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">Bob Smith</p>
                    <p className="text-sm text-slate-600">Joined London chat room</p>
                    <p className="text-xs text-slate-500 mt-1">5 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <span className="text-2xl">👩‍🎨</span>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">Carol Davis</p>
                    <p className="text-sm text-slate-600">Shared a broadcast</p>
                    <p className="text-xs text-slate-500 mt-1">10 minutes ago</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Typing Indicators Tab */}
          <TabsContent value="typing" className="space-y-3">
            <Card className="p-6 bg-white border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-4">Who's Typing?</h3>
              {users.filter((u) => u.isTyping).length > 0 ? (
                <div className="space-y-3">
                  {users
                    .filter((u) => u.isTyping)
                    .map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
                      >
                        <span className="text-2xl animate-bounce">{user.avatar}</span>
                        <div>
                          <p className="font-semibold text-slate-900">{user.name}</p>
                          <p className="text-sm text-blue-600">
                            ✏️ typing in {user.currentLocation}...
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-slate-600 text-center py-6">No one is typing right now</p>
              )}
            </Card>
          </TabsContent>

          {/* Locations Tab */}
          <TabsContent value="locations" className="space-y-3">
            <Card className="p-6 bg-white border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-4">Users by Location</h3>
              <div className="space-y-3">
                {Array.from(new Set(users.map((u) => u.currentLocation))).map((location) => {
                  const usersInLocation = users.filter((u) => u.currentLocation === location);
                  return (
                    <div key={location} className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-orange-500" />
                          {location}
                        </h4>
                        <Badge className="bg-blue-100 text-blue-800">
                          {usersInLocation.length} users
                        </Badge>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {usersInLocation.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200"
                          >
                            <span className="text-lg">{user.avatar}</span>
                            <span className="text-sm font-medium text-slate-900">
                              {user.name}
                            </span>
                            <div
                              className={`w-2 h-2 ${getStatusColor(user.status)} rounded-full`}
                            ></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* User Details Panel */}
        {selectedUser && (
          <Card className="mt-8 p-6 bg-white border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">User Details</h3>
            {users
              .filter((u) => u.id === selectedUser)
              .map((user) => (
                <div key={user.id} className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-5xl">{user.avatar}</span>
                    <div>
                      <h4 className="text-2xl font-bold text-slate-900">{user.name}</h4>
                      <Badge className={
                        user.status === 'online' ? 'bg-green-100 text-green-800' :
                        user.status === 'away' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Location</p>
                      <p className="font-semibold text-slate-900">{user.currentLocation}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Activity</p>
                      <p className="font-semibold text-slate-900">{user.activity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Last Seen</p>
                      <p className="font-semibold text-slate-900">{formatLastSeen(user.lastSeen)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Status</p>
                      <p className="font-semibold text-slate-900">
                        {user.isTyping ? '✏️ Typing' : 'Idle'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4 border-t border-slate-200">
                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Eye className="w-4 h-4 mr-2" />
                      View Profile
                    </Button>
                  </div>
                </div>
              ))}
          </Card>
        )}
      </div>
    </div>
  );
}
