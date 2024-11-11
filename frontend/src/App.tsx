import { BrowserRouter, Route, Routes } from "react-router-dom";
import Register from "./pages/register/register";
import Login from "./pages/login/Login";

const App = () => (
  <div data-mode="light">
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/main" />
      </Routes>
    </BrowserRouter>
  </div>
);

export default App;
