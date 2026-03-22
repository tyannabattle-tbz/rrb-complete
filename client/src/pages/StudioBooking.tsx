import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, Music, Mic, AlertCircle } from 'lucide-react';

interface Studio {
  id: string;
  name: string;
  type: string;
  capacity: number;
  hourlyRate: number;
  equipment: string[];
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

const studios: Studio[] = [
  {
    id: 'studio-001',
    name: 'RRB Main Studio',
    type: 'Podcast',
    capacity: 4,
    hourlyRate: 50,
    equipment: ['Microphone', 'Mixer', 'Headphones', 'Monitor speakers']
  },
  {
    id: 'studio-002',
    name: 'Legacy Restoration Studio',
    type: 'Audiobook',
    capacity: 1,
    hourlyRate: 30,
    equipment: ['Condenser microphone', 'Audio interface', 'Headphones']
  },
  {
    id: 'studio-003',
    name: 'Interview & Conversation Studio',
    type: 'Interview',
    capacity: 6,
    hourlyRate: 60,
    equipment: ['Multiple microphones', 'Mixer', 'Headphones', 'Remote integration']
  },
  {
    id: 'studio-004',
    name: 'Music Production Studio',
    type: 'Music',
    capacity: 8,
    hourlyRate: 100,
    equipment: ['Multiple microphones', 'Mixing console', 'Studio monitors', 'Outboard gear']
  },
  {
    id: 'studio-005',
    name: 'Voiceover & Narration Studio',
    type: 'Voiceover',
    capacity: 2,
    hourlyRate: 40,
    equipment: ['Condenser microphone', 'Audio interface', 'Headphones']
  },
  {
    id: 'studio-006',
    name: 'Emergency Broadcast Studio',
    type: 'Radio',
    capacity: 2,
    hourlyRate: 35,
    equipment: ['Dynamic microphone', 'Mixer', 'Headphones', 'Backup power']
  }
];

export function StudioBooking() {
  const [selectedStudio, setSelectedStudio] = useState<Studio | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState<string>('09:00');
  const [duration, setDuration] = useState<number>(1);
  const [bookingStep, setBookingStep] = useState<'select' | 'date' | 'equipment' | 'confirm'>('select');
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);

  const timeSlots: TimeSlot[] = [
    { startTime: '06:00', endTime: '07:00', available: true },
    { startTime: '07:00', endTime: '08:00', available: true },
    { startTime: '09:00', endTime: '10:00', available: false },
    { startTime: '10:00', endTime: '11:00', available: true },
    { startTime: '14:00', endTime: '15:00', available: true },
    { startTime: '15:00', endTime: '16:00', available: true },
    { startTime: '16:00', endTime: '17:00', available: false },
    { startTime: '18:00', endTime: '19:00', available: true }
  ];

  const handleStudioSelect = (studio: Studio) => {
    setSelectedStudio(studio);
    setBookingStep('date');
  };

  const handleDateSelect = () => {
    setBookingStep('equipment');
  };

  const handleEquipmentToggle = (equipment: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(equipment) ? prev.filter((e) => e !== equipment) : [...prev, equipment]
    );
  };

  const handleConfirmBooking = () => {
    setBookingStep('confirm');
  };

  const calculateCost = () => {
    if (!selectedStudio) return 0;
    return selectedStudio.hourlyRate * duration;
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Studio Booking</h1>
        <p className="text-lg text-muted-foreground">Reserve a studio and manage your sessions</p>
      </div>

      {bookingStep === 'select' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {studios.map((studio) => (
            <Card
              key={studio.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleStudioSelect(studio)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{studio.name}</CardTitle>
                <CardDescription>{studio.type} Studio</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Capacity: {studio.capacity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">${studio.hourlyRate}/hour</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold">Equipment:</p>
                  <div className="flex flex-wrap gap-1">
                    {studio.equipment.slice(0, 2).map((item) => (
                      <Badge key={item} variant="secondary" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                    {studio.equipment.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{studio.equipment.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>

                <Button className="w-full">Book Now</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {bookingStep === 'date' && selectedStudio && (
        <Card>
          <CardHeader>
            <CardTitle>Select Date & Time</CardTitle>
            <CardDescription>Choose when you want to book {selectedStudio.name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date Selection */}
              <div className="space-y-3">
                <label className="text-sm font-semibold">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              {/* Duration */}
              <div className="space-y-3">
                <label className="text-sm font-semibold">Duration (hours)</label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            {/* Time Slots */}
            <div className="space-y-3">
              <label className="text-sm font-semibold">Available Time Slots</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {timeSlots.map((slot) => (
                  <Button
                    key={slot.startTime}
                    variant={
                      selectedTime === slot.startTime
                        ? 'default'
                        : slot.available
                          ? 'outline'
                          : 'ghost'
                    }
                    disabled={!slot.available}
                    onClick={() => setSelectedTime(slot.startTime)}
                    className="text-sm"
                  >
                    {slot.startTime}
                  </Button>
                ))}
              </div>
            </div>

            {/* Cost Summary */}
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Cost:</span>
                <span className="text-2xl font-bold">${calculateCost()}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setBookingStep('select')}>
                Back
              </Button>
              <Button className="flex-1" onClick={handleDateSelect}>
                Next: Select Equipment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {bookingStep === 'equipment' && selectedStudio && (
        <Card>
          <CardHeader>
            <CardTitle>Select Equipment</CardTitle>
            <CardDescription>Choose additional equipment for your session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              {selectedStudio.equipment.map((item) => (
                <label key={item} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedEquipment.includes(item)}
                    onChange={() => handleEquipmentToggle(item)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{item}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setBookingStep('date')}>
                Back
              </Button>
              <Button className="flex-1" onClick={handleConfirmBooking}>
                Confirm Booking
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {bookingStep === 'confirm' && selectedStudio && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-green-600" />
              Booking Confirmed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold">Studio:</span>
                <span>{selectedStudio.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Date:</span>
                <span>{selectedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Time:</span>
                <span>{selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Duration:</span>
                <span>{duration} hour(s)</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total:</span>
                <span>${calculateCost()}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setBookingStep('select');
                  setSelectedStudio(null);
                }}
              >
                Book Another Studio
              </Button>
              <Button className="flex-1">Proceed to Payment</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
