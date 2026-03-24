import React, { useState } from 'react';
import { Smartphone, Users, Mic, MessageCircle, Calendar, Settings, LogOut, Bell, MapPin, Signal } from 'lucide-react';

interface BandMember {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'offline' | 'in-performance';
  location?: string;
  signalStrength?: number;
  avatar?: string;
}

interface PerformanceInvite {
  id: string;
  performanceName: string;
  time: string;
  role: string;
  status: 'pending' | 'accepted' | 'declined';
}

export const BandMemberMobileApp: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'home' | 'chat' | 'schedule' | 'settings'>('home');
  const [bandMembers, setBandMembers] = useState<BandMember[]>([
    {
      id: '1',
      name: 'Chris Battle Sr',
      role: 'Lead Vocals',
      status: 'online',
      location: 'Studio A',
      signalStrength: 95,
    },
    {
      id: '2',
      name: 'C.J. Battle',
      role: 'Guitar',
      status: 'online',
      location: 'Studio B',
      signalStrength: 88,
    },
    {
      id: '3',
      name: 'Kairen Battle',
      role: 'Bass',
      status: 'in-performance',
      location: 'Live Stream',
      signalStrength: 92,
    },
  ]);

  const [invites, setInvites] = useState<PerformanceInvite[]>([
    {
      id: '1',
      performanceName: 'Soul & R&B Night',
      time: 'Today 8:00 PM',
      role: 'Backup Vocals',
      status: 'pending',
    },
    {
      id: '2',
      performanceName: 'Jazz Fusion Session',
      time: 'Tomorrow 7:00 PM',
      role: 'Support',
      status: 'pending',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'offline':
        return 'bg-gray-500';
      case 'in-performance':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'offline':
        return 'Offline';
      case 'in-performance':
        return 'In Performance';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl border-8 border-slate-700 shadow-2xl overflow-hidden">
      {/* Phone Notch */}
      <div className="h-6 bg-black rounded-b-3xl mx-auto w-40"></div>

      {/* Status Bar */}
      <div className="bg-slate-900 px-6 py-2 flex justify-between items-center text-white text-xs">
        <span>9:41</span>
        <div className="flex gap-1">
          <Signal className="w-3 h-3" />
          <span>📶</span>
          <span>🔋</span>
        </div>
      </div>

      {/* App Content */}
      <div className="bg-gradient-to-br from-slate-800 via-purple-900 to-slate-800 min-h-screen flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-white" />
              <h1 className="text-lg font-bold text-white">RRB Band App</h1>
            </div>
            <Bell className="w-5 h-5 text-white cursor-pointer" />
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {currentTab === 'home' && (
            <>
              {/* Band Members Online */}
              <div className="bg-slate-700/50 rounded-lg p-4 border border-purple-500/30">
                <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  Band Members Online
                </h2>
                <div className="space-y-2">
                  {bandMembers.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-2 bg-slate-600/30 rounded">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(member.status)}`}></div>
                        <div>
                          <div className="text-white text-sm font-semibold">{member.name}</div>
                          <div className="text-purple-300 text-xs">{member.role}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white text-xs">{getStatusText(member.status)}</div>
                        {member.signalStrength && (
                          <div className="text-purple-300 text-xs">{member.signalStrength}%</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Invites */}
              <div className="bg-slate-700/50 rounded-lg p-4 border border-pink-500/30">
                <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-pink-400" />
                  Performance Invites ({invites.filter(i => i.status === 'pending').length})
                </h2>
                <div className="space-y-2">
                  {invites.map(invite => (
                    <div key={invite.id} className="p-3 bg-slate-600/30 rounded border border-pink-500/20">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-white font-semibold text-sm">{invite.performanceName}</div>
                          <div className="text-purple-300 text-xs">{invite.time}</div>
                          <div className="text-pink-300 text-xs">Role: {invite.role}</div>
                        </div>
                        <div className={`text-xs px-2 py-1 rounded ${
                          invite.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                          invite.status === 'accepted' ? 'bg-green-500/20 text-green-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {invite.status.charAt(0).toUpperCase() + invite.status.slice(1)}
                        </div>
                      </div>
                      {invite.status === 'pending' && (
                        <div className="flex gap-2">
                          <button className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs py-1 rounded">
                            Accept
                          </button>
                          <button className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs py-1 rounded">
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold">
                  <Mic className="w-4 h-4" />
                  Join Live
                </button>
                <button className="bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold">
                  <MessageCircle className="w-4 h-4" />
                  Chat
                </button>
              </div>
            </>
          )}

          {currentTab === 'chat' && (
            <div className="space-y-3">
              <div className="bg-slate-700/50 rounded-lg p-4 border border-purple-500/30">
                <h2 className="text-white font-semibold mb-3">Band Chat</h2>
                <div className="space-y-2 h-64 overflow-y-auto mb-3">
                  <div className="text-purple-300 text-xs">Chris: Ready for tonight?</div>
                  <div className="text-pink-300 text-xs">C.J.: All set! New arrangements sound great</div>
                  <div className="text-cyan-300 text-xs">Kairen: Let's make it legendary 🔥</div>
                </div>
                <input
                  type="text"
                  placeholder="Type message..."
                  className="w-full bg-slate-600 text-white text-sm px-3 py-2 rounded border border-purple-500/30 focus:border-purple-500"
                />
              </div>
            </div>
          )}

          {currentTab === 'schedule' && (
            <div className="space-y-3">
              <div className="bg-slate-700/50 rounded-lg p-4 border border-cyan-500/30">
                <h2 className="text-white font-semibold mb-3">Your Schedule</h2>
                <div className="space-y-2">
                  <div className="p-2 bg-slate-600/30 rounded text-white text-sm">
                    <div className="font-semibold">Soul & R&B Night</div>
                    <div className="text-purple-300 text-xs">Today 8:00 PM</div>
                  </div>
                  <div className="p-2 bg-slate-600/30 rounded text-white text-sm">
                    <div className="font-semibold">Jazz Fusion Session</div>
                    <div className="text-purple-300 text-xs">Tomorrow 7:00 PM</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentTab === 'settings' && (
            <div className="space-y-3">
              <div className="bg-slate-700/50 rounded-lg p-4 border border-amber-500/30">
                <h2 className="text-white font-semibold mb-3">Settings</h2>
                <div className="space-y-2">
                  <button className="w-full text-left p-2 hover:bg-slate-600/30 rounded text-white text-sm">
                    Notifications
                  </button>
                  <button className="w-full text-left p-2 hover:bg-slate-600/30 rounded text-white text-sm">
                    Audio Settings
                  </button>
                  <button className="w-full text-left p-2 hover:bg-slate-600/30 rounded text-white text-sm">
                    Profile
                  </button>
                  <button className="w-full text-left p-2 hover:bg-slate-600/30 rounded text-red-400 text-sm flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="bg-slate-900 border-t border-purple-500/30 px-4 py-3 flex justify-around">
          <button
            onClick={() => setCurrentTab('home')}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded ${
              currentTab === 'home' ? 'text-purple-400' : 'text-slate-400'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </button>
          <button
            onClick={() => setCurrentTab('chat')}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded ${
              currentTab === 'chat' ? 'text-purple-400' : 'text-slate-400'
            }`}
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs">Chat</span>
          </button>
          <button
            onClick={() => setCurrentTab('schedule')}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded ${
              currentTab === 'schedule' ? 'text-purple-400' : 'text-slate-400'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-xs">Schedule</span>
          </button>
          <button
            onClick={() => setCurrentTab('settings')}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded ${
              currentTab === 'settings' ? 'text-purple-400' : 'text-slate-400'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-xs">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
