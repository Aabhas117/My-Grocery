import React, { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import { X } from "lucide-react";

const Navbar = () => {
  const [open, setOpen] = React.useState(false);

  const searchContainerRef = useRef(null);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const {
    user,
    setUser,
    axios,
    setShowUserLogin,
    navigate,

    searchQuery,
    setSearchQuery,

    searchRecommendations,
    searchLoading,

    getCartCount,
  } = useAppContext();

  const logout = async () => {
    try {
      const { data } = await axios.get("/api/user/logout");
      if (data.success) {
        toast.success(data.message);
        setUser(null);
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleProductClick = (product) => {
    setShowSearchDropdown(false);
    setHighlightedIndex(-1);
    setSearchQuery("");

    navigate(`/products/${product.category}/${product._id}`);
  };

  const handleSearchKeyDown = (e) => {

    if (!showSearchDropdown) return;

    switch (e.key) {

      case "ArrowDown":

        e.preventDefault();

        setHighlightedIndex((prev) =>
          prev < searchRecommendations.length - 1
            ? prev + 1
            : 0
        );

        break;

      case "ArrowUp":

        e.preventDefault();

        setHighlightedIndex((prev) =>
          prev > 0
            ? prev - 1
            : searchRecommendations.length - 1
        );

        break;

      case "Enter":

        if (highlightedIndex >= 0) {

          e.preventDefault();

          handleProductClick(
            searchRecommendations[highlightedIndex]
          );

        }

        break;

      case "Escape":

        setShowSearchDropdown(false);
        setHighlightedIndex(-1);

        break;

      default:
        break;
    }

  };

  useEffect(() => {

    const handleClickOutside = (event) => {

      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setShowSearchDropdown(false);
      }

    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

    };

  }, []);

  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-300 bg-white relative transition-all">
      <NavLink to="/" onClick={() => setOpen(false)}>
        <img className="h-9" src={assets.logo} alt="logo" />
      </NavLink>

      {/* Desktop Menu */}
      <div className="hidden sm:flex items-center gap-8">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/products">All Product</NavLink>
        <NavLink to="/">Contact</NavLink>

        <div
          ref={searchContainerRef}
          className="hidden lg:flex relative flex-col w-96"
        >
          <div className="flex items-center text-sm gap-2 border border-gray-300 px-3 rounded-full bg-white">
            <input
              value={searchQuery}
              onKeyDown={handleSearchKeyDown}
              onFocus={() => {
                if (
                  searchQuery.trim().length > 0 ||
                  searchRecommendations.length > 0
                ) {
                  setShowSearchDropdown(true);
                }
              }}
              onChange={(e) => {
                const value = e.target.value;

                setSearchQuery(value);

                setHighlightedIndex(-1);

                setShowSearchDropdown(value.trim().length > 0);
              }}
              className="py-2 w-full bg-transparent outline-none placeholder-gray-500"
              type="text"
              placeholder="Search products..."
            />

            <img
              src={assets.search_icon}
              alt="search"
              className="w-4 h-4"
            />
          </div>

          {showSearchDropdown && (
            <div className="absolute top-12 w-full bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">

              {/* Loading */}

              {searchLoading && (
                <div className="flex items-center justify-center gap-3 py-8">

                  <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>

                  <span className="text-sm text-gray-500">
                    Searching...
                  </span>

                </div>
              )}

              {/* Results */}

              {!searchLoading &&
                searchRecommendations.length > 0 && (

                  <div className="max-h-96 overflow-y-auto">

                    {searchRecommendations.map((product, index) => (

                      <button
                        key={product._id}
                        onClick={() => handleProductClick(product)}
                        className={`w-full px-4 py-3 flex items-center gap-3 text-left transition
${highlightedIndex === index
                            ? "bg-green-100"
                            : "hover:bg-green-50"
                          }`}
                      >

                        <img
                          src={
                            product.images?.length
                              ? product.images[0]
                              : assets.search_icon
                          }
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                        />

                        <div className="flex-1 min-w-0">

                          <p className="font-medium truncate">
                            {product.name}
                          </p>

                          <p className="text-xs text-gray-500">
                            {product.category}
                          </p>

                        </div>

                        <div className="flex flex-col items-end ml-2">

                          <span className="font-semibold text-green-600">
                            ₹{product.offerPrice}
                          </span>

                          <span className="text-xs text-gray-400 line-through">
                            ₹{product.price}
                          </span>

                        </div>

                      </button>

                    ))}

                  </div>

                )}

              {/* Empty State */}

              {!searchLoading &&
                searchQuery.trim() &&
                searchRecommendations.length === 0 && (

                  <div className="py-8 flex flex-col items-center">

                    <img
                      src={assets.search_icon}
                      className="w-8 opacity-40"
                      alt=""
                    />

                    <p className="mt-3 text-gray-500 font-medium">
                      No products found
                    </p>

                    <p className="text-xs text-gray-400">
                      Try another keyword
                    </p>

                  </div>

                )}

            </div>
          )}

        </div>

        <div
          onClick={() => navigate("/cart")}
          className="relative cursor-pointer"
        >
          <img
            src={assets.nav_cart_icon}
            alt="cart"
            className="w-6 opacity-80"
          />

          {/* <button className="absolute -top-2 -right-3 text-xs text-white bg-primary  w-[18px] h-[18px] rounded-full">
            {getCartCount()}
          // </button> */}
          <button className="absolute -top-2 -right-2 min-w-5 h-5 px-1 flex items-center justify-center text-[10px] font-medium text-white bg-green-500 rounded-full">
            {getCartCount()}
          </button>
        </div>

        {!user ? (
          <button
            onClick={() => setShowUserLogin(true)}
            className="cursor-pointer px-8 py-2 bg-primary hover:bg-primary-dull transition text-white rounded-full"
          >
            Login
          </button>
        ) : (
          <div className="relative group">
            <img src={assets.profile_icon} alt="profile" className="w-10" />
            <ul className="hidden group-hover:block absolute top-10 right-0 bg-white shadow border border-gray-200 py-2.5 w-30 rounded-md text-sm z-40">
              <li
                className="p-1.5 pl-3 hover:bg-primary/10 cursor-pointer"
                onClick={() => navigate("my-orders")}
              >
                My Orders
              </li>

              <li
                className="p-1.5 pl-3 hover:bg-primary/10 cursor-pointer"
                onClick={() => navigate("/seller")}
              >
                Seller
              </li>

              <li
                className="p-1.5 pl-3 hover:bg-primary/10 cursor-pointer"
                onClick={logout}
              >
                Logout
              </li>
            </ul>
          </div>
        )}
      </div>

      <div className="flex items-center gap-6 sm:hidden">
        <div
          onClick={() => navigate("/cart")}
          className="relative cursor-pointer"
        >
          <img
            src={assets.nav_cart_icon}
            alt="cart"
            className="w-6 opacity-80"
          />

          <button className="absolute -top-2 -right-3 text-xs text-white bg-primary  w-[18px] h-[18px] rounded-full">
            {getCartCount()}
          </button>
        </div>
        <button
          onClick={() => (open ? setOpen(false) : setOpen(true))}
          aria-label="Menu"
          className=""
        >
          <img src={assets.menu_icon} alt="menu" />
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div
          className={`${open ? "flex" : "hidden"} absolute top-0 60px left-0 w-full bg-white shadow-md py-4 flex-col items-start gap-2 px-5 text-sm md:hidden z-10`}
        >
          <button onClick={()=> setOpen(false)}>
            <X size={18} />  
          </button>
          <NavLink to="/" onClick={() => setOpen(false)}>
            Home
          </NavLink>
          <NavLink to="/products" onClick={() => setOpen(false)}>
            All Product
          </NavLink>
          {user && (
            <NavLink to="/products" onClick={() => setOpen(false)}>
              My Orders
            </NavLink>
          )}
          <NavLink to="/" onClick={() => setOpen(false)}>
            Contact
          </NavLink>

          <NavLink to="/seller" onClick={() => setOpen(false)}>
            Seller
          </NavLink>

          {!user ? (
            <button
              onClick={() => {
                setOpen(false);
                setShowUserLogin(true);
              }}
              className="cursor-pointer px-6 py-2 mt-2 bg-primary hover:bg-primary-dull transition text-white rounded-full text-sm"
            >
              Login
            </button>
          ) : (
            <button
              onClick={logout}
              className="cursor-pointer px-6 py-2 mt-2 bg-primary hover:bg-primary-dull transition text-white rounded-full text-sm"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
