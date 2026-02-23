import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  wellnessScore: number;
  lastUpdated: number;
  communicationCount: number;
  mood: string;
  recentInteractions: Array<{
    date: number;
    message: string;
    interpretation: string;
  }>;
}

interface WellnessTrend {
  date: number;
  score: number;
  mood: string;
}

export function FamilyPetDashboard() {
  const [pets, setPets] = useState<Pet[]>([
    {
      id: "pet-1",
      name: "Max",
      species: "dog",
      breed: "Golden Retriever",
      age: 5,
      wellnessScore: 92,
      lastUpdated: Date.now(),
      communicationCount: 24,
      mood: "happy",
      recentInteractions: [
        {
          date: Date.now() - 3600000,
          message: "Tail wagging, playful",
          interpretation: "Excited and energetic",
        },
        {
          date: Date.now() - 7200000,
          message: "Calm, resting",
          interpretation: "Relaxed and content",
        },
      ],
    },
    {
      id: "pet-2",
      name: "Luna",
      species: "cat",
      breed: "Siamese",
      age: 3,
      wellnessScore: 88,
      lastUpdated: Date.now(),
      communicationCount: 18,
      mood: "neutral",
      recentInteractions: [
        {
          date: Date.now() - 3600000,
          message: "Purring, affectionate",
          interpretation: "Content and seeking attention",
        },
      ],
    },
  ]);

  const [selectedPet, setSelectedPet] = useState<Pet | null>(pets[0]);
  const [wellnessTrends, setWellnessTrends] = useState<WellnessTrend[]>([
    { date: Date.now() - 6 * 24 * 60 * 60 * 1000, score: 85, mood: "happy" },
    { date: Date.now() - 5 * 24 * 60 * 60 * 1000, score: 88, mood: "happy" },
    { date: Date.now() - 4 * 24 * 60 * 60 * 1000, score: 90, mood: "happy" },
    { date: Date.now() - 3 * 24 * 60 * 60 * 1000, score: 92, mood: "happy" },
    { date: Date.now() - 2 * 24 * 60 * 60 * 1000, score: 89, mood: "neutral" },
    { date: Date.now() - 24 * 60 * 60 * 1000, score: 92, mood: "happy" },
    { date: Date.now(), score: 92, mood: "happy" },
  ]);

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case "happy":
        return "bg-green-500";
      case "neutral":
        return "bg-yellow-500";
      case "stressed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case "happy":
        return "😊";
      case "neutral":
        return "😐";
      case "stressed":
        return "😟";
      default:
        return "🐾";
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Family Pet Dashboard</h1>
        <p className="text-gray-600">
          Track your pets' wellness, communication history, and behavioral insights
        </p>
      </div>

      {/* Pet Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pets.map((pet) => (
          <Card
            key={pet.id}
            className={`cursor-pointer transition-all ${
              selectedPet?.id === pet.id
                ? "ring-2 ring-blue-500 bg-blue-50"
                : "hover:shadow-lg"
            }`}
            onClick={() => setSelectedPet(pet)}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{pet.name}</CardTitle>
                  <CardDescription>
                    {pet.breed} • {pet.age} years old
                  </CardDescription>
                </div>
                <div className="text-3xl">{getMoodEmoji(pet.mood)}</div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Wellness Score</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{ width: `${pet.wellnessScore}%` }}
                    />
                  </div>
                  <span className="font-bold">{pet.wellnessScore}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Communications</span>
                <Badge variant="secondary">{pet.communicationCount}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Mood</span>
                <Badge className={getMoodColor(pet.mood)}>{pet.mood}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Pet Details */}
      {selectedPet && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wellness Trend Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Wellness Trend (7 Days)</CardTitle>
              <CardDescription>Daily wellness score tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={wellnessTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) =>
                      new Date(date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                  />
                  <YAxis domain={[0, 100]} />
                  <Tooltip
                    labelFormatter={(date) =>
                      new Date(date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    }
                    formatter={(value) => [`${value}%`, "Score"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pet Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Pet Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold">{selectedPet.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Species</p>
                <p className="font-semibold capitalize">{selectedPet.species}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Breed</p>
                <p className="font-semibold">{selectedPet.breed}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Age</p>
                <p className="font-semibold">{selectedPet.age} years</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Mood</p>
                <Badge className={getMoodColor(selectedPet.mood)}>
                  {selectedPet.mood}
                </Badge>
              </div>
              <Button className="w-full mt-4">View Full Profile</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Communications */}
      {selectedPet && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Communications</CardTitle>
            <CardDescription>
              Last interactions with {selectedPet.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedPet.recentInteractions.map((interaction, idx) => (
                <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-semibold">{interaction.message}</p>
                    <span className="text-xs text-gray-500">
                      {new Date(interaction.date).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Interpretation: {interaction.interpretation}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
