import { useEffect, useState } from "react";

function App() {
  const [data, setData] = useState(null);
  const [riotId, setriotId] = useState("");

  const handleUserSubmit = async (e) => {
    e.preventDefault();

   try {
     const res = await fetch("http://localhost:5000/summoner", {
        method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ riotId: riotId })
      });
      const data = await res.json();
      setData(data);
    } catch (err) {
     console.error("Error:", err);
    }
  };

  return (
    <div>
      <form onSubmit={handleUserSubmit}>
        <input
          placeholder="Username + ID"
          value={riotId}
          onChange={(e) => setriotId(e.target.value)}
        >
        </input>
        <button type="submit">Search</button>
      </form>
      <h1>Tilted</h1>
      {data ? (
  <pre>{JSON.stringify(data, null, 2)}</pre>
      ) : (
       <p>Enter a Riot ID and search.</p>
      )}
       </div>
   );
}

export default App;