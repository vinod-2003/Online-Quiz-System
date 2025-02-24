import { IStorage } from "./types";
import createMemoryStore from "memorystore";
import session from "express-session";
import {
  User,
  InsertUser,
  Quiz,
  Question,
  Option,
  Attempt,
  Response,
  QuizWithQuestions,
  AttemptWithDetails,
} from "@shared/schema";

const MemoryStore = createMemoryStore(session);

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private quizzes: Map<number, Quiz>;
  private questions: Map<number, Question>;
  private options: Map<number, Option>;
  private attempts: Map<number, Attempt>;
  private responses: Map<number, Response>;
  private currentIds: {
    users: number;
    quizzes: number;
    questions: number;
    options: number;
    attempts: number;
    responses: number;
  };
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.quizzes = new Map();
    this.questions = new Map();
    this.options = new Map();
    this.attempts = new Map();
    this.responses = new Map();
    this.currentIds = {
      users: 1,
      quizzes: 1,
      questions: 1,
      options: 1,
      attempts: 1,
      responses: 1,
    };
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });

    // Create admin user
    this.createUser({
      username: "admin",
      password: "admin",
      isAdmin: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser & { isAdmin?: boolean }): Promise<User> {
    const id = this.currentIds.users++;
    const user: User = { ...insertUser, id, isAdmin: insertUser.isAdmin || false };
    this.users.set(id, user);
    return user;
  }

  async createQuiz(quiz: Omit<Quiz, "id">): Promise<Quiz> {
    const id = this.currentIds.quizzes++;
    const newQuiz: Quiz = { ...quiz, id };
    this.quizzes.set(id, newQuiz);
    return newQuiz;
  }

  async getQuiz(id: number): Promise<QuizWithQuestions | undefined> {
    const quiz = this.quizzes.get(id);
    if (!quiz) return undefined;

    const questions = Array.from(this.questions.values()).filter(
      (q) => q.quizId === id,
    );
    const questionsWithOptions = questions.map((q) => ({
      ...q,
      options: Array.from(this.options.values()).filter(
        (o) => o.questionId === q.id,
      ),
    }));

    return {
      ...quiz,
      questions: questionsWithOptions,
    };
  }

  async getQuizzes(): Promise<Quiz[]> {
    return Array.from(this.quizzes.values());
  }

  async createQuestion(
    question: Omit<Question, "id">,
    options: Omit<Option, "id" | "questionId">[],
  ): Promise<Question> {
    const id = this.currentIds.questions++;
    const newQuestion: Question = { ...question, id };
    this.questions.set(id, newQuestion);

    options.forEach((option) => {
      const optionId = this.currentIds.options++;
      this.options.set(optionId, {
        ...option,
        id: optionId,
        questionId: id,
      });
    });

    return newQuestion;
  }

  async createAttempt(attempt: Omit<Attempt, "id">): Promise<Attempt> {
    const id = this.currentIds.attempts++;
    const newAttempt: Attempt = { ...attempt, id };
    this.attempts.set(id, newAttempt);
    return newAttempt;
  }

  async getAttempt(id: number): Promise<AttemptWithDetails | undefined> {
    const attempt = this.attempts.get(id);
    if (!attempt) return undefined;

    const quiz = this.quizzes.get(attempt.quizId);
    if (!quiz) return undefined;

    const responses = Array.from(this.responses.values())
      .filter((r) => r.attemptId === id)
      .map((r) => {
        const question = this.questions.get(r.questionId);
        const selectedOption = this.options.get(r.optionId);
        if (!question || !selectedOption) return null;
        return {
          ...r,
          question,
          selectedOption,
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);

    return {
      ...attempt,
      quiz,
      responses,
    };
  }

  async getAttemptsByQuiz(quizId: number): Promise<Attempt[]> {
    return Array.from(this.attempts.values()).filter((a) => a.quizId === quizId);
  }

  async getAttemptsByUser(userId: number): Promise<Attempt[]> {
    return Array.from(this.attempts.values()).filter((a) => a.userId === userId);
  }

  async submitResponse(response: Omit<Response, "id">): Promise<Response> {
    const id = this.currentIds.responses++;
    const newResponse: Response = { ...response, id };
    this.responses.set(id, newResponse);
    return newResponse;
  }
}

export const storage = new MemStorage();
