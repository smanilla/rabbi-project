import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Home from "./Pages/Home/Home/Home";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Explore from "./Pages/Explore/Explore";
import Shop from "./Pages/Shop/Shop";
import Navigation from "./Pages/Shared/Navigation/Navigation";
import Footer from "./Pages/Shared/Footer/Footer";
import Login from "./Pages/Login/Login/Login";
import AuthProvider from "./contexts/AuthProvider/AuthProvider";
import Register from "./Pages/Login/Register/Register";
import Booking from "./Pages/Home/Booking/Booking";
import PrivateRoute from "./Pages/Login/PrivateRoute/PrivateRoute";
import Dashboard from "./Pages/Dashboard/Dashboard/Dashboard";
import About from "./Pages/About/About";
import Cart from "./Pages/Cart/Cart";
import Checkout from "./Pages/Checkout/Checkout";
import OrderSuccess from "./Pages/OrderSuccess/OrderSuccess";
import Wishlist from "./Pages/Wishlist/Wishlist";
import VerifyEmail from "./Pages/Login/VerifyEmail/VerifyEmail";
import ProductDetail from "./Pages/ProductDetail/ProductDetail";
import NotFound from "./Pages/NotFound/NotFound";
import Toast from "./components/Toast/Toast";

function App() {
  return (
    <div className="app-layout">
      <AuthProvider>
        <BrowserRouter>
          <Navigation></Navigation>
          <Toast />
          <main className="app-main">
          <Switch>
            <Route exact path="/">
              <Home></Home>
            </Route>
            <Route exact path="/home">
              <Home></Home>
            </Route>
            <Route exact path="/shop">
              <Shop></Shop>
            </Route>
            <Route path="/products/:id">
              <ProductDetail></ProductDetail>
            </Route>
            <Route exact path="/explore">
              <Explore></Explore>
            </Route>
            <Route exact path="/about">
              <About></About>
            </Route>
            <Route path="/login">
              <Login></Login>
            </Route>
            <PrivateRoute path="/booking/:bookingId">
              <Booking></Booking>
            </PrivateRoute>
            <Route path="/register">
              <Register></Register>
            </Route>
            <Route path="/verify-email">
              <VerifyEmail></VerifyEmail>
            </Route>
            <PrivateRoute path="/dashboard">
              <Dashboard></Dashboard>
            </PrivateRoute>
            <PrivateRoute path="/cart">
              <Cart></Cart>
            </PrivateRoute>
            <PrivateRoute path="/wishlist">
              <Wishlist></Wishlist>
            </PrivateRoute>
            <PrivateRoute path="/checkout">
              <Checkout></Checkout>
            </PrivateRoute>
            <PrivateRoute path="/order-success/:orderId">
              <OrderSuccess></OrderSuccess>
            </PrivateRoute>
            <Route exact path="*">
              <NotFound></NotFound>
            </Route>
          </Switch>
          </main>
          <Footer></Footer>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
