#pragma once

#include <string>
#include <vector>

namespace TextUtils
{
    std::vector<std::string> tokenize(
        const std::string& text
    );

    std::vector<std::string> tokenize(
        const std::vector<std::string>& lines
    );
}