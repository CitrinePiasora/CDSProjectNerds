import {
  Alert,
  AlertIcon,
  Box,
  Center,
  Heading,
  Link,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import Head from "next/head";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Container } from "../components/Container";
import BeatmapInfo from "../components/BeatmapInfo";
import { APIResponse, PredictionChartData } from "../types";
import { DEFAULT_PREDICTION_CHART_DATA, MAX_FILE_SIZE } from "../const";

const Predict = () => {
  // ChakraUI colors
  const bg = useColorModeValue("white", "gray.800");
  const mainColor = useColorModeValue("osu.600", "osu.300");

  // Google chart colors
  const chartAxisColor = useColorModeValue("#ff5ea3", "#ff94c4");
  const chartColor = useColorModeValue("#4a5568", "#ffffff");

  const [isError, setError] = useState(false);
  const [isProcessing, setProcessing] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [prediction, setPrediction] = useState<APIResponse | null>(null);
  const [chartData, setChartData] = useState<PredictionChartData>(
    DEFAULT_PREDICTION_CHART_DATA
  );
  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles?.[0];
    if (!file) {
      return;
    } else if (file.size > MAX_FILE_SIZE) {
      setError(true);
      setErrorMessage("File size can't be more than 5MB.");
      window.setTimeout(() => {
        setError(false);
        setErrorMessage("");
      }, 5000);
      return;
    }
    if (
      (file.name.substring(file.name.lastIndexOf(".") + 1, file.name.length) ||
        file.name) !== "osu"
    ) {
      setError(true);
      setErrorMessage("Only .osu file is supported.");
      window.setTimeout(() => {
        setError(false);
        setErrorMessage("");
      }, 5000);
      return;
    }
    setProcessing(true);
    let formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios({
        method: "post",
        url: `http://${process.env.BE_URL}/predict`,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setPrediction(res.data);
      setChartData({
        data: [
          { name: "Alternate", value: res.data.data.predicted_type.alternate },
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
      setShowSuccessMessage(true);
      setProcessing(false);
      window.setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setErrorMessage(err.response.data.reason);
      } else {
        console.log(err);
        setErrorMessage("Unknown error");
      }
      setError(true);
      setProcessing(false);
      window.setTimeout(() => {
        setError(false);
        setErrorMessage("");
      }, 5000);
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <>
      <Head>
        <title>OsuClassy - Beatmap Predictor | Predict</title>
        <meta
          name={"description"}
          content={
            "osu! Beatmap predictor, where you can upload a beatmap and it will try to predict the type of the beatmap."
          }
        />
      </Head>
      <Container>
        <Alert status="info" variant="left-accent">
          <AlertIcon />
          Backend server for predicting the beatmap type is currently using cpu
          inference, so performance might be slow.
        </Alert>
        <Box py={10} px={5}>
          <Heading fontSize="6xl" textAlign={"center"}>
            Predict{" "}
            <Link href="https://osu.ppy.sh/" color={mainColor}>
              osu!
            </Link>{" "}
            Beatmap
          </Heading>
          <Text fontSize={"xl"} textAlign={"center"}>
            Predict the type of beatmap by uploading it!
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
              {prediction !== null && (
                <BeatmapInfo
                  title={prediction.data.title}
                  artist={prediction.data.artist}
                  version={prediction.data.version}
                  mappedBy={prediction.data.creator}
                  link={`https://osu.ppy.sh/beatmapsets/${prediction.data.beatmapset_id}#osu/${prediction.data.beatmap_id}`}
                  imgSrc={`https://assets.ppy.sh/beatmaps/${prediction.data.beatmapset_id}/covers/cover.jpg`}
                />
              )}
            </Box>
          </Stack>
          <Center>
            <VStack width={"100%"} m={10}>
              {prediction !== null && showSuccessMessage && (
                <Alert status="success" variant="left-accent">
                  {prediction.message} Processing time:{" "}
                  {prediction.data.processing_time}
                </Alert>
              )}
              {isError && (
                <Alert status="error" variant="left-accent">
                  <AlertIcon />
                  {errorMessage}
                </Alert>
              )}
              <Box
                w={"100%"}
                px={{ base: 10, md: 25 }}
                py={50}
                bg={bg}
                borderRadius={5}
                borderWidth={2}
                borderColor={mainColor}
                textAlign="center"
                {...getRootProps()}
              >
                <input accept=".osu" {...getInputProps()} />
                {isProcessing ? (
                  <Spinner />
                ) : isDragActive ? (
                  <Text>Drop the file here...</Text>
                ) : (
                  <Text>Drag 'n' drop file here, or click to select file.</Text>
                )}
              </Box>
            </VStack>
          </Center>
        </Box>
      </Container>
    </>
  );
};

export default Predict;
