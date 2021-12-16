import React, { ReactElement, ReactNode, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import {
  Layout as RMDLayout,
  Configuration,
  ConfigurableIcons,
  useLayoutNavigation,
  ArrowDropDownSVGIcon,
  CheckBoxSVGIcon,
  FileDownloadSVGIcon,
  KeyboardArrowDownSVGIcon,
  KeyboardArrowLeftSVGIcon,
  KeyboardArrowRightSVGIcon,
  MenuSVGIcon,
  NotificationsSVGIcon,
  RadioButtonCheckedSVGIcon,
  RemoveRedEyeSVGIcon,
  ArrowUpwardSVGIcon,
  CheckSVGIcon,
  useCrossFadeTransition,
} from 'react-md'

import LinkUnstyled from '../LinkUnstyled'
import navItems from './navItems'
import NavHeader from './NavHeader';

const icons: ConfigurableIcons = {
  back: <KeyboardArrowLeftSVGIcon />,
  checkbox: <CheckBoxSVGIcon />,
  dropdown: <ArrowDropDownSVGIcon />,
  download: <FileDownloadSVGIcon />,
  expander: <KeyboardArrowDownSVGIcon />,
  forward: <KeyboardArrowRightSVGIcon />,
  menu: <MenuSVGIcon />,
  notification: <NotificationsSVGIcon />,
  radio: <RadioButtonCheckedSVGIcon />,
  password: <RemoveRedEyeSVGIcon />,
  selected: <CheckSVGIcon />,
  sort: <ArrowUpwardSVGIcon />,
}

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps): ReactElement {
  const { pathname } = useRouter()
  const prevPathName = useRef(pathname)
  const { elementProps, transitionTo } = useCrossFadeTransition()
  useEffect(() => {
    if (pathname === prevPathName.current) {
      return
    }
    prevPathName.current = pathname
    transitionTo("enter")
  }, [pathname, transitionTo])
  return (
    <Configuration icons={icons}>
      <RMDLayout
        title="OsuClassy"
        phoneLayout="temporary"
        tabletLayout="temporary"
        landscapeTabletLayout="temporary"
        desktopLayout="full-height"
        appBarProps={{
          fixed: false,
        }}
        treeProps={{
          ...useLayoutNavigation(navItems, pathname, LinkUnstyled),
        }}
        mainProps={elementProps}
        navHeader={<NavHeader />}
      >
        {children}
      </RMDLayout>
    </Configuration>
  )
}
