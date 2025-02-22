
export interface UploadedFile extends File {
  preview: string;
}

export interface Campaign {
  id: string;
  media_url: string;
  caption: string;
  hashtags: string[];
  selected: boolean;
  title: string;
  description: string;
  cadence: string;
  target_audience: string;
  platforms: string[];
}
