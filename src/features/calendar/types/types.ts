export type MissionLevel = 0 | 1 | 2 | 3;

export type DailyData = {
  date: Date;
  missionLevel: number | null;
  hasData: boolean;
  missionBits?: number | null;
};

export const VIDEO = 0b100;
export const REVIEW = 0b010;
export const QUIZ = 0b001;
export const ALL = 0b111;

export type StudyStatusItem = {
  id: number;
  keywordId: number;
  studyStats: number;
  studyStatusCount: number;
  videoCompleted: boolean;
  quizCompleted: boolean;
  reviewCompleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type StudyStatusResponse = {
  status: number;
  message: string;
  result: StudyStatusItem[];
};
