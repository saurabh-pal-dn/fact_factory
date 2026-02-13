export interface IFact {
  id: number;
  text: string;
  image_url?: string | null;
  metadata?: string;
  created_at: Date;
}
