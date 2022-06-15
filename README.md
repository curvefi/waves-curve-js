# Waves Curve JS

## Setup

Install from npm:

`npm install @curvefi/waves-api`

## Init
### Keeper
```ts
import curve from "@curvefi/waves-api";


if (!WavesKeeper) alert('Install WavesKeeper: https://docs.waves.tech/en/ecosystem/waves-keeper/');

(async () => {
    try {
        curve.init('https://nodes-testnet.wavesnodes.com', 'Keeper', { signer, chainId: 84 });
    } catch (err) {
        if (error.code === '14') {
            alert('Create WavesKeeper Account');
        } else {
            throw Error(error);
        }
    }
})()
```

### Signer
```ts
import curve from "@curvefi/waves-api";

(async () => {
    const signer = new Signer({
        // Specify URL of the node on Testnet
        NODE_URL: 'https://nodes-testnet.wavesnodes.com'
    });
    signer.setProvider(new ProviderWeb('https://testnet.waves.exchange/signer/'));

    await curve.init('https://nodes-testnet.wavesnodes.com', 'Signer', { signer, chainId: 84 });
})()
```
Read [Waves Signer Docs](https://docs.waves.tech/en/building-apps/waves-api-and-sdk/client-libraries/signer) for more info about different providers.

### Seed
```ts
import curve from "@curvefi/waves-api";
import { SEED, NODE } from "./settings";

(async () => {
    await curve.init(NODE, "Seed", { seed: SEED, chainId: 84 });
})()
```


## Notes
- Amounts can be passed in args either as numbers or strings.
- depositOrWithdraw**Bonus** and swap**PriceImpact** methods return %
- Slippage arg should be passed as %, e. g. 0 < slippage <= 100

## General methods
```ts
import curve from "@curvefi/waves-api";

(async () => {
    await curve.init(NODE, "Seed", { seed: SEED, chainId: 82 });

    // Balances of curve.signerAddress
    const balances1 = await curve.getBalances(['USDN', 'USDT']);
    // OR const balances1 = await curve.getBalances(['5eg2eUvmgBftgsx3NZuCgk5q7195zx7VxNoNWatGS3HD', 'DJEYQHGZ2LZzr37a5NK7BrYY3XKdAVXAFvaML9SGV7Do']);
    console.log(balances1);
    // [ '30059128.030221', '9952566.702206' ]

    // You can specify addresses for which you get balances
    const balances2 = await curve.getBalances(['USDN', 'USDT'], "3M7rAK6vfnCw9r1G86XJaw7v4kkr6vEKGDk", "3MEGJrFNBPehczb7vcgf8NwT1Fj1G49ZHVY");
    // OR const balances2 = await curve.getBalances(['5eg2eUvmgBftgsx3NZuCgk5q7195zx7VxNoNWatGS3HD', 'DJEYQHGZ2LZzr37a5NK7BrYY3XKdAVXAFvaML9SGV7Do'], ["3M7rAK6vfnCw9r1G86XJaw7v4kkr6vEKGDk", "3MEGJrFNBPehczb7vcgf8NwT1Fj1G49ZHVY"]);
    console.log(balances2);
    // {
    //     '3M7rAK6vfnCw9r1G86XJaw7v4kkr6vEKGDk': [ '29800000', '19800000' ],
    //     '3MEGJrFNBPehczb7vcgf8NwT1Fj1G49ZHVY': [ '29700000', '19700000' ]
    // }
})()
```

## Pools

### Available pools
```ts
import curve from "@curvefi/waves-api";

(async () => {
    await curve.init(NODE, "Seed", { seed: SEED, chainId: 82 });

    console.log(curve.getPoolList());
    // [ 'waves3pool' ]
})()
````

### Pool fields
```ts
import curve from "@curvefi/waves-api";

(async () => {
    await curve.init(NODE, "Seed", { seed: SEED, chainId: 82 });

    const pool = curve.getPool('waves3pool');

    pool.id;
    // waves3pool
    pool.name;
    // waves3pool
    pool.fullName;
    // waves3pool
    pool.symbol;
    // waves3pool
    pool.referenceAsset;
    // USD
    pool.address;
    // 3MNNRF9Twpu7BuHobGfsof1MF4oKrpam8FW
    pool.lpToken;
    // Asm98KTGH615QvbMrapKZzGLqp8yjMGCrwKReKbKmez3
    pool.gauge;
    // 3MJdoPSoZ7kmkfY61pGBsCYEDdZ3ZeDPRnT
    pool.coins;
    // [ 'USDN', 'USDT', 'USDC' ]
    pool.coinIds;
    // [
    //     '5eg2eUvmgBftgsx3NZuCgk5q7195zx7VxNoNWatGS3HD',
    //     'DJEYQHGZ2LZzr37a5NK7BrYY3XKdAVXAFvaML9SGV7Do',
    //     'CPsgiCdE97iKU7zW9roH8C3mJ3yHMhGc7bkvTatp3R4L'
    // ]
    pool.decimals;
    // [ 6, 6, 6 ]
    pool.lpTokenDecimals;
    // 6
})()
````

### Wallet balances for pool
```ts
import curve from "@curvefi/waves-api";

(async () => {
    await curve.init(NODE, "Seed", { seed: SEED, chainId: 82 });

    const pool = curve.getPool('waves3pool');

    // Current address (signer) balances
    await pool.wallet.balances();
    // {
    //     lpToken: '599.971465',
    //     gauge: '0',
    //     '5eg2eUvmgBftgsx3NZuCgk5q7195zx7VxNoNWatGS3HD': '30059128.030221',
    //     DJEYQHGZ2LZzr37a5NK7BrYY3XKdAVXAFvaML9SGV7Do: '19987762.381362',
    //     CPsgiCdE97iKU7zW9roH8C3mJ3yHMhGc7bkvTatp3R4L: '9952566.702206'
    // }
    await pool.wallet.lpTokenBalances();
    // { lpToken: '599.971465', gauge: '0' }
    await pool.wallet.coinBalances();
    // {
    //     '5eg2eUvmgBftgsx3NZuCgk5q7195zx7VxNoNWatGS3HD': '30059128.030221',
    //     DJEYQHGZ2LZzr37a5NK7BrYY3XKdAVXAFvaML9SGV7Do: '19987762.381362',
    //     CPsgiCdE97iKU7zW9roH8C3mJ3yHMhGc7bkvTatp3R4L: '9952566.702206'
    // }
    await pool.wallet.rewardTokenBalances();
    // {
    //     GGmeY8wGA8y2apHrxLrUXCgF8REBtg5WGwgYS4j2FMJ2: '0',
    //     ML5NV692BwwGctQfQZe6wiP7i5CV3VwsmFUz2dR1PFH: '0'
    // }


    // For every method above you can specify address
    await pool.wallet.balances("3M7rAK6vfnCw9r1G86XJaw7v4kkr6vEKGDk");
    // {
    //     lpToken: '0',
    //     gauge: '600000',
    //     '5eg2eUvmgBftgsx3NZuCgk5q7195zx7VxNoNWatGS3HD': '29800000',
    //     DJEYQHGZ2LZzr37a5NK7BrYY3XKdAVXAFvaML9SGV7Do: '19800000',
    //     CPsgiCdE97iKU7zW9roH8C3mJ3yHMhGc7bkvTatp3R4L: '9800000'
    // }


    // Or several addresses
    await pool.wallet.coinBalances("3M7rAK6vfnCw9r1G86XJaw7v4kkr6vEKGDk", "3MEGJrFNBPehczb7vcgf8NwT1Fj1G49ZHVY");
    // {
    //     '3M7rAK6vfnCw9r1G86XJaw7v4kkr6vEKGDk': {
    //         '5eg2eUvmgBftgsx3NZuCgk5q7195zx7VxNoNWatGS3HD': '29800000',
    //         DJEYQHGZ2LZzr37a5NK7BrYY3XKdAVXAFvaML9SGV7Do: '19800000',
    //         CPsgiCdE97iKU7zW9roH8C3mJ3yHMhGc7bkvTatp3R4L: '9800000'
    // },
    //     '3MEGJrFNBPehczb7vcgf8NwT1Fj1G49ZHVY': {
    //         '5eg2eUvmgBftgsx3NZuCgk5q7195zx7VxNoNWatGS3HD': '29700000',
    //         DJEYQHGZ2LZzr37a5NK7BrYY3XKdAVXAFvaML9SGV7Do: '19700000',
    //         CPsgiCdE97iKU7zW9roH8C3mJ3yHMhGc7bkvTatp3R4L: '9700000'
    // }
    // }
})()
```

### Stats
```ts
import curve from "@curvefi/waves-api";

(async () => {
    await curve.init(NODE, "Seed", { seed: SEED, chainId: 82 });

    const pool = curve.getPool('waves3pool');

    await pool.stats.parameters();
    // {
    //     fee: '0.1',
    //     admin_fee: '0.05',
    //     virtual_price: '1.000077',
    //     A: 720,
    //     future_A: 720,
    //     initial_A: undefined,
    //     future_A_time: 720,
    //     initial_A_time: undefined
    // }
    await pool.stats.balances();
    // [ '1340783.424594', '912176.567704', '547361.662204' ]
    await pool.stats.totalLiquidity();
    // 2800321.654502
})()
````

### Deposit
```ts
import curve from "@curvefi/waves-api";

(async () => {
    await curve.init(NODE, "Seed", { seed: SEED, chainId: 82 });

    const pool = curve.getPool('waves3pool');

    await pool.wallet.balances();
    // {
    //     lpToken: '599.971465',
    //     gauge: '0',
    //     '5eg2eUvmgBftgsx3NZuCgk5q7195zx7VxNoNWatGS3HD': '30059128.030221',
    //     DJEYQHGZ2LZzr37a5NK7BrYY3XKdAVXAFvaML9SGV7Do: '19987762.381362',
    //     CPsgiCdE97iKU7zW9roH8C3mJ3yHMhGc7bkvTatp3R4L: '9952566.702206'
    // }

    await pool.depositBalancedAmounts();
    // [ '24379194.57631', '16585922.546544', '9952566.702206' ]
    await pool.depositExpected([100, 100, 100]);
    // 300.018445
    await pool.depositBonus([100, 100, 100]);
    // 0.023838534327447767
    await pool.deposit(['100', '100', '100'], 0.1); // slippage = 0.1%
    // DthYmA37pxhxYQnkdDYn4VpkSjYthp9gKyc5Xg8YNadp

    await pool.wallet.balances();
    // {
    //     lpToken: '899.957178',
    //     gauge: '0',
    //     '5eg2eUvmgBftgsx3NZuCgk5q7195zx7VxNoNWatGS3HD': '30059028.030221',
    //     DJEYQHGZ2LZzr37a5NK7BrYY3XKdAVXAFvaML9SGV7Do: '19987662.381362',
    //     CPsgiCdE97iKU7zW9roH8C3mJ3yHMhGc7bkvTatp3R4L: '9952466.702206'
    // }
})()
```

### Staking
```ts
import curve from "@curvefi/waves-api";

(async () => {
    await curve.init(NODE, "Seed", { seed: SEED, chainId: 82 });

    const pool = curve.getPool('waves3pool');

    const balances = await pool.wallet.lpTokenBalances();
    // { lpToken: '899.957178', gauge: '0' }

    await pool.stake(balances.lpToken);
    // 4F7zotFJ67EZGnLsaRsjEtWXdCqYxiZAe7nMNXRpdPDY
    await pool.wallet.lpTokenBalances();
    // { lpToken: '0', gauge: '899.957178' }
    await pool.unstake(balances.lpToken);
    // 62cboXHJ7nsxegZzk4ChacQ8Gwtp8x9mza1qf2A8SFyU

    await pool.wallet.lpTokenBalances();
    // { lpToken: '899.957178', gauge: '0' }
})()
```

### Withdraw
```ts
import curve from "@curvefi/waves-api";

(async () => {
    await curve.init(NODE, "Seed", { seed: SEED, chainId: 82 });

    const pool = curve.getPool('waves3pool');

    await pool.wallet.balances();
    // {
    //     lpToken: '899.957178',
    //     gauge: '0',
    //     '5eg2eUvmgBftgsx3NZuCgk5q7195zx7VxNoNWatGS3HD': '30059028.030221',
    //     DJEYQHGZ2LZzr37a5NK7BrYY3XKdAVXAFvaML9SGV7Do: '19987662.381362',
    //     CPsgiCdE97iKU7zW9roH8C3mJ3yHMhGc7bkvTatp3R4L: '9952466.702206'
    // }

    await pool.withdrawExpected(10);
    // [ '4.788653', '3.257984', '1.955132' ]
    await pool.withdraw('10', 0.1); // slippage = 0.1%
    // 3gXMh1mopu9tVk39RUfZZSTb4FAqfz846nurj2QELzhE

    await pool.wallet.balances();
    // {
    //     lpToken: '889.957178',
    //     gauge: '0',
    //     '5eg2eUvmgBftgsx3NZuCgk5q7195zx7VxNoNWatGS3HD': '30059032.818874',
    //     DJEYQHGZ2LZzr37a5NK7BrYY3XKdAVXAFvaML9SGV7Do: '19987665.639345',
    //     CPsgiCdE97iKU7zW9roH8C3mJ3yHMhGc7bkvTatp3R4L: '9952468.657338'
    // }
})()
```

### Withdraw one coin
```ts
import curve from "@curvefi/waves-api";

(async () => {
    await curve.init(NODE, "Seed", { seed: SEED, chainId: 82 });

    const pool = curve.getPool('waves3pool');

    await pool.wallet.balances();
    // {
    //     lpToken: '889.957178',
    //     gauge: '0',
    //     '5eg2eUvmgBftgsx3NZuCgk5q7195zx7VxNoNWatGS3HD': '30059032.818874',
    //     DJEYQHGZ2LZzr37a5NK7BrYY3XKdAVXAFvaML9SGV7Do: '19987665.639345',
    //     CPsgiCdE97iKU7zW9roH8C3mJ3yHMhGc7bkvTatp3R4L: '9952468.657338'
    // }

    const expected = await pool.withdrawOneCoinExpected(10, 'USDN');
    // OR const expected = await pool.withdrawOneCoinExpected('10', '5eg2eUvmgBftgsx3NZuCgk5q7195zx7VxNoNWatGS3HD');
    // OR const expected = await pool.withdrawOneCoinExpected('10', 0);
    console.log(expected);
    // 10.002975
    await pool.withdrawOneCoinBonus(10,'USDN');
    // 0.012038550558512755
    const tx = await pool.withdrawOneCoin(10, 'USDN', 0.1); // slippage = 0.1%
    // OR const tx = await pool.withdrawOneCoin('10', '5eg2eUvmgBftgsx3NZuCgk5q7195zx7VxNoNWatGS3HD');
    // OR const tx = await pool.withdrawOneCoin('10', 0);
    console.log(tx);
    // PzeJUDhtoX9Mpc3tpLyeqT4sKzNUZ85nReYo1HiWUtf

    await pool.wallet.balances();
    // {
    //     lpToken: '879.957178',
    //     gauge: '0',
    //     '5eg2eUvmgBftgsx3NZuCgk5q7195zx7VxNoNWatGS3HD': '30059042.821849',
    //     DJEYQHGZ2LZzr37a5NK7BrYY3XKdAVXAFvaML9SGV7Do: '19987665.639345',
    //     CPsgiCdE97iKU7zW9roH8C3mJ3yHMhGc7bkvTatp3R4L: '9952468.657338'
    // }
})()
```

### Swap
```ts
import curve from "@curvefi/waves-api";

(async () => {
    await curve.init(NODE, "Seed", { seed: SEED, chainId: 82 });

    const pool = curve.getPool('waves3pool');

    await pool.wallet.coinBalances();
    // {
    //     '5eg2eUvmgBftgsx3NZuCgk5q7195zx7VxNoNWatGS3HD': '30059042.821849',
    //     DJEYQHGZ2LZzr37a5NK7BrYY3XKdAVXAFvaML9SGV7Do: '19987665.639345',
    //     CPsgiCdE97iKU7zW9roH8C3mJ3yHMhGc7bkvTatp3R4L: '9952468.657338'
    // }

    const expected = await pool.swapExpected('USDN','USDT', 10);
    // OR const expected = await pool.swapExpected('5eg2eUvmgBftgsx3NZuCgk5q7195zx7VxNoNWatGS3HD', 'DJEYQHGZ2LZzr37a5NK7BrYY3XKdAVXAFvaML9SGV7Do', '10');
    // OR const expected = await pool.swapExpected(0, 1, '10');
    console.log(expected);
    // 9.984499
    const swapTx = await pool.swap('USDN','USDT', 10, 0.1); // slippage = 0.1%
    // OR const swapTx = await pool.swap('5eg2eUvmgBftgsx3NZuCgk5q7195zx7VxNoNWatGS3HD', 'DJEYQHGZ2LZzr37a5NK7BrYY3XKdAVXAFvaML9SGV7Do', '10');
    // OR const swapTx = await pool.swap(0, 1, 10);
    console.log(swapTx);
    // AaGQMbYVC49RPvM2rAxAZrJhMPxoXmfuuVFPNsheAMmC

    await pool.wallet.coinBalances();
    // {
    //     '5eg2eUvmgBftgsx3NZuCgk5q7195zx7VxNoNWatGS3HD': '30059032.821849',
    //     DJEYQHGZ2LZzr37a5NK7BrYY3XKdAVXAFvaML9SGV7Do: '19987675.623844',
    //     CPsgiCdE97iKU7zW9roH8C3mJ3yHMhGc7bkvTatp3R4L: '9952468.657338'
    // }
})()
```

### Rewards
```ts
import curve from "@curvefi/waves-api";

(async () => {
    await curve.init(NODE, "Seed", { seed: SEED, chainId: 82 });

    const pool = curve.getPool('waves3pool');

    await pool.wallet.rewardTokenBalances();
    // {
    //     GGmeY8wGA8y2apHrxLrUXCgF8REBtg5WGwgYS4j2FMJ2: '0',
    //     ML5NV692BwwGctQfQZe6wiP7i5CV3VwsmFUz2dR1PFH: '0'
    // }

    await pool.claimableRewards();
    // [
    //     {
    //         assetId: 'GGmeY8wGA8y2apHrxLrUXCgF8REBtg5WGwgYS4j2FMJ2',
    //         name: 'CRV Token',
    //         decimals: 8,
    //         amount: '58.74161447'
    //     },
    //     {
    //         assetId: 'ML5NV692BwwGctQfQZe6wiP7i5CV3VwsmFUz2dR1PFH',
    //         name: 'BONUS',
    //         decimals: 1,
    //         amount: '0'
    //     }
    // ]
    await pool.claim();
    // 6gpHpnjHL8372mgAGeL7wYMMc4priQjywrjqEaKP9TwB
    await pool.claimedRewards();
    // [
    //     {
    //         assetId: 'GGmeY8wGA8y2apHrxLrUXCgF8REBtg5WGwgYS4j2FMJ2',
    //         name: 'CRV Token',
    //         decimals: 8,
    //         amount: '58.74161447'
    //     },
    //     {
    //         assetId: 'ML5NV692BwwGctQfQZe6wiP7i5CV3VwsmFUz2dR1PFH',
    //         name: 'BONUS',
    //         decimals: 1,
    //         amount: '0'
    //     }
    // ]

    await pool.wallet.rewardTokenBalances();
    // {
    //     GGmeY8wGA8y2apHrxLrUXCgF8REBtg5WGwgYS4j2FMJ2: '58.74161447',
    //     ML5NV692BwwGctQfQZe6wiP7i5CV3VwsmFUz2dR1PFH: '0'
    // }
})()
```
