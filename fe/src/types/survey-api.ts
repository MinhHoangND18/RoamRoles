export interface SurveyOption {
  id: number;
  question_id: number;
  text: string;
  order: number;
}

export interface SurveyQuestion {
  id: number;
  question: string;
  active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
  options: SurveyOption[];
}

export interface SubmitSurveyRequest {
  session_id: string;
  answers: Record<string, string>; 
}

export interface OptionStat {
  text: string;
  count: number;
}

export interface QuestionStat {
  question_id: number;
  question: string;
  options: OptionStat[];
}

export interface SurveyStatistics {
  total_responses: number;
  question_stats: QuestionStat[];
}