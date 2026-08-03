#pragma once

#include <string>
#include <vector>
#include <memory>
#include <unordered_map>
#include <unordered_set>

class TrieNode {
public:

    std::unordered_map<char, std::unique_ptr<TrieNode>> children;

    // Product ids ending at this node
    std::unordered_set<std::string> productIds;

    bool isEnd = false;
};

class Trie {

private:

    std::unique_ptr<TrieNode> root;

    void dfsCollect(
        TrieNode* node,
        std::unordered_set<std::string>& result
    );

    std::string normalize(
        const std::string& text
    ) const;

public:

    Trie();

    void clear();

    void insert(
        const std::string& word,
        const std::string& productId
    );

    std::vector<std::string> search(
        const std::string& prefix
    );
};