import { GetServerSideProps } from "next";
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
import { MAP_TYPENAME } from "../../../const";

interface Props {
  mapType: string;
  beatmap: BeatmapResponseFull;
  chartData: PredictionChartData;
  beatmapset_id: number;
  beatmap_id: number;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const res = await axios({
      method: "get",
      url: `http://api.osuclassy.fauzanardh.me/beatmaps/${context.query.beatmapset_id}/${context.query.beatmap_id}`,
    });
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
    return {
      props: {
        mapType: mapType.join(", "),
        beatmap: res.data.data.beatmap,
        chartData: {
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
        },
        beatmapset_id: context.query.beatmapset_id,
        beatmap_id: context.query.beatmap_id,
      },
    };
  } catch (err) {
    return {
      notFound: true,
    };
  }
};

const Index = (props: Props) => {
  // ChakraUI colors
  const bg = useColorModeValue("white", "gray.800");
  const mainColor = useColorModeValue("osu.600", "osu.300");

  // Chart colors
  const chartAxisColor = useColorModeValue("#ff5ea3", "#ff94c4");
  const chartColor = useColorModeValue("#4a5568", "#ffffff");

  return (
    <>
      <Head>
        <title>
          OsuClassy - Beatmap Predictor | BeatmapSet:{props.beatmapset_id}{" "}
          Beatmap:
          {props.beatmap_id}
        </title>
        <meta
          name={"description"}
          content={`Predicted beatmap. BeatmapSet is ${props.beatmapset_id} Beatmap is ${props.beatmap_id}`}
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
            Last updated: {props.beatmap.updated_at ?? "Unknown"}
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
                  data={props.chartData.data}
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
              <BeatmapInfo
                title={props.beatmap.title}
                artist={props.beatmap.artist}
                version={props.beatmap.version}
                mappedBy={props.beatmap.creator}
                link={`https://osu.ppy.sh/beatmapsets/${props.beatmap.beatmapset_id}#osu/${props.beatmap.beatmap_id}`}
                imgSrc={`https://assets.ppy.sh/beatmaps/${props.beatmap.beatmapset_id}/covers/cover.jpg`}
              />
            </Box>
          </Stack>
          <Box marginLeft={5} marginBottom={5} width={"100%"}>
            <Text>Map type: {props.mapType}</Text>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default Index;
