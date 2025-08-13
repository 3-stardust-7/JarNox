import { useEffect, useState } from "react";
import Home from "./pages/Home";
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
  <div >     
      <Home />      
    </div>
    </Provider>
  </>);
}

export default App;
