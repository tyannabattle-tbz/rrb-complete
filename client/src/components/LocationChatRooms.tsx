import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, MessageSquare, Users, Send } from "lucide-react";

interface ChatRoom {
  id: string;
  location: string;
  topic: string;
  members: number;
  messages: ChatMessage[];
  latitude: number;
  longitude: number;
}

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  timestamp: Date;
  avatar: string;
}

const mockChatRooms: ChatRoom[] = [
  {
    id: "room_1",
    location: "New York",
    topic: "Tech Discussion",
    members: 12,
    latitude: 40.7128,
    longitude: -74.006,
    messages: [
      {
        id: "msg_1",
        user: "Alice",
        text: "Great discussion about the new features!",
        timestamp: new Date(Date.now() - 5 * 60000),
        avatar: "👩",
      },
      {
        id: "msg_2",
        user: "Bob",
        text: "I agree, the implementation looks solid.",
        timestamp: new Date(Date.now() - 3 * 60000),
        avatar: "👨",
      },
    ],
  },
  {
    id: "room_2",
    location: "London",
    topic: "Business Networking",
    members: 8,
    latitude: 51.5074,
    longitude: -0.1278,
    messages: [
      {
        id: "msg_3",
        user: "Carol",
        text: "Looking forward to the meetup next week!",
        timestamp: new Date(Date.now() - 10 * 60000),
        avatar: "👩",
      },
    ],
  },
  {
    id: "room_3",
    location: "Tokyo",
    topic: "AI & Innovation",
    members: 15,
    latitude: 35.6762,
    longitude: 139.6503,
    messages: [
      {
        id: "msg_4",
        user: "David",
        text: "The AI advancements are incredible!",
        timestamp: new Date(Date.now() - 15 * 60000),
        avatar: "👨",
      },
    ],
  },
];

export const LocationChatRooms: React.FC = () => {
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(mockChatRooms[0]);
  const [newMessage, setNewMessage] = useState("");
  const [rooms, setRooms] = useState(mockChatRooms);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedRoom) return;

    const updatedRooms = rooms.map((room) => {
      if (room.id === selectedRoom.id) {
        return {
          ...room,
          messages: [
            ...room.messages,
            {
              id: `msg_${Date.now()}`,
              user: "You",
              text: newMessage,
              timestamp: new Date(),
              avatar: "🧑",
            },
          ],
        };
      }
      return room;
    });

    setRooms(updatedRooms);
    setSelectedRoom(updatedRooms.find((r) => r.id === selectedRoom.id) || null);
    setNewMessage("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full max-w-6xl mx-auto">
      {/* Chat Rooms List */}
      <div className="lg:col-span-1 space-y-2">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <MapPin className="text-blue-600" />
          Location Rooms
        </h2>

        {rooms.map((room) => (
          <Card
            key={room.id}
            onClick={() => setSelectedRoom(room)}
            className={`p-4 cursor-pointer transition-all ${
              selectedRoom?.id === room.id
                ? "bg-blue-100 border-blue-500 border-2"
                : "hover:bg-gray-50"
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <MapPin size={16} className="text-red-500" />
                  {room.location}
                </h3>
                <p className="text-sm text-gray-600">{room.topic}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Users size={14} />
                {room.members}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare size={14} />
                {room.messages.length}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Chat Area */}
      <div className="lg:col-span-2">
        {selectedRoom ? (
          <Card className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <MapPin className="text-blue-600" />
                {selectedRoom.location}
              </h2>
              <p className="text-sm text-gray-600">{selectedRoom.topic}</p>
              <p className="text-xs text-gray-500 mt-1">
                {selectedRoom.members} members • Coordinates: {selectedRoom.latitude.toFixed(4)}, {selectedRoom.longitude.toFixed(4)}
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
              {selectedRoom.messages.map((msg) => (
                <div key={msg.id} className="flex gap-3">
                  <div className="text-2xl">{msg.avatar}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm">{msg.user}</span>
                      <span className="text-xs text-gray-500">
                        {msg.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                      {msg.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-gray-50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Chat message input"
                />
                <Button
                  onClick={handleSendMessage}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                  aria-label="Send message"
                >
                  <Send size={18} />
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-8 text-center text-gray-500">
            <p>Select a location room to start chatting</p>
          </Card>
        )}
      </div>
    </div>
  );
};
