import { randomUUID } from 'crypto';

export interface AudienceQuestion {
  id: string;
  sessionId: string;
  viewerId: string;
  viewerName: string;
  question: string;
  timestamp: Date;
  votes: number;
  status: 'pending' | 'approved' | 'rejected' | 'answered';
  answeredBy?: string;
  answer?: string;
  priority: number;
}

export interface QASession {
  id: string;
  sessionId: string;
  questions: Map<string, AudienceQuestion>;
  moderationQueue: string[]; // Question IDs pending approval
  approvedQueue: string[]; // Approved questions waiting to be asked
  answeredQuestions: string[]; // Questions that have been answered
  status: 'open' | 'closed';
}

/**
 * Audience Q&A Service
 * Manages live questions from audience during panel discussion
 */
export class AudienceQAService {
  private sessions: Map<string, QASession> = new Map();

  /**
   * Create Q&A session
   */
  async createQASession(sessionId: string): Promise<QASession> {
    const qaSessionId = randomUUID();

    const session: QASession = {
      id: qaSessionId,
      sessionId,
      questions: new Map(),
      moderationQueue: [],
      approvedQueue: [],
      answeredQuestions: [],
      status: 'open',
    };

    this.sessions.set(qaSessionId, session);
    console.log(`[AudienceQA] Q&A session created: ${qaSessionId}`);

    return session;
  }

  /**
   * Submit a question from audience
   */
  async submitQuestion(
    qaSessionId: string,
    viewerId: string,
    viewerName: string,
    question: string
  ): Promise<AudienceQuestion> {
    const session = this.sessions.get(qaSessionId);
    if (!session) {
      throw new Error('Q&A session not found');
    }

    if (session.status !== 'open') {
      throw new Error('Q&A session is closed');
    }

    const questionId = randomUUID();
    const newQuestion: AudienceQuestion = {
      id: questionId,
      sessionId: session.sessionId,
      viewerId,
      viewerName,
      question,
      timestamp: new Date(),
      votes: 0,
      status: 'pending',
      priority: 0,
    };

    session.questions.set(questionId, newQuestion);
    session.moderationQueue.push(questionId);

    console.log(`[AudienceQA] Question submitted: "${question.slice(0, 50)}..."`);

    return newQuestion;
  }

  /**
   * Upvote a question
   */
  async upvoteQuestion(qaSessionId: string, questionId: string): Promise<number> {
    const session = this.sessions.get(qaSessionId);
    if (!session) {
      throw new Error('Q&A session not found');
    }

    const question = session.questions.get(questionId);
    if (!question) {
      throw new Error('Question not found');
    }

    question.votes++;
    question.priority = question.votes;

    // Re-sort moderation queue by priority
    this.sortQueueByPriority(session.moderationQueue, session.questions);

    console.log(`[AudienceQA] Question upvoted: ${questionId} (${question.votes} votes)`);

    return question.votes;
  }

  /**
   * Approve a question for asking
   */
  async approveQuestion(qaSessionId: string, questionId: string): Promise<void> {
    const session = this.sessions.get(qaSessionId);
    if (!session) {
      throw new Error('Q&A session not found');
    }

    const question = session.questions.get(questionId);
    if (!question) {
      throw new Error('Question not found');
    }

    // Remove from moderation queue
    const modIndex = session.moderationQueue.indexOf(questionId);
    if (modIndex !== -1) {
      session.moderationQueue.splice(modIndex, 1);
    }

    // Add to approved queue
    if (!session.approvedQueue.includes(questionId)) {
      session.approvedQueue.push(questionId);
    }

    question.status = 'approved';

    console.log(`[AudienceQA] Question approved: "${question.question.slice(0, 50)}..."`);
  }

  /**
   * Reject a question
   */
  async rejectQuestion(qaSessionId: string, questionId: string): Promise<void> {
    const session = this.sessions.get(qaSessionId);
    if (!session) {
      throw new Error('Q&A session not found');
    }

    const question = session.questions.get(questionId);
    if (!question) {
      throw new Error('Question not found');
    }

    // Remove from moderation queue
    const modIndex = session.moderationQueue.indexOf(questionId);
    if (modIndex !== -1) {
      session.moderationQueue.splice(modIndex, 1);
    }

    question.status = 'rejected';

    console.log(`[AudienceQA] Question rejected: "${question.question.slice(0, 50)}..."`);
  }

