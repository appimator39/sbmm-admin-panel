export interface Quiz {
  _id: string;
  title: string;
  topicId: {
    _id: string;
    name: string;
    description: string;
  };
  batchIds: {
    _id: string;
    title: string;
    description: string;
  }[];
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
    _id: string;
  }[];
  totalMarks: number;
  passingMarks: number;
  lastDateToSubmit: string;
  submissions: {
    userId: string;
    answers: number[];
    score: number;
    _id: string;
  }[];
  createdAt: string;
  updatedAt: string;
  __v?: number;
} 