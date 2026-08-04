#pragma once

#include <string>
#include <unordered_map>
#include <vector>

#include "Product.h"
#include "ProductGraph.h"
#include "RecommendationResult.h"

class ProductRecommendationEngine
{
public:
    ProductRecommendationEngine() = default;

    // Builds the complete recommendation graph
    void buildGraph(
        const std::vector<Product> &products);

    // Returns Top-K related products
    std::vector<RecommendationResult> recommend(
        const std::string &productId,
        int limit = 8) const;

private:
    // Fast product lookup
    std::unordered_map<std::string, Product> productMap;

    // Weighted adjacency graph
    ProductGraph graph;
};