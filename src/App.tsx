import { BrowserRouter, Route, Routes } from "react-router-dom";
import Gate from "./pages/Gate";
import VillageMap from "./pages/VillageMap";
import AppShell from "./components/shell/AppShell";
import TreePage from "./pages/TreePage";
import PersonProfile from "./pages/PersonProfile";
import SearchPage from "./pages/SearchPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Gate />} />
        <Route element={<AppShell />}>
          <Route path="/ban-do" element={<VillageMap />} />
          <Route path="/cay-pha-he" element={<TreePage />} />
          <Route path="/tim-kiem" element={<SearchPage />} />
          <Route path="/ho-so/:personId" element={<PersonProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
