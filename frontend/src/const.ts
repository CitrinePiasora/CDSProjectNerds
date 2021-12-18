import { PredictionChartData } from "./types";

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
export const MAX_FILE_SIZE = 5 * 1000 * 1000;
