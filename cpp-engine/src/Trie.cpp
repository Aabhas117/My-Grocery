#include "../include/Trie.h"

#include <algorithm>
#include <cctype>

Trie::Trie() {
    root = std::make_unique<TrieNode>();
}

void Trie::clear() {
    root = std::make_unique<TrieNode>();
}

std::string Trie::normalize(const std::string& text) const {

    std::string result = text;

    std::transform(
        result.begin(),
        result.end(),
        result.begin(),
        [](unsigned char c) {
            return std::tolower(c);
        });

    return result;
}

void Trie::insert(
    const std::string& word,
    const std::string& productId
) {

    std::string normalizedWord = normalize(word);

    TrieNode* node = root.get();

    for (char ch : normalizedWord) {

        if (!node->children.count(ch)) {
            node->children[ch] = std::make_unique<TrieNode>();
        }

        node = node->children[ch].get();
    }

    node->isEnd = true;
    node->productIds.insert(productId);
}

void Trie::dfsCollect(
    TrieNode* node,
    std::unordered_set<std::string>& result
) {

    if (node == nullptr)
        return;

    result.insert(
        node->productIds.begin(),
        node->productIds.end()
    );

    for (auto& [ch, child] : node->children) {
        dfsCollect(child.get(), result);
    }
}

std::vector<std::string> Trie::search(
    const std::string& prefix
) {

    std::string normalizedPrefix = normalize(prefix);

    TrieNode* node = root.get();

    for (char ch : normalizedPrefix) {

        if (!node->children.count(ch)) {
            return {};
        }

        node = node->children[ch].get();
    }

    std::unordered_set<std::string> uniqueProducts;

    dfsCollect(
        node,
        uniqueProducts
    );

    return std::vector<std::string>(
        uniqueProducts.begin(),
        uniqueProducts.end()
    );
}