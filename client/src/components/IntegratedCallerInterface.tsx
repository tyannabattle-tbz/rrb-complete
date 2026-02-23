import React, { useState, useEffect } from 'react';
import { Phone, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguageDetection, useTranslation } from '@/hooks/useLanguageDetection';
import { trpc } from '@/lib/trpc';

export function IntegratedCallerInterface() {
  const { selectedLanguage, changeLanguage, availableLanguages, getLanguageFlag } = useLanguageDetection();
  const { t } = useTranslation(selectedLanguage);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp' | 'queue' | 'frequency'>('phone');
  const [selectedFrequency, setSelectedFrequency] = useState(432);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [estimatedWait, setEstimatedWait] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // tRPC mutations
  const sendOTPMutation = trpc.sms.sendOTP.useMutation();
  const verifyOTPMutation = trpc.sms.verifyOTP.useMutation();

  const frequencies = [432, 528, 639, 741, 852];

  const handleSendOTP = async () => {
    setError(null);
    if (!phoneNumber.match(/^\+?[1-9]\d{1,14}$/)) {
      setError('Invalid phone number format');
      return;
    }

    try {
      const result = await sendOTPMutation.mutateAsync({
        phoneNumber,
      });

      if (result.success) {
        setSessionId(result.sessionId);
        setStep('otp');
      }
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    }
  };

  const handleVerifyOTP = async () => {
    setError(null);
    if (!otp || otp.length !== 6) {
      setError('Invalid OTP format');
      return;
    }

    try {
      const result = await verifyOTPMutation.mutateAsync({
        sessionId,
        otp,
      });

      if (result.verified) {
        setStep('frequency');
      } else {
        setError(result.error || 'Verification failed');
      }
    } catch (err) {
      setError('Verification error. Please try again.');
    }
  };

  const handleSelectFrequency = () => {
    // Simulate queue position
    setQueuePosition(Math.floor(Math.random() * 5) + 1);
    setEstimatedWait(Math.floor(Math.random() * 15) + 2);
    setStep('queue');
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-lg shadow-2xl overflow-hidden">
      {/* Header with Language Selector */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 border-b border-blue-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Phone className="w-8 h-8" />
            <h1 className="text-2xl font-bold">RRB Call-In</h1>
          </div>
          <div className="flex gap-2">
            {availableLanguages.map(lang => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`px-3 py-2 rounded font-semibold transition-colors text-lg ${
                  selectedLanguage === lang.code
                    ? 'bg-white text-blue-600'
                    : 'bg-blue-500/30 text-white hover:bg-blue-500/50'
                }`}
                title={lang.nativeName}
              >
                {getLanguageFlag(lang.code)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        {error && (
          <div className="mb-4 p-4 bg-red-900/30 border border-red-700 rounded text-red-300 text-sm">
            {error}
          </div>
        )}

        {step === 'phone' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4">{t('Enter Phone Number')}</h2>
              <div className="space-y-3">
                <input
                  type="tel"
                  placeholder="+1-800-RRB-LIVE"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
                <Button
                  onClick={handleSendOTP}
                  disabled={sendOTPMutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3"
                >
                  {sendOTPMutation.isPending ? 'Sending...' : t('Send OTP')}
                </Button>
              </div>
            </div>

            <div className="p-4 bg-blue-900/30 border border-blue-700 rounded">
              <p className="text-sm text-gray-300">
                📱 {t('Send OTP')} - We'll send a verification code to your phone
              </p>
            </div>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4">{t('Enter Verification Code')}</h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-center text-2xl tracking-widest"
                />
                <Button
                  onClick={handleVerifyOTP}
                  disabled={verifyOTPMutation.isPending}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3"
                >
                  {verifyOTPMutation.isPending ? 'Verifying...' : t('Verify')}
                </Button>
              </div>
            </div>

            <div className="p-4 bg-green-900/30 border border-green-700 rounded">
              <p className="text-sm text-gray-300">
                ✓ {t('Enter Verification Code')} - Check your SMS for the 6-digit code
              </p>
            </div>
          </div>
        )}

        {step === 'frequency' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4">{t('Select Frequency')}</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                {frequencies.map(freq => (
                  <button
                    key={freq}
                    onClick={() => setSelectedFrequency(freq)}
                    className={`p-4 rounded font-bold transition-colors ${
                      selectedFrequency === freq
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    }`}
                  >
                    {freq} {t('Hz')}
                  </button>
                ))}
              </div>
              <Button
                onClick={handleSelectFrequency}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3"
              >
                Continue to Queue
              </Button>
            </div>

            <div className="p-4 bg-purple-900/30 border border-purple-700 rounded">
              <p className="text-sm text-gray-300">
                🎵 {t('Select Frequency')} - Choose your preferred Solfeggio frequency
              </p>
            </div>
          </div>
        )}

        {step === 'queue' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-700 rounded text-center">
                <p className="text-sm text-gray-400">{t('Queue Position')}</p>
                <p className="text-3xl font-bold text-blue-400">#{queuePosition}</p>
              </div>
              <div className="p-4 bg-slate-700 rounded text-center">
                <p className="text-sm text-gray-400">{t('Estimated Wait')}</p>
                <p className="text-3xl font-bold text-green-400">{estimatedWait}m</p>
              </div>
            </div>

            <div className="p-4 bg-slate-700 rounded">
              <p className="text-sm text-gray-300 mb-3">
                📞 {t('You\'re in the queue')}
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-sm">{t('Phone verified')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{selectedFrequency} Hz selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm">{t('Waiting for operator')}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button className="bg-red-600 hover:bg-red-700 text-white font-bold py-3">
                🆘 {t('SOS')}
              </Button>
              <Button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3">
                ✓ {t('I\'m OK')}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-slate-800/50 p-4 border-t border-slate-700 text-xs text-gray-500 text-center">
        <p>🎙️ Rockin' Rockin' Boogie | +1-800-RRB-LIVE | {selectedLanguage.toUpperCase()}</p>
      </div>
    </div>
  );
}
