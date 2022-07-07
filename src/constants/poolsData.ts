import { IDict, IPoolData } from '../interfaces';

export const POOLS_DATA: IDict<IPoolData> = {
    // TESTNET
    "waves3pool" : {
        "name" : "waves3pool",
        "full_name" : "waves3pool",
        "symbol" : "waves3pool",
        "reference_asset" : "USD",
        "pool_address" : "3MxuKJsPyg2ZjwWhoptvft74wJUfYZ6gjnd",
        "gauge_address" : "3MybHSP1eXJEiVdt5gGbSARELfnswzWNncE",
        "token_id" : "FuGWHcGPsJzJNJPCyCxRU7Xgk66um2x5shDrwMJaEjfH",
        "token_decimals" : 6,
        // "crv_id" : "9U3bZbDrpQ2TpFw8YvyitZMdKG2Lx8N6uTCJnqEgh6Pp",
        // "crv_decimals" : 8,
        "coins" : [ "USDN", "USDT", "USDC" ],
        "coin_ids" : [
            "orCzrtyh76FpY7EmMGoaz4njSQ7EZXvR5JXuuBGBRVc",
            "Aar7uLuf8Fh67XKEMi8yPiwL56C2ACRAGpFxzsMuEw5m",
            "586DKrFgPxvAze9bW9XAgStJTZQsaHVcNKYeVeUMnnku",
        ],
        "decimals" : [ 6, 6, 6 ]
    }

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
