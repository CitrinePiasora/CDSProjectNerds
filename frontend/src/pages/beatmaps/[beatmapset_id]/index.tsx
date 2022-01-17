import { GetServerSideProps } from "next";
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
import axios from "axios";

import { Container } from "../../../components/Container";
import BeatmapInfo from "../../../components/BeatmapInfo";
import { BeatmapResponse } from "../../../types";

interface Props {
  beatmaps: BeatmapResponse[];
  beatmapset_id: number;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const res = await axios({
      method: "get",
      url: `https://api.osuclassy.fauzanardh.me/beatmaps/${context.query.beatmapset_id}`,
    });
    return {
      props: {
        beatmaps: res.data.data.beatmaps,
        beatmapset_id: context.query.beatmapset_id,
      },
    };
  } catch (err) {
    return {
      notFound: true,
    };
  }
};

const Index = (props: Props) => {
  const bg = useColorModeValue("white", "gray.800");

  return (
    <>
      <Head>
        <title>
          OsuClassy - Beatmap Predictor | BeatmapSet:{props.beatmapset_id}
        </title>
        <meta
          name={"description"}
          content={`Set of beatmaps with the same beatmapset_id. BeatmapSet is ${props.beatmapset_id}`}
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
                  BeatmapSet:{props.beatmapset_id}
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
                  {props.beatmaps.map((b, i) => (
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
