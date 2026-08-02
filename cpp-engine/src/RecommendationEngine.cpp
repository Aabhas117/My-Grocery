#include "../include/RecommendationEngine.h"

#include <sstream>
#include <algorithm>
#include <cctype>

std::vector<std::string> RecommendationEngine::tokenize(
    const std::string& text
) const {

    std::string cleaned;

    cleaned.reserve(text.size());

    for (char ch : text) {

        if (std::isalnum(static_cast<unsigned char>(ch))) {
            cleaned += static_cast<char>(
                std::tolower(static_cast<unsigned char>(ch))
            );
        }
        else {
            cleaned += ' ';
        }
    }

    std::stringstream ss(cleaned);

    std::vector<std::string> words;

    std::string word;

    while (ss >> word) {
        words.push_back(word);
    }

    return words;
}

void RecommendationEngine::indexText(
    const std::string& text,
    const std::string& productId
) {

    auto words = tokenize(text);

    for (const auto& word : words) {
        trie.insert(word, productId);
    }
}

void RecommendationEngine::buildIndex(
    const std::vector<Product>& products
) {

    trie.clear();
    productMap.clear();

    for (const auto& product : products) {

        productMap[product.id] = product;

        // std::cout << "Indexing: " << product.name << std::endl;

        // ---------- Name ----------

        indexText(
            product.name,
            product.id
        );
        auto test = trie.search("milk");
// std::cout << "Current milk matches: " << test.size() << std::endl;

        // ---------- Full Name ----------

        trie.insert(
            product.name,
            product.id
        );

        // ---------- Category ----------

        indexText(
            product.category,
            product.id
        );

        // ---------- Description ----------

        for (const auto& line : product.description) {

            indexText(
                line,
                product.id
            );
        }
    }
}

std::vector<Product> RecommendationEngine::recommend(
    const std::string& query
) {

    std::vector<Product> products;

    auto ids = trie.search(query);

    products.reserve(ids.size());

    for (const auto& id : ids) {

        auto it = productMap.find(id);

        if (it != productMap.end()) {
            products.push_back(it->second);
        }
    }

    return products;
}