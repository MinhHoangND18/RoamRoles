// Survey Types

export interface SurveySet {
  id: number;
  name: string;
  description: string;
  slug: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
  questions?: SurveyQuestion[];
}

export interface SurveyQuestion {
  id: number;
  set_id: number;
  question: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
  options: SurveyOption[];
}

export interface SurveyOption {
  id: number;
  question_id: number;
  text: string;
  order: number;
}

export interface SurveyResponse {
  id: number;
  set_id: number;
  question_id: number;
  option_id: number;
  user_ip: string;
  session_id: string;
  created_at: string;
}