import React, { useState, useEffect } from 'react';
import { arGlassService } from '@/services/arGlassService';
import { voiceCommandService } from '@/services/voiceCommandService';
import { predictiveAnalyticsService } from '@/services/predictiveAnalyticsService';

export const ARGlassInterface: React.FC = () => {
  const [arActive, setARActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [arStatus, setARStatus] = useState(arGlassService.getARStatus());

  useEffect(() => {
    // Register voice commands
    voiceCommandService.registerCommand('start ar', () => {
      initializeAR();
    }, 'Start AR interface');

    voiceCommandService.registerCommand('show metrics', () => {
      displayMetricsInAR();
    }, 'Display metrics in AR');

    voiceCommandService.registerCommand('show predictions', () => {
      displayPredictionsInAR();
    }, 'Display predictions in AR');

    voiceCommandService.registerCommand('end ar', () => {
      endAR();
    }, 'End AR session');
  }, []);

  const initializeAR = async () => {
    const success = await arGlassService.initializeARSession();
    if (success) {
      setARActive(true);
      setARStatus(arGlassService.getARStatus());
      voiceCommandService.speak('AR interface activated. Ready for commands.');
    } else {
      voiceCommandService.speak('AR not available on this device.');
    }
  };

  const displayMetricsInAR = () => {
    const metrics = [
      arGlassService.createMetricDisplay('Active Tasks', 12, '#00ff00'),
      arGlassService.createMetricDisplay('Success Rate', '94%', '#00ff00'),
      arGlassService.createMetricDisplay('System Status', 'ACTIVE', '#00ff00')
    ];

    metrics.forEach((metric, idx) => {
      arGlassService.addVisualization(`metric-${idx}`, {
        type: 'metric',
        position: { x: 100 + idx * 150, y: 100, z: -1000 },
        scale: 1,
        data: metric
      });
    });

    voiceCommandService.speak('Metrics displayed in augmented reality');
  };

  const displayPredictionsInAR = () => {
    const prediction = predictiveAnalyticsService.predictTaskOutcome('Generate marketing content', 7);
    
    arGlassService.addVisualization('prediction', {
      type: 'metric',
      position: { x: 100, y: 300, z: -1000 },
      scale: 1,
      data: {
        label: 'Success Probability',
        value: `${(prediction.successProbability * 100).toFixed(0)}%`,
        color: prediction.successProbability > 0.8 ? '#00ff00' : '#ffff00',
        icon: '📊'
      }
    });

    voiceCommandService.speak(`Success probability: ${(prediction.successProbability * 100).toFixed(0)} percent`);
  };

  const startVoiceControl = () => {
    setIsListening(true);
    voiceCommandService.startListening((transcript) => {
      setTranscript(transcript);
    });
  };

  const stopVoiceControl = () => {
    setIsListening(false);
    voiceCommandService.stopListening();
  };

  const endAR = async () => {
    await arGlassService.endARSession();
    setARActive(false);
    setARStatus(arGlassService.getARStatus());
    voiceCommandService.speak('AR interface deactivated.');
  };

  return (
    <div className="ar-glass-interface">
      <style>{`
        .ar-glass-interface {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 999;
          font-family: 'Courier New', monospace;
        }

        .ar-control-panel {
          background: rgba(0, 20, 40, 0.95);
          border: 2px solid #00ff00;
          border-radius: 8px;
          padding: 15px;
          min-width: 300px;
          box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
        }

        .ar-header {
          color: #00ff00;
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .ar-status {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
          font-size: 12px;
          color: #00ff00;
        }

        .ar-status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: ${arActive ? '#00ff00' : '#ff0000'};
          animation: ${arActive ? 'pulse 1s infinite' : 'none'};
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .ar-button-group {
          display: flex;
          gap: 8px;
          margin-bottom: 10px;
          flex-wrap: wrap;
        }

        .ar-button {
          flex: 1;
          min-width: 80px;
          padding: 8px 12px;
          background: rgba(0, 255, 0, 0.1);
          border: 1px solid #00ff00;
          color: #00ff00;
          border-radius: 4px;
          cursor: pointer;
          font-size: 11px;
          font-weight: bold;
          text-transform: uppercase;
          transition: all 0.3s;
        }

        .ar-button:hover {
          background: rgba(0, 255, 0, 0.2);
          box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
        }

        .ar-button:active {
          transform: scale(0.95);
        }

        .ar-button.active {
          background: rgba(0, 255, 0, 0.3);
          box-shadow: inset 0 0 10px rgba(0, 255, 0, 0.5);
        }

        .ar-voice-display {
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid #00ff00;
          border-radius: 4px;
          padding: 8px;
          margin-bottom: 10px;
          min-height: 30px;
          font-size: 11px;
          color: #00ff00;
          word-wrap: break-word;
        }

        .ar-voice-display.listening {
          animation: listening-pulse 0.5s infinite;
        }

        @keyframes listening-pulse {
          0%, 100% { background: rgba(0, 0, 0, 0.5); }
          50% { background: rgba(0, 255, 0, 0.1); }
        }
      `}</style>

      <div className="ar-control-panel">
        <div className="ar-header">⬡ AR Glass Interface</div>
        
        <div className="ar-status">
          <div className="ar-status-indicator"></div>
          <span>{arActive ? 'AR ACTIVE' : 'AR INACTIVE'}</span>
        </div>

        <div className="ar-button-group">
          {!arActive ? (
            <button className="ar-button" onClick={initializeAR}>
              Start AR
            </button>
          ) : (
            <button className="ar-button active" onClick={endAR}>
              End AR
            </button>
          )}
          
          {arActive && (
            <>
              <button className="ar-button" onClick={displayMetricsInAR}>
                Metrics
              </button>
              <button className="ar-button" onClick={displayPredictionsInAR}>
                Predict
              </button>
            </>
          )}
        </div>

        <div className="ar-button-group">
          {!isListening ? (
            <button className="ar-button" onClick={startVoiceControl} style={{ flex: 1 }}>
              🎤 Voice Control
            </button>
          ) : (
            <button className="ar-button active" onClick={stopVoiceControl} style={{ flex: 1 }}>
              🎤 Listening...
            </button>
          )}
        </div>

        {isListening && (
          <div className={`ar-voice-display ${isListening ? 'listening' : ''}`}>
            {transcript || 'Listening for commands...'}
          </div>
        )}

        <div style={{ fontSize: '10px', color: '#00ff00', opacity: 0.6, marginTop: '8px' }}>
          Visualizations: {arStatus.visualizationCount}
        </div>
      </div>
    </div>
  );
};
