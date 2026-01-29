export interface ReusableBlock {
  id: number;
  title: string;
  content_json: string;
  status: "active" | "inactive";
}