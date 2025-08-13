import { useEffect, useState } from "react";

function App() {
  const [response, setResponse] = useState("");

  useEffect(() => {
    const fetchPing = () => {
      fetch("http://127.0.0.1:8000/ping")
        .then(res => res.json())
        .then(data => setResponse(data.message))
        .catch(err => console.error("Error:", err));
    };

    fetchPing(); // run immediately
    const interval = setInterval(fetchPing, 60_000); // run every 1 min

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-900 text-white">
      <h1 className="text-3xl font-bold">Backend says: {response}</h1>
    </div>
  );
}

export default App;
