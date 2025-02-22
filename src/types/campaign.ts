
export interface UploadedFile extends File {
  preview: string;
}

export interface Campaign {
  id: string;
  media_url: string;
  caption: string;
  hashtags: string[];
  selected: boolean;
}
