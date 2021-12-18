export interface BeatmapResponseFull {
  beatmap_id: number;
  beatmapset_id: number;
  artist: string;
  title: string;
  creator: string;
  version: string;
  alternate_p: number;
  fingercontrol_p: number;
  jump_p: number;
  speed_p: number;
  stamina_p: number;
  stream_p: number;
  tech_p: number;
  created_at: string;
  updated_at: string;
}
export interface BeatmapResponse {
  beatmap_id: number;
  beatmapset_id: number;
  artist: string;
  title: string;
  creator: string;
  version: string;
}
export interface PredictionResponse {
  processing_time: string;
  beatmap_id: number;
  beatmapset_id: number;
  artist: string;
  title: string;
  creator: string;
  version: string;
  predicted_type: { [key: string]: number };
}
export interface APIResponse {
  code: number;
  message: string;
  data: PredictionResponse;
}
export interface PredictionChartData {
  data: { [key: string]: string | number }[];
}
