#include "../include/ProductGraph.h"

#include <algorithm>

using namespace std;

void ProductGraph::addEdge(
    const string& from,
    const string& to,
    double similarityScore)
{
    adjacencyList[from].push_back(
    {
        to,
        similarityScore
    });
}

vector<Edge> ProductGraph::getRecommendations(
    const string& productId,
    int limit) const
{
    auto it = adjacencyList.find(productId);

    if (it == adjacencyList.end())
        return {};

    vector<Edge> result = it->second;

    sort(
        result.begin(),
        result.end(),
        [](const Edge& a, const Edge& b)
        {
            return a.similarityScore > b.similarityScore;
        });

    if ((int)result.size() > limit)
        result.resize(limit);

    return result;
}

void ProductGraph::clear()
{
    adjacencyList.clear();
}