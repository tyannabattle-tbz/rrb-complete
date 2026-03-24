import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, User, Lock, Zap, Radio } from 'lucide-react';
import { toast } from 'sonner';

interface LoginSession {
  userId: string;
  userName: string;
  role: 'admin' | 'producer' | 'engineer' | 'guest';
  loginTime: Date;
  systems: string[];
}

export function UnifiedLoginDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<LoginSession | null>(null);
  const [selectedUser, setSelectedUser] = useState('');
  const [password, setPassword] = useState('');

  const authorizedUsers = [
    { id: '1', name: 'Chris Battle Sr', role: 'admin' as const, systems: ['RRB Studio', 'QUMUS', 'HybridCast', 'Ty OS'] },
    { id: '2', name: 'C.J. Battle', role: 'admin' as const, systems: ['RRB Studio', 'QUMUS', 'HybridCast', 'Ty OS'] },
    { id: '3', name: 'Kairen Battle', role: 'admin' as const, systems: ['RRB Studio', 'QUMUS', 'HybridCast', 'Ty OS'] },
    { id: '4', name: 'AP/Amandes Studio', role: 'admin' as const, systems: ['RRB Studio', 'QUMUS', 'HybridCast'] },
  ];

  const handleLogin = () => {
    if (!selectedUser || !password) {
      toast.error('Please select user and enter password');
      return;
    }

    const user = authorizedUsers.find((u) => u.id === selectedUser);
    if (user) {
      const session: LoginSession = {
        userId: user.id,
        userName: user.name,
        role: user.role,
        loginTime: new Date(),
        systems: user.systems,
      };
      setCurrentUser(session);
      setIsLoggedIn(true);
      setPassword('');
      toast.success(`Welcome back, ${user.name}!`);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setSelectedUser('');
    toast.success('Logged out successfully');
  };

  const accessSystem = (system: string) => {
    if (currentUser) {
      toast.success(`Opening ${system} with ${currentUser.role} permissions...`);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-purple-400 to-pink-400">
              FAMILY STUDIO LOGIN
            </CardTitle>
            <p className="text-slate-400 text-sm mt-2">RRB Studio + QUMUS Unified Access</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-slate-300 block mb-2">Select Family Member</label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded px-4 py-2 text-slate-300"
              >
                <option value="">Choose a user...</option>
                {authorizedUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-300 block mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full bg-slate-900 border border-slate-600 rounded px-4 py-2 text-slate-300"
                placeholder="Enter password"
              />
            </div>

            <Button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-yellow-500 to-purple-500 hover:from-yellow-600 hover:to-purple-600 text-white font-bold"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>

            <div className="bg-slate-900 rounded p-3 border border-slate-700 text-xs text-slate-400">
              <div className="font-semibold text-slate-300 mb-2">Authorized Users:</div>
              {authorizedUsers.map((user) => (
                <div key={user.id}>✓ {user.name}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-purple-400 to-pink-400">
              FAMILY STUDIO DASHBOARD
            </h1>
            <p className="text-slate-400 mt-2">
              Welcome, <span className="text-white font-bold">{currentUser?.userName}</span> ({currentUser?.role})
            </p>
          </div>
          <Button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-yellow-400">{currentUser?.systems.length}</div>
              <div className="text-xs text-slate-400">Systems Accessible</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-400">✓</div>
              <div className="text-xs text-slate-400">Authenticated</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-purple-400">{currentUser?.role.toUpperCase()}</div>
              <div className="text-xs text-slate-400">Access Level</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-sm text-blue-400 font-semibold">
                {currentUser?.loginTime.toLocaleTimeString()}
              </div>
              <div className="text-xs text-slate-400">Login Time</div>
            </CardContent>
          </Card>
        </div>

        {/* Available Systems */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Available Systems</h2>
          <div className="grid grid-cols-2 gap-4">
            {currentUser?.systems.map((system) => (
              <Card
                key={system}
                className="bg-slate-800 border-slate-700 hover:border-slate-500 cursor-pointer transition"
                onClick={() => accessSystem(system)}
              >
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    {system === 'RRB Studio' && <Radio className="w-5 h-5 text-red-400" />}
                    {system === 'QUMUS' && <Zap className="w-5 h-5 text-yellow-400" />}
                    {system === 'HybridCast' && <Radio className="w-5 h-5 text-blue-400" />}
                    {system === 'Ty OS' && <Lock className="w-5 h-5 text-purple-400" />}
                    {system}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-400 mb-4">
                    {system === 'RRB Studio' && 'Professional audio production and mixing'}
                    {system === 'QUMUS' && 'Autonomous orchestration and broadcasting'}
                    {system === 'HybridCast' && 'Emergency broadcast and communication'}
                    {system === 'Ty OS' && 'Master control interface and management'}
                  </p>
                  <Button
                    onClick={() => accessSystem(system)}
                    className="w-full bg-gradient-to-r from-yellow-500 to-purple-500 hover:from-yellow-600 hover:to-purple-600"
                  >
                    Open {system}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* User Permissions */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400" />
              Your Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-white mb-2">Studio Access</h3>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>✓ View all projects</div>
                  <div>✓ Edit projects</div>
                  <div>✓ Create new sessions</div>
                  <div>✓ Export recordings</div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-2">System Access</h3>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>✓ Multi-track mixing</div>
                  <div>✓ Live streaming</div>
                  <div>✓ Spectral analysis</div>
                  <div>✓ Collaborative sessions</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
