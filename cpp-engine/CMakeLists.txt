cmake_minimum_required(VERSION 3.16)

project(CppEngine)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include_directories(include)

add_executable(CppEngine
    src/main.cpp
    src/Server.cpp
    src/Trie.cpp

    src/RecommendationEngine.cpp

    src/ProductGraph.cpp
    src/ProductRecommendationEngine.cpp
    src/SimilarityCalculator.cpp
    src/TextUtils.cpp
)

# Windows-only networking libraries
if (WIN32)
    target_link_libraries(CppEngine
        ws2_32
        mswsock
    )
endif()

# Put executable in a predictable location
set_target_properties(CppEngine PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin
)