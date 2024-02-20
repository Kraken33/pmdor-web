import jss from "jss";
import { MainPage } from "./pages/main/Main";

jss.createStyleSheet({
  "@global": {
    body: {
      margin: "0px !important"
    }
  }
}).attach();

function App() {
  return (
    <>
      <MainPage />
    </>
  )
}

export default App
