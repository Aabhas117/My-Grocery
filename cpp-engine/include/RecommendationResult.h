#pragma once

#include "Product.h"

struct RecommendationResult
{
    Product product;
    double similarityScore;
};