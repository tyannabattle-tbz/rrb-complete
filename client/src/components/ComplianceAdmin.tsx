import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, DollarSign, Shield, Users, Download, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ComplianceDocument {
  id: string;
  title: string;
  type: 'fcc' | 'privacy' | 'terms' | 'other';
  status: 'draft' | 'approved' | 'expired';
  lastUpdated: number;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  status: 'pending' | 'completed' | 'failed';
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'operator' | 'accountant' | 'legal';
  status: 'active' | 'inactive';
}

export function ComplianceAdmin() {
  const [documents, setDocuments] = useState<ComplianceDocument[]>([
    { id: '1', title: 'FCC Broadcast License', type: 'fcc', status: 'approved', lastUpdated: Date.now() - 2592000000 },
    { id: '2', title: 'Privacy Policy', type: 'privacy', status: 'approved', lastUpdated: Date.now() - 864000000 },
    { id: '3', title: 'Terms of Service', type: 'terms', status: 'approved', lastUpdated: Date.now() - 1728000000 },
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', date: '2026-02-07', description: 'Broadcast Equipment', amount: 5000, category: 'equipment', status: 'completed' },
    { id: '2', date: '2026-02-06', description: 'Software License', amount: 1200, category: 'software', status: 'completed' },
    { id: '3', date: '2026-02-05', description: 'Maintenance Service', amount: 800, category: 'maintenance', status: 'pending' },
  ]);

  const [users, setUsers] = useState<AdminUser[]>([
    { id: '1', name: 'John Admin', email: 'john@example.com', role: 'admin', status: 'active' },
    { id: '2', name: 'Jane Operator', email: 'jane@example.com', role: 'operator', status: 'active' },
    { id: '3', name: 'Bob Accountant', email: 'bob@example.com', role: 'accountant', status: 'active' },
  ]);

  const [showNewDoc, setShowNewDoc] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocType, setNewDocType] = useState<'fcc' | 'privacy' | 'terms' | 'other'>('other');

  const addDocument = () => {
    if (!newDocTitle.trim()) {
      toast.error('Please enter document title');
      return;
    }

    const newDoc: ComplianceDocument = {
      id: `doc-${Date.now()}`,
      title: newDocTitle,
      type: newDocType,
      status: 'draft',
      lastUpdated: Date.now(),
    };

    setDocuments([newDoc, ...documents]);
    setNewDocTitle('');
    setShowNewDoc(false);
    toast.success('Document created');
  };

  const approveDocument = (id: string) => {
    setDocuments(documents.map(d => 
      d.id === id ? { ...d, status: 'approved' as const } : d
    ));
    toast.success('Document approved');
  };

  const totalRevenue = transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0);
  const pendingAmount = transactions.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6 p-6">
      <Tabs defaultValue="compliance" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800 border border-slate-700">
          <TabsTrigger value="compliance" className="gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Compliance</span>
          </TabsTrigger>
          <TabsTrigger value="accounting" className="gap-2">
            <DollarSign className="w-4 h-4" />
            <span className="hidden sm:inline">Accounting</span>
          </TabsTrigger>
          <TabsTrigger value="admin" className="gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Admin</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Reports</span>
          </TabsTrigger>
        </TabsList>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Compliance Documents</h3>
              <Button
                onClick={() => setShowNewDoc(!showNewDoc)}
                className="bg-blue-600 hover:bg-blue-700 gap-2"
              >
                <Plus className="w-4 h-4" />
                New Document
              </Button>
            </div>

            {showNewDoc && (
              <div className="bg-slate-700 rounded p-4 mb-4 space-y-3">
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Title</label>
                  <Input
                    placeholder="Document title..."
                    value={newDocTitle}
                    onChange={e => setNewDocTitle(e.target.value)}
                    className="bg-slate-600 border-slate-500 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Type</label>
                  <select
                    value={newDocType}
                    onChange={e => setNewDocType(e.target.value as any)}
                    className="w-full bg-slate-600 border border-slate-500 text-white rounded px-3 py-2"
                  >
                    <option value="fcc">FCC Compliance</option>
                    <option value="privacy">Privacy Policy</option>
                    <option value="terms">Terms of Service</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={addDocument} className="flex-1 bg-green-600 hover:bg-green-700">
                    Create
                  </Button>
                  <Button onClick={() => setShowNewDoc(false)} variant="outline" className="flex-1 border-slate-600">
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {documents.map(doc => (
                <div key={doc.id} className="bg-slate-700 rounded p-4 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-blue-400" />
                      <h4 className="font-bold text-white">{doc.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded ${
                        doc.status === 'approved' ? 'bg-green-600/20 text-green-300' :
                        doc.status === 'draft' ? 'bg-yellow-600/20 text-yellow-300' :
                        'bg-red-600/20 text-red-300'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">
                      Last updated: {new Date(doc.lastUpdated).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {doc.status === 'draft' && (
                      <Button
                        onClick={() => approveDocument(doc.id)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 gap-1"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Approve
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="border-slate-600 gap-1">
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Accounting Tab */}
        <TabsContent value="accounting" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-slate-800 border-slate-700 p-4">
              <p className="text-slate-400 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold text-green-400 mt-2">${totalRevenue.toLocaleString()}</p>
            </Card>
            <Card className="bg-slate-800 border-slate-700 p-4">
              <p className="text-slate-400 text-sm">Pending</p>
              <p className="text-3xl font-bold text-yellow-400 mt-2">${pendingAmount.toLocaleString()}</p>
            </Card>
            <Card className="bg-slate-800 border-slate-700 p-4">
              <p className="text-slate-400 text-sm">Transactions</p>
              <p className="text-3xl font-bold text-blue-400 mt-2">{transactions.length}</p>
            </Card>
          </div>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Transaction Ledger</h3>
            <div className="space-y-3">
              {transactions.map(tx => (
                <div key={tx.id} className="bg-slate-700 rounded p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold text-white">{tx.description}</h4>
                    <p className="text-sm text-slate-400">{tx.date} • {tx.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">${tx.amount.toLocaleString()}</p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      tx.status === 'completed' ? 'bg-green-600/20 text-green-300' :
                      tx.status === 'pending' ? 'bg-yellow-600/20 text-yellow-300' :
                      'bg-red-600/20 text-red-300'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Admin Tab */}
        <TabsContent value="admin" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Admin Users</h3>
            <div className="space-y-3">
              {users.map(user => (
                <div key={user.id} className="bg-slate-700 rounded p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold text-white">{user.name}</h4>
                    <p className="text-sm text-slate-400">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm bg-blue-600/20 text-blue-300 px-3 py-1 rounded">
                      {user.role}
                    </span>
                    <span className={`text-sm px-3 py-1 rounded ${
                      user.status === 'active' ? 'bg-green-600/20 text-green-300' : 'bg-red-600/20 text-red-300'
                    }`}>
                      {user.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Available Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button className="bg-blue-600 hover:bg-blue-700 h-24 flex flex-col items-center justify-center gap-2">
                <FileText className="w-6 h-6" />
                <span>Compliance Report</span>
              </Button>
              <Button className="bg-green-600 hover:bg-green-700 h-24 flex flex-col items-center justify-center gap-2">
                <DollarSign className="w-6 h-6" />
                <span>Financial Report</span>
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700 h-24 flex flex-col items-center justify-center gap-2">
                <Users className="w-6 h-6" />
                <span>User Activity Report</span>
              </Button>
              <Button className="bg-orange-600 hover:bg-orange-700 h-24 flex flex-col items-center justify-center gap-2">
                <FileText className="w-6 h-6" />
                <span>Broadcast Report</span>
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
