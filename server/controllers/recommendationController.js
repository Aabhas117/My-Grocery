import axios from "axios";

const CPP_HOST = process.env.CPP_HOST || "127.0.0.1";
const CPP_PORT = process.env.CPP_PORT || 18080;

export const getRecommendations = async (req, res) => {
  try {
    const { productId } = req.params;

    const { data } = await axios.get(
      `http://${CPP_HOST}:${CPP_PORT}/recommendations/${productId}`
    );

    res.json(data);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch recommendations",
    });
  }
};