export interface PollOption {
  id: string;
  text: string;
  votes: number;
  percentage: number;
}

export interface Poll {
  id: string;
  broadcastId: string;
  question: string;
  options: PollOption[];
  startedAt: Date;
  endsAt: Date;
  totalVotes: number;
  isActive: boolean;
  results: Map<string, string>; // userId -> optionId
}

export interface SongRequest {
  id: string;
  broadcastId: string;
  userId: string;
  userName: string;
  songTitle: string;
  artist: string;
  votes: number;
  requestedAt: Date;
  played: boolean;
}

export interface VotingStats {
  totalPolls: number;
  activePolls: number;
  totalVotes: number;
  averageParticipation: number;
  topVotedOption: PollOption | null;
}

class ListenerVotingService {
  private polls: Map<string, Poll> = new Map();
  private songRequests: Map<string, SongRequest[]> = new Map();
  private userVotes: Map<string, Set<string>> = new Map(); // userId -> pollIds voted on

  /**
   * Create a new poll
   */
  async createPoll(
    broadcastId: string,
    question: string,
    options: string[],
    durationSeconds: number = 60
  ): Promise<Poll> {
    const pollId = `poll-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    const endsAt = new Date(now.getTime() + durationSeconds * 1000);

    const poll: Poll = {
      id: pollId,
      broadcastId,
      question,
      options: options.map((text, idx) => ({
        id: `option-${pollId}-${idx}`,
        text,
        votes: 0,
        percentage: 0,
      })),
      startedAt: now,
      endsAt,
      totalVotes: 0,
      isActive: true,
      results: new Map(),
    };

    this.polls.set(pollId, poll);
    return poll;
  }

  /**
   * Vote on a poll
   */
  async vote(pollId: string, optionId: string, userId: string): Promise<Poll | null> {
    const poll = this.polls.get(pollId);
    if (!poll) return null;

    // Check if poll is still active
    if (!poll.isActive || new Date() > poll.endsAt) {
      poll.isActive = false;
      return poll;
    }

    // Check if user already voted
    const userVotedPolls = this.userVotes.get(userId) || new Set();
    if (userVotedPolls.has(pollId)) {
      return poll; // User already voted
    }

    // Record vote
    const option = poll.options.find((o) => o.id === optionId);
    if (option) {
      option.votes++;
      poll.totalVotes++;
      poll.results.set(userId, optionId);

      // Update percentages
      poll.options.forEach((opt) => {
        opt.percentage = poll.totalVotes > 0 ? (opt.votes / poll.totalVotes) * 100 : 0;
      });

      // Track user vote
      userVotedPolls.add(pollId);
      this.userVotes.set(userId, userVotedPolls);
    }

    return poll;
  }

  /**
   * Get poll results
   */
  async getPollResults(pollId: string): Promise<Poll | null> {
    return this.polls.get(pollId) || null;
  }

  /**
   * End poll
   */
  async endPoll(pollId: string): Promise<Poll | null> {
    const poll = this.polls.get(pollId);
    if (poll) {
      poll.isActive = false;
    }
    return poll;
  }

  /**
   * Request a song
   */
  async requestSong(
    broadcastId: string,
    userId: string,
    userName: string,
    songTitle: string,
    artist: string
  ): Promise<SongRequest> {
    const requestId = `request-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const request: SongRequest = {
      id: requestId,
      broadcastId,
      userId,
      userName,
      songTitle,
      artist,
      votes: 1, // User's own vote
      requestedAt: new Date(),
      played: false,
    };

    const requests = this.songRequests.get(broadcastId) || [];
    requests.push(request);
    this.songRequests.set(broadcastId, requests);

    return request;
  }

  /**
   * Vote for a song request
   */
  async voteSongRequest(requestId: string): Promise<SongRequest | null> {
    for (const [, requests] of this.songRequests) {
      const request = requests.find((r) => r.id === requestId);
      if (request) {
        request.votes++;
        return request;
      }
    }
    return null;
  }

  /**
   * Get top song requests
   */
  async getTopSongRequests(broadcastId: string, limit: number = 10): Promise<SongRequest[]> {
    const requests = this.songRequests.get(broadcastId) || [];
    return requests
      .filter((r) => !r.played)
      .sort((a, b) => b.votes - a.votes)
      .slice(0, limit);
  }

  /**
   * Mark song as played
   */
  async markSongAsPlayed(requestId: string): Promise<SongRequest | null> {
    for (const [, requests] of this.songRequests) {
      const request = requests.find((r) => r.id === requestId);
      if (request) {
        request.played = true;
        return request;
      }
    }
    return null;
  }

  /**
   * Get voting statistics
   */
  async getVotingStats(broadcastId: string): Promise<VotingStats> {
    const broadcastPolls = Array.from(this.polls.values()).filter((p) => p.broadcastId === broadcastId);

    const totalVotes = broadcastPolls.reduce((sum, p) => sum + p.totalVotes, 0);
    const activePolls = broadcastPolls.filter((p) => p.isActive).length;

    let topVotedOption: PollOption | null = null;
    let maxVotes = 0;

    broadcastPolls.forEach((poll) => {
      poll.options.forEach((option) => {
        if (option.votes > maxVotes) {
          maxVotes = option.votes;
          topVotedOption = option;
        }
      });
    });

    const averageParticipation =
      broadcastPolls.length > 0 ? totalVotes / broadcastPolls.length : 0;

    return {
      totalPolls: broadcastPolls.length,
      activePolls,
      totalVotes,
      averageParticipation,
      topVotedOption,
    };
  }

  /**
   * Get active polls for broadcast
   */
  async getActivePolls(broadcastId: string): Promise<Poll[]> {
    return Array.from(this.polls.values()).filter(
      (p) => p.broadcastId === broadcastId && p.isActive && new Date() <= p.endsAt
    );
  }

  /**
   * Get all polls for broadcast
   */
  async getAllPolls(broadcastId: string): Promise<Poll[]> {
    return Array.from(this.polls.values()).filter((p) => p.broadcastId === broadcastId);
  }
}

export const listenerVotingService = new ListenerVotingService();
