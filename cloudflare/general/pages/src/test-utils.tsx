import React from "react"
import { ReactElement, ReactNode } from "react"
import { render, RenderOptions } from "@testing-library/react"
import { ChakraProvider } from "@chakra-ui/react"
import theme from './theme';

const AllProviders = ({ children }: { children?: ReactNode }) => (
  <ChakraProvider theme={theme}>{children}</ChakraProvider>
)

const customRender = (ui: ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: AllProviders, ...options })

export { customRender as render }
