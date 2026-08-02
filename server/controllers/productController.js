import { v2 as cloudinary } from "cloudinary";
import Product from "../models/Product.js";
import cppClient from "../utils/cppClient.js";

//get product : /api/product/add
export const addProduct = async (req, res) => {
  try {
    let productData = JSON.parse(req.body.productData);
    const images = req.files;

    let imageUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
        });
        return result.secure_url;
      }),
    );
    await Product.create({
      ...productData,
      images: imageUrl,
    });

    res.json({ success: true, message: "Product Added" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//get product : /api/product/list
export const productList = async (req, res) => {
  try {
    const products = await Product.find({});
    await cppClient.post("/initialize", {
      products,
    });
    res.json({ success: true, products });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};


export const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.json({
        success: true,
        products: [],
      });
    }

    const { data } = await cppClient.get("/search", {
      params: {
        query: q,
      },
    });

    return res.json({
      success: true,
      products: data.products,
    });

  } catch (error) {
    console.log(error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// get single product : /api/product/id
export const productById = async (req, res) => {
  try {
    const { id } = req.body;
    const product = await Product.findById(id);
    res.json({ success: true, product });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//change product inStock : /api/product/stock
export const changeStock = async (req, res) => {
  try {
    const { id, inStock } = req.body;
    await Product.findByIdAndUpdate(id, { inStock });
    res.json({ success: true, message: "Stock Updated" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
