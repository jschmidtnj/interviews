import { ColorModeScript } from "@chakra-ui/react"
import React from "react"
import ReactDOM from "react-dom"
import { App } from "./App"
import * as serviceWorker from "./serviceWorker"

ReactDOM.render(
  <>
    <ColorModeScript />
    <App />
  </>,
  document.getElementById("root"),
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
// TODO - check if this is working
serviceWorker.register()
