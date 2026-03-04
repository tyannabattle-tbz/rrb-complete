import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Send,
  Radio,
  AlertTriangle,
  Terminal,
  CheckCircle,
  Clock,
  AlertCircle,
  Zap
} from 'lucide-react';

interface Command {
  id: string;
  system: 'RRB' | 'HybridCast';
  command: string;
  parameters: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  result: string;
  executedAt: string;
  executionTime: string;
}

export default function CommandCenterPage() {
  const [commands, setCommands] = useState<Command[]>([
    {
      id: '1',
      system: 'RRB',
      command: 'StartBroadcast',
      parameters: 'channel=healing-frequencies, duration=24h',
      status: 'completed',
      result: 'Broadcast started successfully on all channels',
      executedAt: '2026-03-04 13:00:00',
      executionTime: '0.45s',
    },
    {
      id: '2',
      system: 'HybridCast',
      command: 'SendEmergencyAlert',
      parameters: 'region=all, severity=high, message=Test Alert',
      status: 'completed',
      result: 'Alert sent to 15,234 subscribers',
      executedAt: '2026-03-04 12:30:00',
      executionTime: '1.23s',
    },
    {
      id: '3',
      system: 'RRB',
      command: 'UpdatePlaylist',
      parameters: 'station=main, action=add, count=5',
      status: 'executing',
      result: 'Processing playlist update...',
      executedAt: '2026-03-04 13:45:00',
      executionTime: '0.12s',
    },
  ]);

  const [selectedSystem, setSelectedSystem] = useState<'RRB' | 'HybridCast'>('RRB');
  const [commandInput, setCommandInput] = useState('');
  const [parametersInput, setParametersInput] = useState('');

  const rrbCommands = [
    { name: 'StartBroadcast', description: 'Start broadcasting on selected channels' },
    { name: 'StopBroadcast', description: 'Stop broadcasting' },
    { name: 'UpdatePlaylist', description: 'Update station playlist' },
    { name: 'ChangeFrequency', description: 'Change healing frequency' },
    { name: 'AdjustVolume', description: 'Adjust broadcast volume' },
    { name: 'GetListenerStats', description: 'Get current listener statistics' },
  ];

  const hybridcastCommands = [
    { name: 'SendEmergencyAlert', description: 'Send emergency alert to subscribers' },
    { name: 'StartBroadcast', description: 'Start emergency broadcast' },
    { name: 'StopBroadcast', description: 'Stop emergency broadcast' },
    { name: 'UpdateAlertLevel', description: 'Update alert severity level' },
    { name: 'GetAlertStatus', description: 'Get current alert status' },
    { name: 'NotifyOperators', description: 'Notify all operators' },
  ];

  const availableCommands = selectedSystem === 'RRB' ? rrbCommands : hybridcastCommands;

  const handleExecuteCommand = () => {
    if (commandInput.trim()) {
      const newCommand: Command = {
        id: Date.now().toString(),
        system: selectedSystem,
        command: commandInput,
        parameters: parametersInput,
        status: 'executing',
        result: 'Executing command...',
        executedAt: new Date().toLocaleString(),
        executionTime: '0.00s',
      };
      setCommands([newCommand, ...commands]);
      setCommandInput('');
      setParametersInput('');

      // Simulate command completion
      setTimeout(() => {
        setCommands(prev => prev.map(cmd => 
          cmd.id === newCommand.id 
            ? { 
                ...cmd, 
                status: 'completed' as const,
                result: `${selectedSystem} command executed successfully`,
                executionTime: '0.85s'
              }
            : cmd
        ));
      }, 2000);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'executing':
        return <Zap className="w-5 h-5 text-blue-400 animate-pulse" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Terminal className="w-8 h-8 text-purple-400" />
          <h1 className="text-4xl font-bold text-white">Command Center</h1>
        </div>
        <p className="text-purple-300">Execute commands on RRB Radio and HybridCast systems</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Command Input */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-800/50 border-purple-500/20 mb-6">
            <CardHeader>
              <CardTitle>Execute Command</CardTitle>
              <CardDescription>Send commands to RRB or HybridCast</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* System Selection */}
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Target System</label>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setSelectedSystem('RRB')}
                    className={`flex-1 ${
                      selectedSystem === 'RRB'
                        ? 'bg-gradient-to-r from-pink-600 to-orange-600'
                        : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  >
                    <Radio className="w-4 h-4 mr-2" />
                    RRB Radio
                  </Button>
                  <Button
                    onClick={() => setSelectedSystem('HybridCast')}
                    className={`flex-1 ${
                      selectedSystem === 'HybridCast'
                        ? 'bg-gradient-to-r from-red-600 to-yellow-600'
                        : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    HybridCast
                  </Button>
                </div>
              </div>

              {/* Command Selection */}
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Command</label>
                <select
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2"
                >
                  <option value="">Select a command...</option>
                  {availableCommands.map(cmd => (
                    <option key={cmd.name} value={cmd.name}>
                      {cmd.name} - {cmd.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Parameters */}
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Parameters</label>
                <Textarea
                  value={parametersInput}
                  onChange={(e) => setParametersInput(e.target.value)}
                  placeholder="key1=value1, key2=value2"
                  className="bg-slate-700 border-slate-600 text-white"
                  rows={3}
                />
              </div>

              <Button
                onClick={handleExecuteCommand}
                disabled={!commandInput.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
              >
                <Send className="w-4 h-4 mr-2" />
                Execute Command
              </Button>
            </CardContent>
          </Card>

          {/* Command History */}
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle>Command History</CardTitle>
              <CardDescription>Recent commands and execution results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {commands.map(cmd => (
                <div
                  key={cmd.id}
                  className="p-4 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-purple-500/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(cmd.status)}
                      <div>
                        <h4 className="font-semibold text-white">{cmd.command}</h4>
                        <p className="text-xs text-slate-400">{cmd.system}</p>
                      </div>
                    </div>
                    <Badge
                      className={`${
                        cmd.status === 'completed'
                          ? 'bg-green-500/20 text-green-400'
                          : cmd.status === 'executing'
                          ? 'bg-blue-500/20 text-blue-400'
                          : cmd.status === 'failed'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {cmd.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-400 mb-2">{cmd.result}</p>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{cmd.executedAt}</span>
                    <span>{cmd.executionTime}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Available Commands */}
        <div>
          <Card className="bg-slate-800/50 border-purple-500/20 sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">Available Commands</CardTitle>
              <CardDescription>{selectedSystem} System</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {availableCommands.map(cmd => (
                <div
                  key={cmd.name}
                  onClick={() => setCommandInput(cmd.name)}
                  className="p-3 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-purple-500/50 cursor-pointer transition-all"
                >
                  <p className="font-semibold text-white text-sm">{cmd.name}</p>
                  <p className="text-xs text-slate-400">{cmd.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
