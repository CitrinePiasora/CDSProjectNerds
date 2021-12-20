import Head from "next/head";
import {
  Box,
  useColorModeValue,
  Stack,
  Heading,
  Text,
  Link,
} from "@chakra-ui/react";
import axios from "axios";
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

import { Container } from "../../../components/Container";
import BeatmapInfo from "../../../components/BeatmapInfo";
import { BeatmapResponseFull, PredictionChartData } from "../../../types";
import {
  BACKGROUND_COLOR,
  CHART_AXIS_COLOR,
  CHART_COLOR,
  DEFAULT_BEATMAP,
  DEFAULT_PREDICTION_CHART_DATA,
  MAIN_COLOR,
} from "../../../const";

const Index = () => {
  const router = useRouter();
  const { beatmapset_id, beatmap_id } = router.query;
  const [beatmap, setBeatmap] = useState<BeatmapResponseFull>(DEFAULT_BEATMAP);
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
      url: `http://api.osuclassy-dev.com/beatmaps/${beatmapset_id}/${beatmap_id}`,
    })
      .then((res) => {
        setBeatmap(res.data.data.beatmap);
        setChartData({
          data: [
            {
              name: "Alternate",
              value: res.data.data.beatmap.alternate_p,
            },
            {
              name: "Finger Control",
              value: res.data.data.beatmap.fingercontrol_p,
            },
            { name: "Jump", value: res.data.data.beatmap.jump_p },
            { name: "Speed", value: res.data.data.beatmap.speed_p },
            { name: "Stamina", value: res.data.data.beatmap.stamina_p },
            { name: "Stream", value: res.data.data.beatmap.stream_p },
            { name: "Tech", value: res.data.data.beatmap.tech_p },
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
        <Box py={10} px={5}>
          <Heading fontSize="6xl" textAlign={"center"}>
            Predicted{" "}
            <Link href="https://osu.ppy.sh/" color={MAIN_COLOR}>
              osu!
            </Link>{" "}
            Beatmap
          </Heading>
          <Text fontSize={"xl"} textAlign={"center"}>
            Last updated: {beatmap.updated_at ?? "Unknown"}
          </Text>
        </Box>
        <Box
          marginBottom={{ base: 10, sm: 16, md: 24 }}
          px={5}
          shadow="md"
          borderWidth="1"
          bgColor={BACKGROUND_COLOR}
          boxShadow={"2xl"}
        >
          <Stack direction={["column", "row"]}>
            <Box minW={{ base: "xs", md: "xl" }}>
              <ResponsiveContainer width={"100%"} height={400}>
                <BarChart
                  data={chartData.data}
                  layout={"vertical"}
                  margin={{ left: 20, right: 15, top: 40 }}
                >
                  <XAxis
                    type={"number"}
                    domain={[0.0, 1.0]}
                    stroke={CHART_COLOR}
                    reversed
                  />
                  <YAxis
                    type={"category"}
                    dataKey={"name"}
                    orientation={"right"}
                    stroke={CHART_COLOR}
                  ></YAxis>
                  <Tooltip />
                  <CartesianGrid horizontal={false} />
                  <Bar dataKey={"value"} fill={CHART_AXIS_COLOR} />
                </BarChart>
              </ResponsiveContainer>
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
