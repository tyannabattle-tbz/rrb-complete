/**
 * RRB Navigation Pages
 * Provides page components for all RRB menu items
 */

import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';

export const RRBLegacyPage: React.FC = () => {
  const { data } = trpc.rrbNavigation.getLegacy.useQuery();

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-4">{data?.title}</h1>
      <p className="text-lg text-muted-foreground mb-8">{data?.description}</p>
      <div className="grid gap-4">
        {data?.sections?.map((section) => (
          <Card key={section.id}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{section.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export const RRBMusicPage: React.FC = () => {
  const { data } = trpc.rrbNavigation.getMusic.useQuery();

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-4">{data?.title}</h1>
      <p className="text-lg text-muted-foreground mb-8">{data?.description}</p>
      <div className="grid gap-4">
        {data?.albums?.map((album) => (
          <Card key={album.id}>
            <CardHeader>
              <CardTitle>{album.title}</CardTitle>
              <CardDescription>Year: {album.year} • Tracks: {album.tracks}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};

export const RRBProofVaultPage: React.FC = () => {
  const { data } = trpc.rrbNavigation.getProofVault.useQuery();

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-4">{data?.title}</h1>
      <p className="text-lg text-muted-foreground mb-8">{data?.description}</p>
      <div className="grid gap-4">
        {data?.documents?.map((doc) => (
          <Card key={doc.id}>
            <CardHeader>
              <CardTitle>{doc.title}</CardTitle>
              <CardDescription>{doc.type} • Verified: {doc.verified ? 'Yes' : 'No'}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};

export const RRBTestimonialsPage: React.FC = () => {
  const { data } = trpc.rrbNavigation.getTestimonials.useQuery();

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-4">{data?.title}</h1>
      <p className="text-lg text-muted-foreground mb-8">{data?.description}</p>
      <div className="grid gap-4">
        {data?.testimonials?.map((testimonial) => (
          <Card key={testimonial.id}>
            <CardHeader>
              <CardTitle>{testimonial.title}</CardTitle>
              <CardDescription>By {testimonial.author} • Verified: {testimonial.verified ? 'Yes' : 'No'}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};

export const RRBGrandmaHelenPage: React.FC = () => {
  const { data } = trpc.rrbNavigation.getGrandmaHelen.useQuery();

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-4">{data?.title}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{data?.biography?.name}</CardTitle>
          <CardDescription>{data?.biography?.years}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{data?.biography?.legacy}</p>
          <div>
            <h3 className="font-semibold mb-2">Achievements:</h3>
            <ul className="list-disc list-inside">
              {data?.biography?.achievements?.map((achievement, idx) => (
                <li key={idx}>{achievement}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const RRBFamilyLegacyPage: React.FC = () => {
  const { data } = trpc.rrbNavigation.getFamilyLegacy.useQuery();

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-4">{data?.title}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Family Tree Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Generations: {data?.familyTree?.generations}</p>
          <p>Members: {data?.familyTree?.members}</p>
          <p>Timeline: {data?.familyTree?.timeline}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export const RRBAboutPage: React.FC = () => {
  const { data } = trpc.rrbNavigation.getAboutRRB.useQuery();

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-4">{data?.title}</h1>
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{data?.mission}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Vision</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{data?.vision}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export const RRBCanrynProdPage: React.FC = () => {
  const { data } = trpc.rrbNavigation.getCanrynProd.useQuery();

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-4">{data?.title}</h1>
      <p className="text-lg text-muted-foreground mb-8">{data?.description}</p>
      <div className="grid gap-4">
        {data?.services?.map((service) => (
          <Card key={service.id}>
            <CardHeader>
              <CardTitle>{service.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{service.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export const RRBRadioPage: React.FC = () => {
  const { data } = trpc.rrbNavigation.getRadio.useQuery();
  const { mutate: activateBroadcast } = trpc.rrbNavigation.activateBroadcast.useMutation();

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-4">{data?.title}</h1>
      <div className="mb-8">
        <Button onClick={() => activateBroadcast()}>Activate Broadcast</Button>
      </div>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Current Broadcast</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Station: {data?.broadcast?.stationName}</p>
          <p>Frequency: {data?.broadcast?.frequencyLabel}</p>
          <p>Status: {data?.broadcast?.status?.toUpperCase()}</p>
          <p>Listeners: {data?.broadcast?.listeners}</p>
        </CardContent>
      </Card>
      <div className="grid gap-4">
        {data?.channels?.map((channel) => (
          <Card key={channel.id}>
            <CardHeader>
              <CardTitle>{channel.name}</CardTitle>
              <CardDescription>{channel.frequency} • {channel.tuning}Hz</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};

export const RRBPodcastVideoPage: React.FC = () => {
  const { data } = trpc.rrbNavigation.getPodcastVideo.useQuery();

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-4">{data?.title}</h1>
      <p className="text-lg text-muted-foreground mb-8">{data?.description}</p>
      <div className="grid gap-4">
        {data?.podcasts?.map((podcast) => (
          <Card key={podcast.id}>
            <CardHeader>
              <CardTitle>{podcast.title}</CardTitle>
              <CardDescription>Episodes: {podcast.episodes} • Video: {podcast.video ? 'Yes' : 'No'}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};

export const RRBWellnessPage: React.FC = () => {
  const { data } = trpc.rrbNavigation.getWellness.useQuery();

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-4">{data?.title}</h1>
      <p className="text-lg text-muted-foreground mb-8">{data?.description}</p>
      <div className="grid gap-4">
        {data?.programs?.map((program) => (
          <Card key={program.id}>
            <CardHeader>
              <CardTitle>{program.title}</CardTitle>
              <CardDescription>{program.frequency}Hz • {program.duration} minutes</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};

export const RRBSolbonesGamePage: React.FC = () => {
  const { data } = trpc.rrbNavigation.getSolbonesGame.useQuery();

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-4">{data?.title}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Game Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Players: {data?.gameInfo?.players}</p>
          <p>AI Opponents: {data?.gameInfo?.aiOpponents ? 'Yes' : 'No'}</p>
          <p>Frequencies: {data?.gameInfo?.frequencies?.join(', ')}</p>
          <p>Difficulty: {data?.gameInfo?.difficulty?.join(', ')}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export const RRBDonatePage: React.FC = () => {
  const { data } = trpc.rrbNavigation.getDonate.useQuery();

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-4">{data?.title}</h1>
      <p className="text-lg text-muted-foreground mb-8">{data?.description}</p>
      <div className="grid gap-4">
        {data?.donationOptions?.map((option) => (
          <Card key={option.id}>
            <CardHeader>
              <CardTitle>${option.amount}</CardTitle>
              <CardDescription>{option.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button>Donate Now</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export const RRBContactPage: React.FC = () => {
  const { data } = trpc.rrbNavigation.getContact.useQuery();

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-4">{data?.title}</h1>
      <p className="text-lg text-muted-foreground mb-8">{data?.description}</p>
      <Card>
        <CardHeader>
          <CardTitle>Contact Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data?.contactMethods?.map((method, idx) => (
              <div key={idx}>
                <p className="font-semibold capitalize">{method.type}</p>
                <p className="text-muted-foreground">{method.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
