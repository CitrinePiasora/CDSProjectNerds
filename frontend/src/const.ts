import { useColorModeValue } from "@chakra-ui/react";
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

// Colors
// - ChakraUI colors
export const BACKGROUND_COLOR = useColorModeValue("white", "gray.800");
export const MAIN_COLOR = useColorModeValue("osu.600", "osu.300");
// - Chart colors
export const CHART_AXIS_COLOR = useColorModeValue("#ff5ea3", "#ff94c4");
export const CHART_COLOR = useColorModeValue("#4a5568", "#ffffff");
