export type QuizStatistics = {
  correctCounts: number;
  totalCounts: number;
};

export type IncorrectQuizItem = {
  id: number;
  article: {
    id: number;
    title: string;
    keyword: {
      id: number;
      name: string;
      description: string;
      date: string;
    };
  };
  description: string;
  explanation: string;
  answer: string;
  memberAnswer: string;
  answerCreatedAt: string;
  question1?: string;
  question2?: string;
  question3?: string;
  question4?: string;
};

export type IncorrectQuizPage = {
  items: IncorrectQuizItem[];
  page: number;
  size: number;
  hasNext: boolean;
  totalElements: number;
  totalPages: number;
};
