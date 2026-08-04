#include <crow/app.h>
#include <crow/json.h>

#include <iostream>
#include <vector>
#include <string>

#include "../include/RecommendationEngine.h"
#include "../include/ProductRecommendationEngine.h"

int main()
{
    crow::SimpleApp app;

    RecommendationEngine engine;
    ProductRecommendationEngine recommendationGraph;

    CROW_ROUTE(app, "/")([]()
                         { return "GreenCart C++ Search Engine"; });

    // ----------------------------
    // SEARCH ENDPOINT
    // ----------------------------

    CROW_ROUTE(app, "/search")
    ([&engine](const crow::request &req)
     {
         auto query = req.url_params.get("query");

         if (!query)
         {
             return crow::response(
                 400,
                 "Missing query parameter");
         }

         auto products = engine.recommend(query);

         crow::json::wvalue response;

         response["success"] = true;
         response["query"] = query;
         response["count"] = static_cast<int>(products.size());

         crow::json::wvalue::list productList;

         for (const auto &product : products)
         {
             crow::json::wvalue item;

             item["_id"] = product.id;
             item["name"] = product.name;

             item["price"] = product.price;
             item["offerPrice"] = product.offerPrice;

             item["category"] = product.category;
             item["inStock"] = product.inStock;

             item["description"] = product.description;
             item["images"] = product.images;

             productList.push_back(std::move(item));
         }

         response["products"] = std::move(productList);

         return crow::response(response); });

    // ----------------------------
    // RECOMMENDATION ENDPOINT
    // ----------------------------

    CROW_ROUTE(app, "/recommendations/<string>")
    ([&recommendationGraph](const std::string &productId)
     {
         auto products =
             recommendationGraph.recommend(
                 productId,
                 8);

         crow::json::wvalue response;

         response["success"] = true;
         response["productId"] = productId;
         response["count"] =
             static_cast<int>(products.size());

         crow::json::wvalue::list productList;

         for (const auto &recommendation : products)
{
    const auto &product = recommendation.product;

    crow::json::wvalue item;

    item["_id"] = product.id;
    item["name"] = product.name;

    item["price"] = product.price;
    item["offerPrice"] = product.offerPrice;

    item["category"] = product.category;
    item["inStock"] = product.inStock;

    item["description"] = product.description;
    item["images"] = product.images;

    item["similarityScore"] =
        recommendation.similarityScore;

    productList.push_back(
        std::move(item));
}

         response["products"] =
             std::move(productList);

         return crow::response(response); });

    // ----------------------------
    // INITIALIZE ENDPOINT
    // ----------------------------

    CROW_ROUTE(app, "/initialize")
        .methods(crow::HTTPMethod::Post)([&engine, &recommendationGraph](const crow::request &req)
                                         {
                                            try{
                                             auto body = crow::json::load(req.body);

                                             if (!body)
                                             {
                                                 return crow::response(
                                                     400,
                                                     "Invalid JSON");
                                             }

                                             auto products = body["products"];

                                             std::vector<Product> allProducts;

                                             for (const auto &p : products)
                                             {
                                                 Product product;

                                                 product.id = p["_id"].s();
                                                 product.name = p["name"].s();

                                                 product.price = p["price"].d();
                                                 product.offerPrice = p["offerPrice"].d();

                                                 product.category = p["category"].s();
                                                 product.inStock = p["inStock"].b();

                                                 for (const auto &description : p["description"])
                                                 {
                                                     product.description.push_back(
                                                         description.s());
                                                 }

                                                 

                                                 for (const auto &image : p["images"])
                                                 {
                                                     product.images.push_back(
                                                         image.s());
                                                 }

                                                 allProducts.push_back(
                                                     std::move(product));
                                             }

                                             //--------------------------------------------------
                                             // Build Search Trie
                                             //--------------------------------------------------

                                             engine.buildIndex(allProducts);

                                             //--------------------------------------------------
                                             // Build Recommendation Graph
                                             //--------------------------------------------------

                                             recommendationGraph.buildGraph(allProducts);

                                             std::cout << "\n";
                                             std::cout << "Search Index Built ("
                                                       << allProducts.size()
                                                       << " products)"
                                                       << std::endl;

                                             std::cout << "Recommendation Graph Built"
                                                       << std::endl;

                                             crow::json::wvalue response;

                                             response["success"] = true;
                                             response["productsIndexed"] =
                                                 static_cast<int>(allProducts.size());

                                             return crow::response(response);
 }     catch (const std::exception& e)
    {
        std::cerr << "\nEXCEPTION:\n"
                  << e.what()
                  << std::endl;

        return crow::response(
            500,
            e.what()
        );
    }

    catch (...)
    {
        std::cerr << "\nUNKNOWN EXCEPTION\n";

        return crow::response(
            500,
            "Unknown Exception"
        );
    } });

    app.port(18080)
        .multithreaded()
        .run();

    return 0;
}