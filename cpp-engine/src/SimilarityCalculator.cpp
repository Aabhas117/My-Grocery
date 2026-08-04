#include "../include/SimilarityCalculator.h"
#include "../include/TextUtils.h"

#include <unordered_set>
#include <cmath>

using namespace std;

double SimilarityCalculator::calculate(
    const Product& a,
    const Product& b)
{
    double score = 0.0;

    //------------------------------------
    // Category Match (40)
    //------------------------------------

    if (a.category == b.category)
    {
        score += 40.0;
    }

    //------------------------------------
    // Price Similarity (20)
    //------------------------------------

    double maxPrice =
        max(a.offerPrice, b.offerPrice);

    if (maxPrice > 0)
    {
        double diff =
            std::abs(a.offerPrice - b.offerPrice);

        score +=
            20.0 * (1.0 - diff / maxPrice);
    }

    //------------------------------------
// Description Similarity (40)
//------------------------------------

auto tokensA = TextUtils::tokenize(a.description);
auto tokensB = TextUtils::tokenize(b.description);

unordered_set<string> wordsA(
    tokensA.begin(),
    tokensA.end()
);

unordered_set<string> wordsB(
    tokensB.begin(),
    tokensB.end()
);

int common = 0;

for (const auto& word : wordsA)
{
    if (wordsB.count(word))
        common++;
}

int total =
    wordsA.size() +
    wordsB.size() -
    common;

if (total > 0)
{
    score +=
        40.0 *
        static_cast<double>(common) /
        total;
}
    return score;
}