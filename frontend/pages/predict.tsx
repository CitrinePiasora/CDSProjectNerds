import React, {
  ReactElement,
  useState,
} from 'react'
import {
  Typography,
  TextContainer,
  Card,
  CardContent,
  Form,
  FormMessage,
  FormMessageCounter,
  FileInput,
  useFileUpload,
  getSplitFileUploads,
  LinearProgress,
  DialogFooter,
  Button,
  MediaContainer,
  MediaOverlay,
} from 'react-md'

import { Chart } from "react-google-charts"
import useFitText from "use-fit-text"
import filesize from 'filesize'
import cn from "classnames"
import axios from 'axios'

import Alert from '../components/Alert'
import Container from '../components/Container'
import containerStyles from "../styles/Elevation.module.scss"
import predictStyles from "../styles/Predict.module.scss"
import LinkUnstyled from '../components/LinkUnstyled';

const MAX_FILE_SIZE = 5 * 1000 * 1000;

interface PredictionResponse {
  processing_time: string
  beatmap_id: number
  beatmap_set_id: number
  artist: string
  title: string
  creator: string
  version: string
  predicted_type: { [key: string]: number }
}
interface PredictionChartData {
  data: [string, number | string][]
}
interface APIResponse {
  code: number
  message: string
  data: PredictionResponse
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
  ]
}

export default function Predict(): ReactElement {
  const [isError, setError] = useState(false)
  const [isProcessing, setProcessing] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [prediction, setPrediction] = useState<APIResponse | null>(null)
  const [chartData, setChartData] = useState<PredictionChartData>(DEFAULT_PREDICTION_CHART_DATA)
  const { fontSize, ref } = useFitText()
  const {
    stats,
    onChange,
    accept,
    reset,
    totalBytes,
  } = useFileUpload({
    concurrency: 1,
    maxFiles: 1,
    maxFileSize: MAX_FILE_SIZE,
    totalFileSize: MAX_FILE_SIZE,
    extensions: ['osu'],
    getFileParser: () => "readAsText",
  })

  const { complete } = getSplitFileUploads(stats)
  return (
    <>
      <Alert type="info">Backend server for predicting the beatmap type is currently using cpu inference, so performance might be slow.</Alert>
      <TextContainer>
        <Typography align="center" type="headline-3">Predict osu! Beatmap</Typography>
        <Typography align="center" type="body-1">Predict the type of beatmap by uploading the beatmap!</Typography>
      </TextContainer>
      <br />
      <Container position="center">
        <Card fullWidth={true}>
          <CardContent>
            <div className={cn(containerStyles.elevated)}>
              <Container>
                <div className={cn(predictStyles.chart)}>
                  <Chart
                    chartType="BarChart"
                    width={"100%"}
                    height={"300px"}
                    loader={(
                      <Container position="center">
                        <Typography type="body-1">Loading...</Typography>
                        <LinearProgress id="chart-loading" />
                      </Container>
                    )}
                    data={chartData.data}
                    options={{
                      title: 'Predicted Beatmap Type',
                      colors: ["#ff66aa"],
                      hAxis: {
                        viewWindow: {
                          min: 0,
                          max: 1,
                        }
                      },
                      animation: {
                        duration: 1000,
                        easing: "out",
                      },
                      legend: { position: 'none' },
                    }}
                  />
                </div>
                {prediction !== null && (
                  <div className={cn(predictStyles.cover)}>
                    <Card className={cn(predictStyles.card)}>
                      <MediaContainer className={cn(predictStyles['media-container'])}>
                        <img
                          src={`https://assets.ppy.sh/beatmaps/${prediction.data.beatmap_set_id}/covers/cover.jpg`}
                          alt="Beatmap cover"
                        />
                        <MediaOverlay className={cn(predictStyles.overlay)}>
                          <Typography type="headline-3" className={cn(predictStyles.text)}>{prediction.data.title}</Typography>
                          <Typography type="headline-6" className={cn(predictStyles.text)}>{prediction.data.artist}</Typography>
                          <Typography type="subtitle-2">Mapped by {prediction.data.creator}</Typography>
                        </MediaOverlay>
                      </MediaContainer>
                      <CardContent>
                        <Button theme="secondary" themeType="outline">
                          <LinkUnstyled
                            href={`https://osu.ppy.sh/beatmapsets/${prediction.data.beatmap_set_id}#osu/${prediction.data.beatmap_id}`}
                            className={cn(predictStyles.link)}
                          >
                            Visit Beatmap
                          </LinkUnstyled>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </Container>
            </div>
            {prediction !== null && showSuccessMessage && (
              <Alert type="success">{prediction.message} Processing time: {prediction.data.processing_time}</Alert>
            )}
            {isError && (
              <Alert type="danger">{errorMessage}</Alert>
            )}
            <Container margin={true} position="right">
              <Form onSubmit={() => {
                setProcessing(true)
                let formData = new FormData()
                formData.append("file", complete[0].file)
                axios({
                  method: "post",
                  url: "http://osuclassy-dev.com/api/predict",
                  data: formData,
                  headers: {
                    "Content-Type": "multipart/form-data",
                  }
                }).then(res => {
                  reset()
                  setPrediction(res.data)
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
                  })
                  setShowSuccessMessage(true)
                  setProcessing(false)
                  window.setTimeout(() => {
                    setShowSuccessMessage(false)
                  }, 5000)
                }).catch(err => {
                  setError(true)
                  if (err.response && err.response.status === 400) {
                    setErrorMessage(err.response.data.reason)
                  } else {
                    setErrorMessage("Unknown error")
                  }
                })
              }}>
                <FileInput
                  id="file"
                  onChange={onChange}
                  accept={accept}
                  multiple={false}
                  buttonType="text"
                  theme="secondary"
                >
                  {`Upload beatmap`}
                </FileInput>
                <FormMessage
                  id="total-size-allowed-counter"
                  theme="none"
                  disableWrap={true}
                  error={totalBytes > MAX_FILE_SIZE}
                >
                  <FormMessageCounter>
                    {`Maximum file size: ${filesize(totalBytes)} / ${filesize(MAX_FILE_SIZE)}`}
                  </FormMessageCounter>
                </FormMessage>
                <DialogFooter>
                  <Button
                    type="submit"
                    theme="secondary"
                    disabled={stats.length === 0}
                  >
                    Submit
                  </Button>
                </DialogFooter>
              </Form>
              {isProcessing && (
                <LinearProgress id="upload-progress"></LinearProgress>
              )}
            </Container>
          </CardContent>
        </Card>
      </Container>
    </>
  )
}
