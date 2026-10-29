import { searchPeople } from "./src/services/api";
(async () => {
  const res = await searchPeople("a", 5);
  console.log("count", res.length);
  console.log(res.map((p) => p.fullName));
})();