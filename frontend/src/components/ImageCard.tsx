import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Heading,
  Box,
  Center,
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
  link: string;
  imgSrc: string;
}

export default function BeatmapInfo({
  title,
  artist,
  version,
  mappedBy,
  link,
  imgSrc,
}: Props) {
  const textColor = useColorModeValue("gray.500", "gray.400");
  return (
    <Center py={6}>
      <Box
        w={"full"}
        bg={useColorModeValue("white", "gray.800")}
        boxShadow={"lg"}
        rounded={"md"}
        overflow={"hidden"}
      >
        <Image h={"120px"} w={"full"} src={imgSrc} objectFit={"cover"} />

        <Box p={6}>
          <Stack spacing={0} align={"center"} mb={5}>
            <Heading fontSize={"2xl"} fontWeight={500} fontFamily={"body"}>
              {title}
            </Heading>
            <Text fontSize={"sm"} color={textColor}>
              [{version}]
            </Text>
            <Text color={textColor}>{artist}</Text>
            <Text fontWeight={600}>Mapped by {mappedBy}</Text>
          </Stack>

          <Button w={"full"} mt={8} rounded={"md"} colorScheme={"osu"}>
            <Link href={link} isExternal _hover={{ textDecoration: "none" }}>
              Visit Beatmap <ExternalLinkIcon mx="2px" />
            </Link>
          </Button>
        </Box>
      </Box>
    </Center>
  );
}
