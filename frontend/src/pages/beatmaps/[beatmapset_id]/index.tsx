import Head from "next/head";
import NextLink from "next/link";
import {
  Box,
  Grid,
  Heading,
  useColorModeValue,
  VStack,
  Link,
  Flex,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";

import { Container } from "../../../components/Container";
import BeatmapInfo from "../../../components/BeatmapInfo";
import { BeatmapResponse } from "../../../types";

const Index = () => {
  const bg = useColorModeValue("white", "gray.800");

  const router = useRouter();
  const { beatmapset_id } = router.query;

  const [beatmaps, setBeatmaps] = useState<BeatmapResponse[]>([]);

  useEffect(() => {
    axios({
      method: "get",
      url: `http://${process.env.BE_URL}/api/beatmaps/${beatmapset_id}`,
    })
      .then((res) => {
        setBeatmaps(res.data.data.beatmaps);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <>
      <Head>
        <title>
          OsuClassy - Beatmap Predictor | BeatmapSet:{beatmapset_id}
        </title>
        <meta
          name={"description"}
          content={`Set of beatmaps with the same beatmapset_id. BeatmapSet is ${beatmapset_id}`}
        />
      </Head>
      <Container>
        <VStack spacing={5} m={5}>
          <Box
            borderWidth="1"
            bgColor={bg}
            boxShadow={"2xl"}
            p={5}
            minW={{ base: "xs", md: "xl" }}
          >
            <VStack>
              <Flex w={"100%"}>
                <Heading fontSize="4xl" p={5}>
                  BeatmapSet:{beatmapset_id}
                </Heading>
              </Flex>
              <Box
                borderWidth="1"
                bgColor={bg}
                boxShadow={"lg"}
                p={5}
                w={{ base: "xs", sm: "2xl", md: "4xl", xl: "6xl" }}
              >
                <Grid
                  templateColumns={{
                    base: "repeat(1, 1fr)",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                  }}
                  gap={4}
                >
                  {beatmaps.map((b, i) => (
                    <NextLink
                      key={`bPop-${i}`}
                      href={`/beatmaps/${b.beatmapset_id}/${b.beatmap_id}`}
                      passHref
                    >
                      <Link
                        _hover={{ textDecoration: "none", boxShadow: "2xl" }}
                      >
                        <BeatmapInfo
                          artist={b.artist}
                          title={b.title}
                          version={b.version}
                          mappedBy={b.creator}
                          imgSrc={`https://assets.ppy.sh/beatmaps/${b.beatmapset_id}/covers/cover.jpg`}
                          minified
                        />
                      </Link>
                    </NextLink>
                  ))}
                </Grid>
              </Box>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </>
  );
};

export default Index;
