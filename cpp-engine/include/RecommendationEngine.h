#pragma once

#include <string>
#include <vector>
#include <unordered_map>

#include "Product.h"
#include "Trie.h"

class RecommendationEngine
{
private:

    // Prefix search index
    Trie trie;

    // Fast product lookup
    std::unordered_map<std::string, Product> productMap;

    // -------------------------
    // Internal Helper Functions
    // -------------------------

    // Breaks text into searchable words
    std::vector<std::string> tokenize(
        const std::string& text
    ) const;

    // Indexes a single text field into the Trie
    void indexText(
        const std::string& text,
        const std::string& productId
    );

public:

    RecommendationEngine() = default;

    // Rebuilds complete search index
    void buildIndex(
        const std::vector<Product>& products
    );

    // Prefix search
    std::vector<Product> recommend(
        const std::string& query
    );
};