import { BeatmapResponseFull, PredictionChartData } from "./types";

export const DEFAULT_PREDICTION_CHART_DATA: PredictionChartData = {
  data: [
    { name: "Alternate", value: 0.0 },
    { name: "Finger Control", value: 0.0 },
    { name: "Jump", value: 0.0 },
    { name: "Speed", value: 0.0 },
    { name: "Stamina", value: 0.0 },
    { name: "Stream", value: 0.0 },
    { name: "Tech", value: 0.0 },
  ],
};
export const DEFAULT_BEATMAP: BeatmapResponseFull = {
  beatmap_id: 0,
  beatmapset_id: 0,
  artist: "",
  title: "",
  creator: "",
  version: "",
  alternate_p: 0,
  fingercontrol_p: 0,
  jump_p: 0,
  speed_p: 0,
  stamina_p: 0,
  stream_p: 0,
  tech_p: 0,
  created_at: "",
  updated_at: "",
};
export const MAX_FILE_SIZE = 5 * 1000 * 1000;
export const MAP_TYPENAME = {
  alternate: "Alternate",
  fingercontrol: "Finger Control",
  jump: "Jump",
  speed: "Speed",
  stamina: "Stamina",
  stream: "Stream",
  tech: "Tech",
};
