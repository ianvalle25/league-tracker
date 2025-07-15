import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaMagnifyingGlass } from "react-icons/fa6";
import "./Home.css"

function Home() {
    const [freeChampions, setFreeChampions] = useState([]);
    const [riotId, setRiotId] = useState("");
    const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("http://127.0.0.1:5000/champ-rotation", {
        method: "POST",
      });
      const data = await res.json();
      const ids = data.freeChampionIds;

      const versionRes = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
      const [latestVersion] = await versionRes.json();

      const champRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/champion.json`);
      const champJson = await champRes.json();
      const allChamps = champJson.data;

      const mapped = Object.values(allChamps).filter(champ => ids.includes(Number(champ.key)));
      setFreeChampions(mapped);
    };

    fetchData();
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();

    sessionStorage.setItem("riotId", riotId);
    navigate("/player");
  };

  return (
    <div className="min-h-screen bg-[#352F44] text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-8">Tilted</h1>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          placeholder="Example#NA1"
          value={riotId}
          onChange={(e) => setRiotId(e.target.value)}
          className="px-4 py-2 rounded bg-[#5C5470] text-white w-64"
        />
        <button type="submit" className="p-2 bg-[#B9B4C7] text-black rounded-md">
          <FaMagnifyingGlass />
        </button>
      </form>
      <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Free Champion Rotation</h2>
    </div>
      <div
        className="slider"
        style={{
        "--width": "200px",
        "--height": "370px",
        "--quantity": freeChampions.length,
     }}
    >
    <div className="list">
        {[...freeChampions, ...freeChampions].map((champ, index) => (
        <div div key={`${champ.id}-${index}`} className="item">
            <img
            src={`https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champ.id}_0.jpg`}
            alt={champ.name}
            className="rounded-md"
            />
        </div>
        ))}
        </div>
    </div>

    </div>
    
    );
}

export default Home;