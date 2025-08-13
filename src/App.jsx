import { useEffect, useState } from "react";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import { store } from "./store/store";
import { Provider } from 'react-redux';
//import Sidebar from "./components/Sidebar";

function App() {
  const [response, setResponse] = useState("");

  const fetchPing = () => {
    fetch("http://127.0.0.1:8000/ping")
      .then(res => res.json())
      .then(data => setResponse(data.message))
      .catch(err => console.error("Error:", err));
  };

  useEffect(() => {
    fetchPing(); // run immediately
    const interval = setInterval(fetchPing, 60_000); // run every 1 min

    return () => clearInterval(interval);
  }, []);

  return (<>  
    <Provider store={store}>
  <div className="min-h-screen bg-blue-900 text-white">
      {/* Navbar at top */}
      <Home />
      {/* <Sidebar/> */}

      {/* Centered content */}
      {/* <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <h1 className="text-3xl font-bold">
          Backend says: {response}
        </h1>
      </div> */}
    </div>
    {/* <div className="min-h-screen bg-blue-900 text-white"></div> */}
    </Provider>
  </>);
}

export default App;
