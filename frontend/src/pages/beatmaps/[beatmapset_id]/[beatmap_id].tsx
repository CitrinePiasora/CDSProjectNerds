import Head from "next/head";
import { Box, useColorModeValue, Stack } from "@chakra-ui/react";

import axios from "axios";

import { Container } from "../../../components/Container";
import BeatmapInfo from "../../../components/BeatmapInfo";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface BeatmapResponse {
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
}
interface PredictionChartData {
  data: { [key: string]: string | number }[];
}
const DEFAULT_PREDICTION_CHART_DATA: PredictionChartData = {
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

const Index = () => {
  const router = useRouter();
  const { beatmapset_id, beatmap_id } = router.query;

  // ChakraUI colors
  const bg = useColorModeValue("white", "gray.800");

  // Google chart colors
  const chartAxisColor = useColorModeValue("#ff5ea3", "#ff94c4");
  const chartColor = useColorModeValue("#4a5568", "#ffffff");

  const [beatmap, setBeatmap] = useState<BeatmapResponse | null>(null);
  const [chartData, setChartData] = useState<PredictionChartData>(
    DEFAULT_PREDICTION_CHART_DATA
  );

  useEffect(() => {
    if (
      typeof beatmapset_id === "undefined" &&
      typeof beatmap_id === "undefined"
    ) {
      return;
    }
    axios({
      method: "get",
      url: `http://osuclassy-dev.com/api/beatmaps/${beatmapset_id}/${beatmap_id}`,
    })
      .then((res) => {
        setBeatmap(res.data.data.beatmap);
        setChartData({
          data: [
            {
              name: "Alternate",
              value: res.data.data.predicted_type.alternate,
            },
            {
              name: "Finger Control",
              value: res.data.data.predicted_type.fingercontrol,
            },
            { name: "Jump", value: res.data.data.predicted_type.jump },
            { name: "Speed", value: res.data.data.predicted_type.speed },
            { name: "Stamina", value: res.data.data.predicted_type.stamina },
            { name: "Stream", value: res.data.data.predicted_type.stream },
            { name: "Tech", value: res.data.data.predicted_type.tech },
          ],
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }, [beatmapset_id, beatmap_id]);

  return (
    <>
      <Head>
        <title>
          OsuClassy - Beatmap Predictor | BeatmapSet:{beatmapset_id} Beatmap:
          {beatmap_id}
        </title>
        <meta
          name={"description"}
          content={`Predicted beatmap. BeatmapSet is ${beatmapset_id} Beatmap is ${beatmap_id}`}
        />
      </Head>
      <Container>
        <Box
          marginBottom={{ base: 10, sm: 16, md: 24 }}
          px={5}
          shadow="md"
          borderWidth="1"
          bgColor={bg}
          boxShadow={"2xl"}
        >
          <Stack direction={["column", "row"]}>
            <ResponsiveContainer width={"100%"} height={400}>
              <BarChart
                data={chartData.data}
                layout={"vertical"}
                margin={{ left: 20, right: 15, top: 40 }}
              >
                <XAxis
                  type={"number"}
                  domain={[0.0, 1.0]}
                  stroke={chartColor}
                  reversed
                />
                <YAxis
                  type={"category"}
                  dataKey={"name"}
                  orientation={"right"}
                  stroke={chartColor}
                ></YAxis>
                <Tooltip />
                <CartesianGrid horizontal={false} />
                <Bar dataKey={"value"} fill={chartAxisColor} />
              </BarChart>
            </ResponsiveContainer>
            <Box
              px={5}
              py={10}
              minW={{ base: "xs", md: "md" }}
              height={"400px"}
            >
              {beatmap !== null && (
                <BeatmapInfo
                  title={beatmap.title}
                  artist={beatmap.artist}
                  version={beatmap.version}
                  mappedBy={beatmap.creator}
                  link={`https://osu.ppy.sh/beatmapsets/${beatmap.beatmapset_id}#osu/${beatmap.beatmap_id}`}
                  imgSrc={`https://assets.ppy.sh/beatmaps/${beatmap.beatmapset_id}/covers/cover.jpg`}
                />
              )}
            </Box>
          </Stack>
        </Box>
      </Container>
    </>
  );
};

export default Index;
