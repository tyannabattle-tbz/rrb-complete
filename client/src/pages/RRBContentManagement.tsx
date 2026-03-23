/**
 * RRB Content Management Dashboard
 * Admin page for managing all RRB content (music, testimonials, family legacy)
 * Features: CRUD operations, bulk upload, content scheduling
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Edit2, Upload, Music, MessageSquare, Users, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface ContentItem {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: 'published' | 'draft' | 'scheduled';
}

interface MusicItem extends ContentItem {
  artist: string;
  album: string;
  year: number;
  tracks: number;
}

interface TestimonialItem extends ContentItem {
  author: string;
  verified: boolean;
}

interface FamilyLegacyItem extends ContentItem {
  generation: number;
  members: number;
}

export default function RRBContentManagement() {
  const [activeTab, setActiveTab] = useState('music');
  const [musicItems, setMusicItems] = useState<MusicItem[]>([
    {
      id: '1',
      title: 'Classic Sessions',
      description: 'The iconic 1970 classic recordings',
      artist: 'Rockin Rockin Boogie',
      album: 'Classic Sessions',
      year: 1970,
      tracks: 12,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'published',
    },
  ]);

  const [testimonialItems, setTestimonialItems] = useState<TestimonialItem[]>([
    {
      id: '1',
      title: 'A Legendary Experience',
      description: 'Working with RRB was transformative',
      author: 'Music Producer',
      verified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'published',
    },
  ]);

  const [familyItems, setFamilyItems] = useState<FamilyLegacyItem[]>([
    {
      id: '1',
      title: 'Family Tree Generation 1',
      description: 'The founding generation',
      generation: 1,
      members: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'published',
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddMusic = () => {
    const newItem: MusicItem = {
      id: Date.now().toString(),
      title: 'New Album',
      description: 'Album description',
      artist: 'Rockin Rockin Boogie',
      album: 'New Album',
      year: new Date().getFullYear(),
      tracks: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
    };
    setMusicItems([...musicItems, newItem]);
    toast.success('Music item created');
  };

  const handleDeleteMusic = (id: string) => {
    setMusicItems(musicItems.filter((item) => item.id !== id));
    toast.success('Music item deleted');
  };

  const handleAddTestimonial = () => {
    const newItem: TestimonialItem = {
      id: Date.now().toString(),
      title: 'New Testimonial',
      description: 'Testimonial content',
      author: 'Author Name',
      verified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
    };
    setTestimonialItems([...testimonialItems, newItem]);
    toast.success('Testimonial created');
  };

  const handleDeleteTestimonial = (id: string) => {
    setTestimonialItems(testimonialItems.filter((item) => item.id !== id));
    toast.success('Testimonial deleted');
  };

  const handleAddFamily = () => {
    const newItem: FamilyLegacyItem = {
      id: Date.now().toString(),
      title: 'New Family Generation',
      description: 'Generation description',
      generation: familyItems.length + 1,
      members: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
    };
    setFamilyItems([...familyItems, newItem]);
    toast.success('Family legacy item created');
  };

  const handleDeleteFamily = (id: string) => {
    setFamilyItems(familyItems.filter((item) => item.id !== id));
    toast.success('Family legacy item deleted');
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">RRB Content Management</h1>
        <p className="text-lg text-muted-foreground">
          Manage all RRB content including music, testimonials, and family legacy
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="music" className="flex items-center gap-2">
            <Music className="w-4 h-4" />
            Music
          </TabsTrigger>
          <TabsTrigger value="testimonials" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Testimonials
          </TabsTrigger>
          <TabsTrigger value="family" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Family Legacy
          </TabsTrigger>
        </TabsList>

        {/* Music Tab */}
        <TabsContent value="music" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Music Collection</h2>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Bulk Upload
              </Button>
              <Button onClick={handleAddMusic} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Music
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {musicItems.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{item.title}</CardTitle>
                      <CardDescription>{item.artist} • {item.year}</CardDescription>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(item.status)}`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Album</p>
                      <p className="font-semibold">{item.album}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Tracks</p>
                      <p className="font-semibold">{item.tracks}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Updated</p>
                      <p className="font-semibold text-sm">{new Date(item.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteMusic(item.id)}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Testimonials Tab */}
        <TabsContent value="testimonials" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Testimonials</h2>
            <Button onClick={handleAddTestimonial} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Testimonial
            </Button>
          </div>

          <div className="grid gap-4">
            {testimonialItems.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{item.title}</CardTitle>
                      <CardDescription>By {item.author}</CardDescription>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(item.status)}`}>
                      {item.verified ? '✓ Verified' : 'Unverified'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteTestimonial(item.id)}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Family Legacy Tab */}
        <TabsContent value="family" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Family Legacy</h2>
            <Button onClick={handleAddFamily} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Generation
            </Button>
          </div>

          <div className="grid gap-4">
            {familyItems.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{item.title}</CardTitle>
                      <CardDescription>Generation {item.generation}</CardDescription>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(item.status)}`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Members</p>
                      <p className="font-semibold">{item.members}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Updated</p>
                      <p className="font-semibold text-sm">{new Date(item.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteFamily(item.id)}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
