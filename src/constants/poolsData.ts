import { IDict, IPoolData } from '../interfaces';

export const POOLS_DATA: IDict<IPoolData> = {
    // TESTNET
    "waves3pool" : {
        "name" : "waves3pool",
        "full_name" : "waves3pool",
        "symbol" : "waves3pool",
        "reference_asset" : "USD",
        "pool_address" : "3N8p4dscxCN8XkfWopQP55a2AyvFD9cJx8a",
        "gauge_address" : "3N8tLY9K2VpGVGcTT2sfyjz2QnhojAjf7WP",
        "token_id" : "JAXQwrhuQk4tSkGjLB5H2Hn1PhvgNTTrDRaZqb5kotMN",
        "token_decimals" : 6,
        "coins" : [ "USDN", "USDT", "USDC", "BUSD", "WDAI", "EAST" ],
        "coin_ids" : [
            "h67Gp9FQDa6tVFXbfhBrkKWzLvAygHk4sPG7WySHgnA",
            "2byPKMNSe4QVuUm2CEPjcVkPSDxQysX5CaJQXxKnJZPb",
            "E3HWLmLLNJ8vC3U3SPfxLdoBbzmnZQmToopicQwD91yN",
            "9MZwABiVKKb1KebbJET7941wJqZs9hG8d9Reza1QTdt3",
            "EDPRXujFFy5DJySGFbj8ckB9WCi9pF2rLqab66jrfvz",
            "GjscxB4McTpst8SbhgFbY8UDMSdswuNmPYe4kTNsQjQb",
        ],
        "decimals" : [ 6, 6, 6, 6, 6, 8 ]
    }

    // // TESTNET
    // "waves3pool" : {
    //     "name" : "waves3pool",
    //     "full_name" : "waves3pool",
    //     "symbol" : "waves3pool",
    //     "reference_asset" : "USD",
    //     "pool_address" : "3N6LyfP6LxBjzYtYf54srGheVuiSB9ttGUF",
    //     "gauge_address" : "3N5d1PpYH9xHZPCxsbYU9kzHgoxbVn4Fauh",
    //     "token_id" : "GHkh4rh4Spt1xFB5ABXj8RsjCMczNeNi6vbaKAGiQkm3",
    //     "token_decimals" : 6,
    //     // "crv_id" : "HbyPRitPyShfSzMcD7wBCgrAdHVkXBDPZWuRrAGEA4y",
    //     // "crv_decimals" : 8,
    //     "coins" : [ "USDN", "USDT", "USDC" ],
    //     "coin_ids" : [
    //         "8LhxCrVXyf3hNEKU7aLFg7bchrJ6Rv3tVU9GFVKCZCuS",
    //         "Gw5aa4PHtKnV27ebRkUc2akWhEnNJfmrZ3TZg7YxoovP",
    //         "9WGXmhryaCqfWZ3d2yhBGfXhZkDTQVqC9fDMdYJfmxZB",
    //     ],
    //     "decimals" : [ 6, 6, 6 ]
    // }

    // CUSTOM NETWORK
    // "waves3pool" : {
    //     "name" : "waves3pool",
    //     "full_name" : "waves3pool",
    //     "symbol" : "waves3pool",
    //     "pool_address" : "3MNNRF9Twpu7BuHobGfsof1MF4oKrpam8FW",
    //     "gauge_address" : "3MJdoPSoZ7kmkfY61pGBsCYEDdZ3ZeDPRnT",
    //     "token_id" : "Asm98KTGH615QvbMrapKZzGLqp8yjMGCrwKReKbKmez3",
    //     "token_decimals" : 6,
    //     "reference_asset" : "USD",
    //     "coins" : [ "USDN", "USDT", "USDC" ],
    //     "coin_ids" : [
    //         "5eg2eUvmgBftgsx3NZuCgk5q7195zx7VxNoNWatGS3HD",
    //         "DJEYQHGZ2LZzr37a5NK7BrYY3XKdAVXAFvaML9SGV7Do",
    //         "CPsgiCdE97iKU7zW9roH8C3mJ3yHMhGc7bkvTatp3R4L",
    //     ],
    //     "decimals" : [ 6, 6, 6 ]
    // }
}
