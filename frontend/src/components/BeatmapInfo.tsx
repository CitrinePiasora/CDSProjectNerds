import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Heading,
  Box,
  Image,
  Text,
  Stack,
  Button,
  useColorModeValue,
  Link,
} from "@chakra-ui/react";

interface Props {
  title: string;
  artist: string;
  version: string;
  mappedBy: string;
  imgSrc: string;
  link?: string;
  minified?: boolean;
}

export default function BeatmapInfo({
  title,
  artist,
  version,
  mappedBy,
  link,
  imgSrc,
  minified,
}: Props) {
  const textColor = useColorModeValue("gray.500", "gray.400");
  const imageBrightness = useColorModeValue(
    "brightness(100%)",
    "brightness(75%)"
  );
  return (
    <Box
      w={"full"}
      bg={useColorModeValue("white", "gray.800")}
      boxShadow={"lg"}
      rounded={"md"}
      overflow={"hidden"}
    >
      <Image
        h={"120px"}
        w={"full"}
        src={imgSrc}
        objectFit={"cover"}
        filter={imageBrightness}
      />

      <Box p={6}>
        <Stack spacing={0} align={"center"}>
          <Heading
            fontSize={minified ? "lg" : "2xl"}
            fontWeight={500}
            fontFamily={"body"}
            isTruncated
          >
            {title}
          </Heading>
          <Text fontSize={"sm"} color={textColor} isTruncated>
            [{version}]
          </Text>
          <Text color={textColor} fontSize={minified ? "sm" : ""} isTruncated>
            by {artist}
          </Text>
          <Text fontWeight={600} fontSize={minified ? "sm" : ""} isTruncated>
            Mapped by {mappedBy}
          </Text>
        </Stack>

        {!minified && (
          <Link
            href={link ?? "#"}
            isExternal
            _hover={{ textDecoration: "none" }}
          >
            <Button
              w={"full"}
              mt={8}
              rounded={"md"}
              colorScheme={"osu"}
              aria-label={"visit-beatmap"}
            >
              Visit Beatmap <ExternalLinkIcon mx="2px" />
            </Button>
          </Link>
        )}
      </Box>
    </Box>
  );
}
