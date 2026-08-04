#include "../include/TextUtils.h"

#include <sstream>
#include <cctype>

using namespace std;

vector<string> TextUtils::tokenize(
    const string& text
)
{
    string cleaned;
    cleaned.reserve(text.size());

    for (char ch : text)
    {
        if (isalnum(static_cast<unsigned char>(ch)))
        {
            cleaned += static_cast<char>(
                tolower(static_cast<unsigned char>(ch))
            );
        }
        else
        {
            cleaned += ' ';
        }
    }

    stringstream ss(cleaned);

    vector<string> words;
    string word;

    while (ss >> word)
    {
        words.push_back(word);
    }

    return words;
}

vector<string> TextUtils::tokenize(
    const vector<string>& lines
)
{
    vector<string> words;

    for (const auto& line : lines)
    {
        auto tokens = tokenize(line);

        words.insert(
            words.end(),
            tokens.begin(),
            tokens.end()
        );
    }

    return words;
}