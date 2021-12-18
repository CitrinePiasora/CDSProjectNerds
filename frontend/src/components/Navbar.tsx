import NextLink from "next/link";
import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Icon,
  Link,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure,
  useColorMode,
} from "@chakra-ui/react";
import {
  HamburgerIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  MoonIcon,
  SunIcon,
} from "@chakra-ui/icons";

export const NavBar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onToggle } = useDisclosure();

  const mainColor = useColorModeValue("osu.600", "osu.300");
  return (
    <Box width={"100%"}>
      <Flex
        bg={useColorModeValue("white", "gray.800")}
        color={useColorModeValue("gray.600", "white")}
        minH={"60px"}
        py={{ base: 2 }}
        px={{ base: 6, md: 12 }}
        borderBottom={1}
        borderStyle={"solid"}
        borderColor={useColorModeValue("gray.200", "gray.900")}
        align={"center"}
      >
        <Flex
          flex={{ base: 1, md: "auto" }}
          ml={{ base: -2 }}
          display={{ base: "flex", md: "none" }}
        >
          <IconButton
            onClick={onToggle}
            icon={
              isOpen ? (
                <CloseIcon color={mainColor} w={3} h={3} />
              ) : (
                <HamburgerIcon color={mainColor} w={5} h={5} />
              )
            }
            variant={"ghost"}
            aria-label={"Toggle Navigation"}
          />
        </Flex>
        <Flex flex={{ base: 1 }} justify={{ base: "center", md: "start" }}>
          <Text
            textAlign={useBreakpointValue({
              base: "center",
              md: "left",
            })}
            fontSize={"lg"}
            fontFamily={"heading"}
            color={useColorModeValue("gray.800", "white")}
          >
            OsuClassy
          </Text>

          <Flex display={{ base: "none", md: "flex" }} ml={10}>
            <DesktopNav />
          </Flex>
        </Flex>

        <Stack
          flex={{ base: 1, md: 0 }}
          justify={"flex-end"}
          direction={"row"}
          spacing={6}
        >
          <Button
            onClick={toggleColorMode}
            colorScheme={"osu"}
            aria-label={"darkmode-toggle"}
          >
            {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
          </Button>
        </Stack>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav />
      </Collapse>
    </Box>
  );
};

const DesktopNav = () => {
  return (
    <Stack direction={"row"} spacing={4}>
      {NAV_ITEMS.map((navItem) => (
        <Box key={navItem.label}>
          <Popover trigger={"hover"} placement={"bottom-start"}>
            <PopoverTrigger>
              <Box>
                <NextLink href={navItem.href ?? "#"} passHref>
                  <Link
                    p={2}
                    fontSize={"sm"}
                    fontWeight={500}
                    color={useColorModeValue("osu.500", "osu.200")}
                    _hover={{
                      textDecoration: "none",
                      color: useColorModeValue("osu.600", "osu.300"),
                    }}
                  >
                    {navItem.label}
                  </Link>
                </NextLink>
              </Box>
            </PopoverTrigger>

            {navItem.children && (
              <PopoverContent
                border={0}
                boxShadow={"xl"}
                bg={useColorModeValue("white", "gray.800")}
                p={4}
                rounded={"xl"}
                minW={"sm"}
              >
                <Stack>
                  {navItem.children.map((child) => (
                    <DesktopSubNav key={child.label} {...child} />
                  ))}
                </Stack>
              </PopoverContent>
            )}
          </Popover>
        </Box>
      ))}
    </Stack>
  );
};

const DesktopSubNav = ({ label, href, subLabel }: NavItem) => {
  const mainHoverColor = useColorModeValue("osu.600", "osu.300");
  return (
    <NextLink href={href} passHref>
      <Link
        role={"group"}
        display={"block"}
        p={2}
        rounded={"md"}
        _hover={{ bg: useColorModeValue("pink.50", "gray.900") }}
      >
        <Stack direction={"row"} align={"center"}>
          <Box>
            <Text
              transition={"all .3s ease"}
              _groupHover={{ color: mainHoverColor }}
              fontWeight={500}
            >
              {label}
            </Text>
            <Text fontSize={"sm"}>{subLabel}</Text>
          </Box>
          <Flex
            transition={"all .3s ease"}
            transform={"translateX(-10px)"}
            opacity={0}
            _groupHover={{
              opacity: "100%",
              transform: "translateX(0)",
            }}
            justify={"flex-end"}
            align={"center"}
            flex={1}
          >
            <Icon color={mainHoverColor} w={5} h={5} as={ChevronRightIcon} />
          </Flex>
        </Stack>
      </Link>
    </NextLink>
  );
};

const MobileNav = () => {
  return (
    <Stack
      bg={useColorModeValue("white", "gray.800")}
      p={4}
      display={{ md: "none" }}
    >
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
    </Stack>
  );
};

const MobileNavItem = ({ label, children, href }: NavItem) => {
  const { isOpen, onToggle } = useDisclosure();
  const linkColor = useColorModeValue("osu.500", "osu.200");
  const linkHoverColor = useColorModeValue("osu.600", "osu.300");

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Flex py={2} justify={"space-between"} align={"center"}>
        <NextLink href={href ?? "#"} passHref>
          <Link
            _hover={{
              textDecoration: "none",
              color: linkHoverColor,
            }}
          >
            <Text fontWeight={600} color={linkColor}>
              {label}
            </Text>
          </Link>
        </NextLink>
        {children && (
          <Icon
            color={linkColor}
            as={ChevronDownIcon}
            transition={"all .25s ease-in-out"}
            transform={isOpen ? "rotate(180deg)" : ""}
            w={6}
            h={6}
          />
        )}
      </Flex>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: "0!important" }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={"solid"}
          borderColor={useColorModeValue("gray.200", "gray.700")}
          align={"start"}
        >
          {children &&
            children.map((child) => (
              <NextLink key={child.label} href={child.href} passHref>
                <Link
                  py={2}
                  color={linkColor}
                  _hover={{
                    textDecoration: "none",
                    color: linkHoverColor,
                  }}
                >
                  {child.label}
                </Link>
              </NextLink>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  );
};

interface NavItem {
  label: string;
  subLabel?: string;
  children?: Array<NavItem>;
  href?: string;
}

const NAV_ITEMS: Array<NavItem> = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Beatmaps",
    href: "/beatmaps",
    children: [
      {
        label: "Popular",
        subLabel: "Browse the most visited beatmaps",
        href: "/beatmaps/popular",
      },
      {
        label: "Recent",
        subLabel: "Browse the recently predicted beatmaps",
        href: "/beatmaps/recent",
      },
    ],
  },
  {
    label: "Predict",
    href: "/predict",
  },
];
