import { useState } from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import NextLink from "next/link";

import {
  Box,
  Flex,
  Grid,
  Heading,
  Link,
  useColorModeValue,
  VStack,
  Text,
} from "@chakra-ui/react";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";

import BeatmapInfo from "../../components/BeatmapInfo";
import { BeatmapResponse } from "../../types";
import { Container } from "../../components/Container";

interface Props {
  beatmaps: BeatmapResponse[];
  hasMoreItems: boolean;
  currentPage: number;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const res = await axios.get(
      `http://api.osuclassy.fauzanardh.me/beatmaps/recent?page=1&limit=6`
    );
    return {
      props: {
        beatmaps: res.data.data.beatmaps,
        hasMoreItems: res.data.data.beatmaps.length > 0,
        currentPage: 2,
      },
    };
  } catch (err) {
    return {
      notFound: true,
    };
  }
};

const BMPopular = (props: Props) => {
  // ChakraUI colors
  const bg = useColorModeValue("white", "gray.800");

  const [beatmaps, setBeatmaps] = useState<BeatmapResponse[]>(props.beatmaps);
  const [hasMoreItems, setHasMoreItems] = useState(props.hasMoreItems);
  const [currentPage, setCurrentPage] = useState(props.currentPage);

  const fetchData = async () => {
    try {
      const res = await axios.get(
        `http://api.osuclassy.fauzanardh.me/beatmaps/recent?page=${currentPage}&limit=6`
      );
      setBeatmaps([...beatmaps, ...res.data.data.beatmaps]);
      setHasMoreItems(res.data.data.beatmaps.length > 0);
      setCurrentPage(currentPage + 1);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <Head>
        <title>OsuClassy - Beatmap Predictor | Recent Beatmaps</title>
        <meta
          name={"description"}
          content={
            "Recently uploaded beatmaps on OsuClassy. Find out what most recently uploaded beatmaps are on OsuClassy."
          }
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
                  Recently Uploaded
                </Heading>
              </Flex>
              <Box
                borderWidth="1"
                bgColor={bg}
                boxShadow={"lg"}
                p={5}
                w={{ base: "xs", sm: "2xl", md: "4xl", xl: "6xl" }}
              >
                <InfiniteScroll
                  dataLength={beatmaps.length}
                  next={() => fetchData()}
                  hasMore={hasMoreItems}
                  loader={<Text>Loading...</Text>}
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
                        key={`beatmaps-${i}`}
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
                </InfiniteScroll>
              </Box>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </>
  );
};

export default BMPopular;
