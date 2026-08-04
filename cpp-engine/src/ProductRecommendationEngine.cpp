#include "../include/ProductRecommendationEngine.h"
#include "../include/SimilarityCalculator.h"
#include <iostream>
#include <algorithm>

using namespace std;

void ProductRecommendationEngine::buildGraph(
    const vector<Product>& products
)
{
    graph.clear();
    productMap.clear();

    //--------------------------------------------------
    // Store all products
    //--------------------------------------------------

    for (const auto& product : products)
    {
        productMap[product.id] = product;
    }

    //--------------------------------------------------
    // Build Top-K Similarity Graph
    //--------------------------------------------------

    constexpr int TOP_K = 8;

    for (size_t i = 0; i < products.size(); i++)
    {
        vector<pair<double, int>> candidates;

        //--------------------------------------------------
        // Compare current product with every other product
        //--------------------------------------------------

        for (size_t j = 0; j < products.size(); j++)
        {
            if (i == j)
                continue;

            double similarity =
                SimilarityCalculator::calculate(
                    products[i],
                    products[j]
                );

            candidates.push_back(
                {
                    similarity,
                    static_cast<int>(j)
                }
            );
        }

        //--------------------------------------------------
        // Sort by similarity (highest first)
        //--------------------------------------------------

        sort(
            candidates.begin(),
            candidates.end(),
            [](const auto& a, const auto& b)
            {
                return a.first > b.first;
            }
        );

        //--------------------------------------------------
        // Keep Top-K neighbours
        //--------------------------------------------------

        int limit =
            min(
                TOP_K,
                static_cast<int>(candidates.size())
            );

        for (int k = 0; k < limit; k++)
        {
            int neighbourIndex =
                candidates[k].second;

            double score =
                candidates[k].first;

            graph.addEdge(
                products[i].id,
                products[neighbourIndex].id,
                score
            );
        }
    }
}

vector<RecommendationResult>
ProductRecommendationEngine::recommend(
    const string& productId,
    int limit
) const
{
    vector<RecommendationResult> recommendations;

    auto edges =
        graph.getRecommendations(productId, limit);

    recommendations.reserve(edges.size());

    for (const auto& edge : edges)
    {
        auto it = productMap.find(edge.productId);

        if (it != productMap.end())
        {
            recommendations.push_back(
            {
                it->second,
                edge.similarityScore
            });
        }
    }

    return recommendations;
}