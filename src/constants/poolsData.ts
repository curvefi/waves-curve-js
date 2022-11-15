import { IDict, IPoolData } from '../interfaces';

export const POOLS_DATA: IDict<IPoolData> = {
    // MAINNET
    "waves4pool" : {
        "name" : "waves4pool",
        "full_name" : "waves4pool",
        "symbol" : "waves4pool",
        "reference_asset" : "USD",
        "pool_address" : "3P42DfhtdpyfzpqCEw2H1CvmgCRyrot64yi",
        "gauge_address" : "3P4YACZAqdzFT1Q1dpmDvz3hHagJ6r9vRKf",
        "token_id" : "JAb8w1ocdaYEEUDMBFmz27EmD2RStbYA6dDxvyvrzTHJ",
        "token_decimals" : 6,
        "coins" : ["USDT", "USDC", "BUSD", "DAI"],
        "coin_ids" : [
            "34N9YcEETLWn93qYQ64EsP1x89tSruJU44RrEMSXXEPJ",
            "6XtHjpXbs9RRJP2Sr9GUyVqzACcby9TkThHXnjVC5CDJ",
            "8DLiYZjo3UUaRBTHU7Ayoqg4ihwb6YH1AfXrrhdjQ7K1",
            "8zUYbdB8Q6mDhpcXYv52ji8ycfj4SDX4gJXS7YY3dA4R",
        ],
        "decimals" : [6, 6, 6, 6],
    },

    // // TESTNET
    // "waves3pool" : {
    //     "name" : "waves3pool",
    //     "full_name" : "waves3pool",
    //     "symbol" : "waves3pool",
    //     "reference_asset" : "USD",
    //     "pool_address" : "3N8p4dscxCN8XkfWopQP55a2AyvFD9cJx8a",
    //     "gauge_address" : "3N8tLY9K2VpGVGcTT2sfyjz2QnhojAjf7WP",
    //     "token_id" : "JAXQwrhuQk4tSkGjLB5H2Hn1PhvgNTTrDRaZqb5kotMN",
    //     "token_decimals" : 6,
    //     "coins" : [ "USDN", "USDT", "USDC", "BUSD", "WDAI", "EAST" ],
    //     "coin_ids" : [
    //         "h67Gp9FQDa6tVFXbfhBrkKWzLvAygHk4sPG7WySHgnA",
    //         "2byPKMNSe4QVuUm2CEPjcVkPSDxQysX5CaJQXxKnJZPb",
    //         "E3HWLmLLNJ8vC3U3SPfxLdoBbzmnZQmToopicQwD91yN",
    //         "9MZwABiVKKb1KebbJET7941wJqZs9hG8d9Reza1QTdt3",
    //         "EDPRXujFFy5DJySGFbj8ckB9WCi9pF2rLqab66jrfvz",
    //         "GjscxB4McTpst8SbhgFbY8UDMSdswuNmPYe4kTNsQjQb",
    //     ],
    //     "decimals" : [ 6, 6, 6, 6, 6, 8 ]
    // }
}
