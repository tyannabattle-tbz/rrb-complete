import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Mic, Trash2, Play, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { voiceTrainingService, VoiceCommand } from '@/services/voiceCommandTrainingService';

export function VoiceCommandTrainer() {
  const [commands, setCommands] = useState<VoiceCommand[]>(voiceTrainingService.getCustomCommands());
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [newTrigger, setNewTrigger] = useState('');
  const [newAction, setNewAction] = useState('');

  const handleTrainCommand = async () => {
    if (!newTrigger.trim() || !newAction.trim()) {
      toast.error('Please enter both trigger phrase and action');
      return;
    }

    setIsTraining(true);
    try {
      const command = await voiceTrainingService.trainCommand(newTrigger, newAction, 3);
      setCommands([...commands, command]);
      setNewTrigger('');
      setNewAction('');
      toast.success(`Command "${newTrigger}" trained successfully!`);
    } catch (error) {
      console.error('Training failed:', error);
      toast.error('Failed to train command');
    } finally {
      setIsTraining(false);
    }
  };

  const handleDeleteCommand = (commandId: string) => {
    voiceTrainingService.deleteCommand(commandId);
    setCommands(commands.filter((cmd) => cmd.id !== commandId));
    toast.success('Command deleted');
  };

  const handleExecuteCommand = async (command: VoiceCommand) => {
    try {
      await voiceTrainingService.executeCommand(command);
      toast.success(`Executed: ${command.trigger}`);
    } catch (error) {
      toast.error('Failed to execute command');
    }
  };

  return (
    <div className="space-y-6">
      {/* Training Section */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Mic size={18} className="text-purple-400" />
            Train Custom Voice Command
          </CardTitle>
          <CardDescription className="text-slate-400">
            Record 3 samples of your voice command for better accuracy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">
              Trigger Phrase
            </label>
            <Input
              placeholder="e.g., 'launch broadcast'"
              value={newTrigger}
              onChange={(e) => setNewTrigger(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              disabled={isTraining}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">
              Action
            </label>
            <Input
              placeholder="e.g., 'start_broadcast'"
              value={newAction}
              onChange={(e) => setNewAction(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              disabled={isTraining}
            />
          </div>

          {isTraining && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin text-purple-400" size={16} />
                <span className="text-sm text-slate-300">Training in progress...</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${trainingProgress}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 text-right">{trainingProgress}%</p>
            </div>
          )}

          <Button
            onClick={handleTrainCommand}
            disabled={isTraining}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Mic size={16} className="mr-2" />
            {isTraining ? 'Training...' : 'Start Training'}
          </Button>
        </CardContent>
      </Card>

      {/* Commands List */}
      {commands.length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Your Custom Commands ({commands.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {commands.map((command) => (
                <div
                  key={command.id}
                  className="flex items-center justify-between p-3 bg-slate-700 rounded-lg border border-slate-600"
                >
                  <div className="flex-1">
                    <p className="font-medium text-white">{command.trigger}</p>
                    <p className="text-xs text-slate-400">
                      Action: {command.action} • Confidence: {(command.confidence * 100).toFixed(0)}%
                    </p>
                    {command.lastUsed && (
                      <p className="text-xs text-slate-500">
                        Last used: {new Date(command.lastUsed).toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleExecuteCommand(command)}
                      size="sm"
                      variant="outline"
                      className="border-slate-600"
                    >
                      <Play size={14} />
                    </Button>
                    <Button
                      onClick={() => handleDeleteCommand(command.id)}
                      size="sm"
                      variant="destructive"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
