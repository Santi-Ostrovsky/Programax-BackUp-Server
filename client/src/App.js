import { Route, Routes } from "react-router-dom";
// import { PayPalScriptProvider } from "@paypal/react-paypal-js";
// import { YOUR_CLIENT_ID } from "./Components/Paypal/ClientID";

//componentes
import Details from "./Components/Details/Details";
import Home from "./Components/Home/Home";
import Users from "./Components/UserProfile/Users";
import Work from "./Components/Work/Work";
import DevUsersCreate from "./Components/DevUsersCreate/DevUsersCreate";
import Profile from "./Components/Login/UserProfile/Profile";
import Stripe from "./Components/Stripe/Stripe";
import UserProfile from "./Components/UserProfile/UserProfile";
//import About from "./Components/About/About"
import Contracts from "./Components/Contracts/Contracts";
import Error404 from "./Components/error404/error404";

function App() {
  return (
    <>
      <Routes>
        <Route path="/checkout" element={<Stripe />}></Route>
        {/* <PayPalScriptProvider options={{ "client-id": YOUR_CLIENT_ID }} /> */}
        <Route path="/" element={<Home />} />
        <Route path="/work/details/:id" element={<Details />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/work" element={<Work />} />
        <Route path="/create" element={<DevUsersCreate />} />
        {/* <Route path="/users" element={<Users />} /> */}
        {/* <Route path="/contratos" element={<Contracts/>}></Route> */}
        **<Route path="*" element={<Error404 />}></Route>**
      </Routes>
    </>
  );
}

export default App;
