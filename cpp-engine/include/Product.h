#pragma once

#include <string>
#include <vector>

struct Product {
    std::string id;
    std::string name;

    std::vector<std::string> description;

    double price;
    double offerPrice;

    std::vector<std::string> images;

    std::string category;
    bool inStock;
};