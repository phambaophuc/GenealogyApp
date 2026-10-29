import { BrowserRouter, Route, Routes } from "react-router-dom";
import Gate from "./pages/Gate";
import VillageMap from "./pages/VillageMap";
import AppShell from "./components/shell/AppShell";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Gate />} />
        <Route element={<AppShell />}>
          <Route path="/ban-do" element={<VillageMap />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
