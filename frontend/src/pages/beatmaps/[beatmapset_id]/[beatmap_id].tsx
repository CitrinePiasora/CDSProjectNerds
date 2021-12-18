import Head from "next/head";
import NextLink from "next/link";
import { Box, useColorModeValue, Spinner, Stack } from "@chakra-ui/react";

import axios from "axios";

import { Container } from "../../../components/Container";
import BeatmapInfo from "../../../components/BeatmapInfo";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Chart } from "react-google-charts";

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
  data: [string, number | string][];
}

const DEFAULT_PREDICTION_CHART_DATA: PredictionChartData = {
  data: [
    ["Label", "Predicted Value"],
    ["Alternate", 0.0],
    ["Finger Control", 0.0],
    ["Jump", 0.0],
    ["Speed", 0.0],
    ["Stamina", 0.0],
    ["Stream", 0.0],
    ["Tech", 0.0],
  ],
};

const Index = () => {
  const router = useRouter();
  const { beatmapset_id, beatmap_id } = router.query;

  // ChakraUI colors
  const bg = useColorModeValue("white", "gray.800");

  // Google chart colors
  const chartAxisColor = useColorModeValue("#ff5ea3", "#ff94c4");
  const chartBgColor = useColorModeValue("#ffffff", "#1a202c");
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
            ["Label", "Predicted Value"],
            ["Alternate", res.data.data.beatmap.alternate_p],
            ["Finger Control", res.data.data.beatmap.fingercontrol_p],
            ["Jump", res.data.data.beatmap.jump_p],
            ["Speed", res.data.data.beatmap.speed_p],
            ["Stamina", res.data.data.beatmap.stamina_p],
            ["Stream", res.data.data.beatmap.stream_p],
            ["Tech", res.data.data.beatmap.tech_p],
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
            <Box minW={{ base: "xs", md: "xl" }}>
              <Chart
                chartType="BarChart"
                width={"100%"}
                height={"400px"}
                loader={<Spinner />}
                data={chartData.data}
                options={{
                  colors: [chartAxisColor],
                  backgroundColor: chartBgColor,
                  defaultColor: chartColor,
                  datalessRegionColor: chartColor,
                  hAxis: {
                    baselineColor: chartColor,
                    viewWindow: {
                      min: 0,
                      max: 1,
                    },
                    textStyle: {
                      color: chartColor,
                    },
                  },
                  vAxis: {
                    baselineColor: chartColor,
                    textStyle: {
                      color: chartColor,
                    },
                  },
                  animation: {
                    duration: 1000,
                    easing: "out",
                  },
                  legend: { position: "none" },
                }}
              />
            </Box>
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
