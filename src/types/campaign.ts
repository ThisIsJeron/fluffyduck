
export interface UploadedFile extends File {
  preview: string;
}

export interface Campaign {
  id: string;
  media_url: string;
  caption: string | null;
  hashtags: string[] | null;
  selected?: boolean; // Made optional with ?
  title: string;
  description: string | null;
  cadence: string | null;
  target_audience: string | null;
  platforms: string[] | null;
  start_date: Date | null;
  end_date: Date | null;
}
