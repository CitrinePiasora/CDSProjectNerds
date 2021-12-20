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
  DEFAULT_BEATMAP,
  DEFAULT_PREDICTION_CHART_DATA,
  MAP_TYPENAME,
} from "../../../const";

const Index = () => {
  const router = useRouter();
  const { beatmapset_id, beatmap_id } = router.query;

  // ChakraUI colors
  const bg = useColorModeValue("white", "gray.800");
  const mainColor = useColorModeValue("osu.600", "osu.300");

  // Google chart colors
  const chartAxisColor = useColorModeValue("#ff5ea3", "#ff94c4");
  const chartColor = useColorModeValue("#4a5568", "#ffffff");

  const [mapTypesStr, setMapTypeStr] = useState("");
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
        const mapType = Object.keys(res.data.data.beatmap)
          .map((v) => {
            if (v.endsWith("_p")) {
              if (res.data.data.beatmap[v] >= 0.5) {
                return `${MAP_TYPENAME[v.replace("_p", "")]}`;
              }
            }
            return null;
          })
          .filter((v) => v !== null);
        setMapTypeStr(mapType.join(", "));
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
            <Link href="https://osu.ppy.sh/" color={mainColor}>
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
          bgColor={bg}
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
          <Box marginLeft={5} marginBottom={5} width={"100%"}>
            <Text>Map type: {mapTypesStr}</Text>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default Index;
