import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Menu, X, Bell, Settings, Users, Activity, BarChart3, Shield } from 'lucide-react';

export default function MobileResponsiveAdminPanel() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'policies', label: 'Policies', icon: Shield },
    { id: 'services', label: 'Services', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const stats = [
    { label: 'Active Decisions', value: '12,847', change: '+12%' },
    { label: 'Policy Effectiveness', value: '93.1%', change: '+2.3%' },
    { label: 'Service Uptime', value: '99.7%', change: 'Stable' },
    { label: 'Human Overrides', value: '247', change: '-5%' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between md:hidden">
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">QUMUS Admin</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed md:relative w-64 h-screen bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-300 ease-in-out z-40 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <div className="p-6 hidden md:block">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">QUMUS</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Admin Panel</p>
          </div>

          <nav className="space-y-2 p-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-500 text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="hidden md:block mb-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {menuItems.find((m) => m.id === activeTab)?.label}
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Monitor and manage QUMUS autonomous operations
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat, idx) => (
                <Card key={idx} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{stat.label}</p>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">{stat.change}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Content Sections */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-4 md:p-6">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">System Status</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 dark:text-slate-300">Autonomous Engine</span>
                      <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 dark:text-slate-300">Policy Engine</span>
                      <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 dark:text-slate-300">Service Integrations</span>
                      <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                    </div>
                  </div>
                </Card>

                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-4 md:p-6">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent Activity</h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">Policy Decision Made</p>
                        <p className="text-slate-500 dark:text-slate-400">Content Policy - Video Approved</p>
                      </div>
                      <span className="text-slate-500 dark:text-slate-400">2 min ago</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">Service Alert</p>
                        <p className="text-slate-500 dark:text-slate-400">Email Service - Latency High</p>
                      </div>
                      <span className="text-slate-500 dark:text-slate-400">5 min ago</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">Override Request</p>
                        <p className="text-slate-500 dark:text-slate-400">Payment Policy - Pending Approval</p>
                      </div>
                      <span className="text-slate-500 dark:text-slate-400">12 min ago</span>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'policies' && (
              <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-4 md:p-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Decision Policies</h2>
                <div className="space-y-3">
                  {['Content', 'User', 'Payment', 'Security', 'Compliance', 'Performance', 'Engagement', 'System'].map((policy) => (
                    <div key={policy} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <span className="font-medium text-slate-900 dark:text-white">{policy} Policy</span>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {activeTab === 'services' && (
              <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-4 md:p-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Integrated Services</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {['Stripe', 'Slack', 'Email', 'Analytics', 'Webhooks', 'Auth', 'Recommendations', 'WebSocket', 'Compliance', 'Notifications', 'LLM'].map((service) => (
                    <div key={service} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg flex items-center justify-between">
                      <span className="font-medium text-slate-900 dark:text-white">{service}</span>
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {activeTab !== 'overview' && activeTab !== 'policies' && activeTab !== 'services' && (
              <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-4 md:p-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                  {menuItems.find((m) => m.id === activeTab)?.label}
                </h2>
                <p className="text-slate-600 dark:text-slate-400">Content for this section coming soon...</p>
              </Card>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}
