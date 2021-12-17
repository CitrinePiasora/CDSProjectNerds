import {
  Alert,
  AlertIcon,
  Box,
  Center,
  Heading,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Chart } from "react-google-charts";
import axios from "axios";

import { Container } from "../components/Container";
import BeatmapInfo from "../components/ImageCard";

const MAX_FILE_SIZE = 5 * 1000 * 1000;

interface PredictionResponse {
  processing_time: string;
  beatmap_id: number;
  beatmap_set_id: number;
  artist: string;
  title: string;
  creator: string;
  version: string;
  predicted_type: { [key: string]: number };
}
interface PredictionChartData {
  data: [string, number | string][];
}
interface APIResponse {
  code: number;
  message: string;
  data: PredictionResponse;
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

const Predict = () => {
  // ChakraUI colors
  const bg = useColorModeValue("white", "gray.800");
  const mainColor = useColorModeValue("osu.600", "osu.300");

  // Google chart colors
  const chartAxisColor = useColorModeValue("#ff5ea3", "#ff94c4");
  const chartBgColor = useColorModeValue("#ffffff", "#1a202c");
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
    axios({
      method: "post",
      url: "http://osuclassy-dev.com/api/predict",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
      .then((res) => {
        setPrediction(res.data);
        setChartData({
          data: [
            ["Label", "Predicted Value"],
            ["Alternate", res.data.data.predicted_type.alternate],
            ["Finger Control", res.data.data.predicted_type.fingercontrol],
            ["Jump", res.data.data.predicted_type.jump],
            ["Speed", res.data.data.predicted_type.speed],
            ["Stamina", res.data.data.predicted_type.stamina],
            ["Stream", res.data.data.predicted_type.stream],
            ["Tech", res.data.data.predicted_type.tech],
          ],
        });
        setShowSuccessMessage(true);
        setProcessing(false);
        window.setTimeout(() => {
          setShowSuccessMessage(false);
        }, 5000);
      })
      .catch((err) => {
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
      });
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <Container>
      <Alert status="info" variant="left-accent">
        <AlertIcon />
        Backend server for predicting the beatmap type is currently using cpu
        inference, so performance might be slow.
      </Alert>
      <Box py={10} px={5}>
        <Heading fontSize="6xl">Predict osu! Beatmap</Heading>
        <Text fontSize={"2xl"}>
          Predict the type of beatmap by uploading the beatmap!
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
          <Box p={5} minW={{ base: "xs", md: "md" }} height={"400px"}>
            {prediction !== null && (
              <BeatmapInfo
                title={prediction.data.title}
                artist={prediction.data.artist}
                version={prediction.data.version}
                mappedBy={prediction.data.creator}
                link={`https://osu.ppy.sh/beatmapsets/${prediction.data.beatmap_set_id}#osu/${prediction.data.beatmap_id}`}
                imgSrc={`https://assets.ppy.sh/beatmaps/${prediction.data.beatmap_set_id}/covers/cover.jpg`}
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
  );
};

export default Predict;
