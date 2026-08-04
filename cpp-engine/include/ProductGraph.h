#pragma once

#include <string>
#include <unordered_map>
#include <vector>

struct Edge
{
    std::string productId;
    double similarityScore;
};

class ProductGraph
{
public:

    void addEdge(
        const std::string& from,
        const std::string& to,
        double similarityScore
    );

    std::vector<Edge> getRecommendations(
        const std::string& productId,
        int limit = 8
    ) const;

    void clear();

private:

    std::unordered_map<
        std::string,
        std::vector<Edge>
    > adjacencyList;
};