  /**
   * Get next question to ask
   */
  async getNextQuestion(qaSessionId: string): Promise<AudienceQuestion | null> {
    const session = this.sessions.get(qaSessionId);
    if (!session) {
      throw new Error('Q&A session not found');
    }

    if (session.approvedQueue.length === 0) {
      return null;
    }

    const questionId = session.approvedQueue[0];
    const question = session.questions.get(questionId);

    return question || null;
  }

  /**
   * Answer a question
   */
  async answerQuestion(
    qaSessionId: string,
    questionId: string,
    answer: string,
    answeredBy: string
  ): Promise<void> {
    const session = this.sessions.get(qaSessionId);
    if (!session) {
      throw new Error('Q&A session not found');
    }

    const question = session.questions.get(questionId);
    if (!question) {
      throw new Error('Question not found');
    }

    question.status = 'answered';
    question.answer = answer;
    question.answeredBy = answeredBy;

    // Move to answered queue
    const approvedIndex = session.approvedQueue.indexOf(questionId);
    if (approvedIndex !== -1) {
      session.approvedQueue.splice(approvedIndex, 1);
    }

    session.answeredQuestions.push(questionId);

    console.log(`[AudienceQA] Question answered by ${answeredBy}`);
  }

  /**
   * Get pending questions (for moderator)
   */
  async getPendingQuestions(qaSessionId: string): Promise<AudienceQuestion[]> {
    const session = this.sessions.get(qaSessionId);
    if (!session) {
      throw new Error('Q&A session not found');
    }

    return session.moderationQueue
      .map(qId => session.questions.get(qId))
      .filter((q): q is AudienceQuestion => q !== undefined)
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get approved questions (waiting to be asked)
   */
  async getApprovedQuestions(qaSessionId: string): Promise<AudienceQuestion[]> {
    const session = this.sessions.get(qaSessionId);
    if (!session) {
      throw new Error('Q&A session not found');
    }

    return session.approvedQueue
      .map(qId => session.questions.get(qId))
      .filter((q): q is AudienceQuestion => q !== undefined);
  }

  /**
   * Get answered questions
   */
  async getAnsweredQuestions(qaSessionId: string): Promise<AudienceQuestion[]> {
    const session = this.sessions.get(qaSessionId);
    if (!session) {
      throw new Error('Q&A session not found');
    }

    return session.answeredQuestions
      .map(qId => session.questions.get(qId))
      .filter((q): q is AudienceQuestion => q !== undefined);
  }

  /**
   * Get all questions
   */
  async getAllQuestions(qaSessionId: string): Promise<AudienceQuestion[]> {
    const session = this.sessions.get(qaSessionId);
    if (!session) {
      throw new Error('Q&A session not found');
    }

    return Array.from(session.questions.values());
  }

  /**
   * Get Q&A statistics
   */
  async getStats(qaSessionId: string): Promise<{
    totalQuestions: number;
    pendingQuestions: number;
    approvedQuestions: number;
    answeredQuestions: number;
    topQuestion: AudienceQuestion | null;
  }> {
    const session = this.sessions.get(qaSessionId);
    if (!session) {
      throw new Error('Q&A session not found');
    }

    const allQuestions = Array.from(session.questions.values());
    const topQuestion = allQuestions.sort((a, b) => b.votes - a.votes)[0] || null;

    return {
      totalQuestions: allQuestions.length,
      pendingQuestions: session.moderationQueue.length,
      approvedQuestions: session.approvedQueue.length,
      answeredQuestions: session.answeredQuestions.length,
      topQuestion,
    };
  }

  /**
   * Close Q&A session
   */
  async closeQASession(qaSessionId: string): Promise<void> {
    const session = this.sessions.get(qaSessionId);
    if (!session) {
      throw new Error('Q&A session not found');
    }

    session.status = 'closed';
    console.log(`[AudienceQA] Q&A session closed: ${qaSessionId}`);
  }

  /**
   * Helper: Sort queue by priority
   */
  private sortQueueByPriority(
    queue: string[],
    questions: Map<string, AudienceQuestion>
  ): void {
    queue.sort((a, b) => {
      const qA = questions.get(a);
      const qB = questions.get(b);
      if (!qA || !qB) return 0;
      return qB.priority - qA.priority;
    });
  }
}

export const audienceQAService = new AudienceQAService();
