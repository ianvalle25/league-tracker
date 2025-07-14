import { useState } from "react";
import "./App.css";
import { FaMagnifyingGlass } from "react-icons/fa6";

function App() {
  const [riotId, setRiotId] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [matchData, setMatchData] = useState([]);

  const handleUserSubmit = async (e) => {
    e.preventDefault();

    try {
      // Fetch user info
      const resUser = await fetch("http://127.0.0.1:5000/summoner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ riotId }),
      });
      const userData = await resUser.json();
      setUserInfo(userData);

      // Fetch match history
      const resMatches = await fetch("http://127.0.0.1:5000/match-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ riotId }),
      });
      const matchData = await resMatches.json();
      setMatchData(matchData);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  return (
    <div className="w-screen min-h-screen bg-[#352F44] text-white">
      <div className="flex flex-col items-center justify-center p-6">
        <h1 className="font-bold py-10 text-4xl">Tilted</h1>
        <form onSubmit={handleUserSubmit} className="flex gap-2">
          <input
            placeholder="Example#NA1"
            value={riotId}
            onChange={(e) => setRiotId(e.target.value)}
            className="px-4 py-2 rounded-md bg-[#5C5470] text-white w-64"
          />
          <button type="submit" className="p-2 bg-[#B9B4C7] text-black rounded-md">
            <FaMagnifyingGlass />
          </button>
        </form>

        {userInfo && (
          <div className="mt-10 text-left w-full max-w-2xl">
            <h2 className="text-2xl font-semibold mb-2">Summoner Info</h2>
            <pre className="bg-[#5C5470] p-4 rounded">{JSON.stringify(userInfo, null, 2)}</pre>
          </div>
        )}

{matchData.length > 0 && (
  <div className="mt-10 space-y-8 max-w-4xl w-full">
    {matchData.map((match, index) => (
      <div key={index} className="bg-[#5C5470] p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Match {index + 1} - {match.gameMode}</h2>
        <h2 className="text-xl font-semibold mb-2">{match.queueType}</h2>
        <p className="mb-2">Duration: {Math.floor(match.gameDuration / 60)}m {match.gameDuration % 60}s</p>

        {/* Player Summary */}
        <div className="mb-4">
          <h3 className="text-lg font-bold">Your Performance</h3>
          <p>
            <strong>{match.player.summonerName}</strong> played <strong>{match.player.championName}</strong> | 
            K/D/A: {match.player.kills}/{match.player.deaths}/{match.player.assists} | 
            Result: {match.player.win ? "Victory" : "Defeat"}
          </p>
        </div>

        {/* Teams */}
        <div className="grid grid-cols-2 gap-6">
          {/* Blue Team */}
          <div>
            <h4 className="font-semibold text-blue-300 mb-1">Blue Team</h4>
            <ul className="space-y-1">
              {match.blueTeam.map((player, i) => (
                <li key={i}>
                  {player.summonerName} ({player.championName}) - {player.kills}/{player.deaths}/{player.assists}
                </li>
              ))}
            </ul>
          </div>

          {/* Red Team */}
          <div>
            <h4 className="font-semibold text-red-300 mb-1">Red Team</h4>
            <ul className="space-y-1">
              {match.redTeam.map((player, i) => (
                <li key={i}>
                  {player.summonerName} ({player.championName}) - {player.kills}/{player.deaths}/{player.assists}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    ))}
  </div>
)}
      </div>
    </div>
  );
}

export default App;
