import { BrowserRouter, Route, Routes } from "react-router-dom";
import Gate from "./pages/Gate";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Gate />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
