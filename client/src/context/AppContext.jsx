import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY;
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchRecommendations, setSearchRecommendations] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  //fetch seller status
 const fetchSeller = async () => {
  try {
    const { data } = await axios.post("/api/seller/is-auth");

    console.log("Seller Auth Response:", data);

    if (data.success) {
      setIsSeller(true);
    } else {
      setIsSeller(false);
    }
  } catch (error) {
    console.log("Seller Auth Error:", error.response?.data);
    setIsSeller(false);
  }
};
  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/user/is-auth");

      console.log("USER is-auth:", data);

      if (data.success) {
        setUser(data.user);
        setCartItems(data.user.cartItems);
      }
    } catch (error) {
      console.log(error);
      setUser(null);
    }
  };


  //fetch all products
  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("/api/product/list");
      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const searchProducts = async (query) => {
    try {
      if (!query.trim()) {
        setSearchRecommendations([]);
        return;
      }

      setSearchLoading(true);

      const { data } = await axios.get("/api/product/search", {
        params: {
          q: query,
        },
      });

      if (data.success) {
        setSearchRecommendations(data.products);
      } else {
        setSearchRecommendations([]);
      }
    } catch (error) {
      console.log(error);

      setSearchRecommendations([]);
    } finally {
      setSearchLoading(false);
    }
  };

  //Add product to cart
  const addToCart = (itemId) => {
    let cartData = structuredClone(cartItems);

    if (cartData[itemId]) {
      cartData[itemId] += 1;
    } else {
      cartData[itemId] = 1;
    }
    setCartItems(cartData);
    toast.success("Added to Cart");
  };

  //update cart item quantity
  const updateCartItem = (itemId, quantity) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId] = quantity;
    setCartItems(cartData);
    toast.success("Cart Updated");
  };
  // Remove product from cart
  const removeFromCart = (itemId) => {
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      cartData[itemId] -= 1;
      if (cartData[itemId] === 0) {
        delete cartData[itemId];
      }
    }
    toast.success("Removed From Cart");
    setCartItems(cartData);
  };

  // cart item count
  const getCartCount = () => {
    let totalCount = 0;
    for (const item in cartItems) {
      totalCount += cartItems[item];
    }
    return totalCount;
  };

  // cart total amount
  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      if (cartItems[items] > 0) {
        totalAmount += itemInfo.offerPrice * cartItems[items];
      }
    }
    return Math.floor(totalAmount * 100) / 100;
  };

  useEffect(() => {
    fetchUser();
    fetchSeller();
    fetchProducts();
  }, []);

  useEffect(() => {

    const timer = setTimeout(() => {

      searchProducts(searchQuery);

    }, 300);

    return () => clearTimeout(timer);

  }, [searchQuery]);

  //update database cart items
  useEffect(() => {
    const updateCart = async () => {
      try {
        const { data } = await axios.post("/api/cart/update", { cartItems });
        if (!data.success) {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.message);
      }
    };
    if (user) {
      updateCart();
    }
  }, [cartItems]);

  const value = {
    navigate,
    user,
    setUser,
    setIsSeller,
    isSeller,
    showUserLogin,
    setShowUserLogin,
    products,
    currency,
    addToCart,
    updateCartItem,
    removeFromCart,
    cartItems,
    searchQuery,
    setSearchQuery,
    searchRecommendations,
    searchLoading,
    searchProducts,
    getCartAmount,
    getCartCount,
    axios,
    fetchProducts,
    setCartItems,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
