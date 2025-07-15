import { useEffect, useState } from "react";

function PlayerPage() {
  const [userInfo, setUserInfo] = useState(null);
  const [matchData, setMatchData] = useState([]);

  const riotId = sessionStorage.getItem("riotId");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resUser = await fetch("http://127.0.0.1:5000/summoner", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ riotId }),
        });
        const userData = await resUser.json();
        setUserInfo(userData);

        const resMatches = await fetch("http://127.0.0.1:5000/match-history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ riotId }),
        });
        const matchData = await resMatches.json();
        setMatchData(matchData);
      } catch (err) {
        console.error("Fetch failed:", err);
      }
    };

    if (riotId) fetchData();
  }, [riotId]);

  return (
    <div className="min-h-screen bg-[#352F44] text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Player Overview</h1>

      {userInfo && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-2">Summoner Info</h2>
          <pre className="bg-[#5C5470] p-4 rounded">{JSON.stringify(userInfo, null, 2)}</pre>
        </div>
      )}

      {matchData.length > 0 && (
        <div className="space-y-6">
          {matchData.map((match, index) => (
            <div key={index} className="bg-[#5C5470] p-4 rounded shadow">
              <h2 className="text-lg font-bold">Match {index + 1} - {match.gameMode}</h2>
              <p className="mb-2">Queue: {match.queueType}</p>
              <p>Duration: {Math.floor(match.gameDuration / 60)}m {match.gameDuration % 60}s</p>

              <div className="my-4">
                <h3 className="text-md font-semibold">Your Performance</h3>
                <p>
                  {match.player.summonerName} ({match.player.championName}) – 
                  {match.player.kills}/{match.player.deaths}/{match.player.assists} – 
                  {match.player.win ? "Win" : "Loss"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-blue-300 font-semibold mb-1">Blue Team ({match.killsBlue} kills)</h4>
                  {match.blueTeam.map((p, i) => (
                    <div key={i}>{p.summonerName} – {p.championName} – {p.kills}/{p.deaths}/{p.assists}</div>
                  ))}
                </div>
                <div>
                  <h4 className="text-red-300 font-semibold mb-1">Red Team ({match.killsRed} kills)</h4>
                  {match.redTeam.map((p, i) => (
                    <div key={i}>{p.summonerName} – {p.championName} – {p.kills}/{p.deaths}/{p.assists}</div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PlayerPage;