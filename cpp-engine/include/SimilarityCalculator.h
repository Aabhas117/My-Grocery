#pragma once

#include "Product.h"

class SimilarityCalculator
{
public:

    static double calculate(
        const Product& first,
        const Product& second
    );

private:

    static double categoryScore(
        const Product& first,
        const Product& second
    );

    static double priceScore(
        const Product& first,
        const Product& second
    );

    static double descriptionScore(
        const Product& first,
        const Product& second
    );

    static double stockScore(
        const Product& first,
        const Product& second
    );

    static std::vector<std::string> tokenize(
        const std::vector<std::string>& description
    );
    
};