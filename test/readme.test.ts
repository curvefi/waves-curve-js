import curve from "../src";
import { SEED, NODE } from "./constants.test";
import { IDict } from "../src/interfaces";


const generalMethodsTest = async () => {
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
}

const availablePoolsTest = async () => {
    await curve.init(NODE, "Seed", { seed: SEED, chainId: 82 });

    console.log(curve.getPoolList());
    // [ 'waves3pool' ]
}

const poolFieldsTest = async () => {
    await curve.init(NODE, "Seed", { seed: SEED, chainId: 82 });

    const pool = curve.getPool('waves3pool');

    console.log(pool.id);
    // waves3pool
    console.log(pool.name);
    // waves3pool
    console.log(pool.fullName);
    // waves3pool
    console.log(pool.symbol);
    // waves3pool
    console.log(pool.referenceAsset);
    // USD
    console.log(pool.address);
    // 3MNNRF9Twpu7BuHobGfsof1MF4oKrpam8FW
    console.log(pool.lpToken);
    // Asm98KTGH615QvbMrapKZzGLqp8yjMGCrwKReKbKmez3
    console.log(pool.gauge);
    // 3MJdoPSoZ7kmkfY61pGBsCYEDdZ3ZeDPRnT
    console.log(pool.coins);
    // [ 'USDN', 'USDT', 'USDC' ]
    console.log(pool.coinIds);
    // [
    //     '5eg2eUvmgBftgsx3NZuCgk5q7195zx7VxNoNWatGS3HD',
    //     'DJEYQHGZ2LZzr37a5NK7BrYY3XKdAVXAFvaML9SGV7Do',
    //     'CPsgiCdE97iKU7zW9roH8C3mJ3yHMhGc7bkvTatp3R4L'
    // ]
    console.log(pool.decimals);
    // [ 6, 6, 6 ]
    console.log(pool.lpTokenDecimals);
    // 6
}

const walletBalancesTest = async () => {
    await curve.init(NODE, "Seed", { seed: SEED, chainId: 82 });

    const pool = curve.getPool('waves3pool');

    // Current address (signer) balances
    console.log(await pool.wallet.balances());
    // {
    //     lpToken: '599.971465',
    //     gauge: '0',
    //     '5eg2eUvmgBftgsx3NZuCgk5q7195zx7VxNoNWatGS3HD': '30059128.030221',
    //     DJEYQHGZ2LZzr37a5NK7BrYY3XKdAVXAFvaML9SGV7Do: '19987762.381362',
    //     CPsgiCdE97iKU7zW9roH8C3mJ3yHMhGc7bkvTatp3R4L: '9952566.702206'
    // }
    console.log(await pool.wallet.lpTokenBalances());
    // { lpToken: '599.971465', gauge: '0' }
    console.log(await pool.wallet.coinBalances());
    // {
    //     '5eg2eUvmgBftgsx3NZuCgk5q7195zx7VxNoNWatGS3HD': '30059128.030221',
    //     DJEYQHGZ2LZzr37a5NK7BrYY3XKdAVXAFvaML9SGV7Do: '19987762.381362',
    //     CPsgiCdE97iKU7zW9roH8C3mJ3yHMhGc7bkvTatp3R4L: '9952566.702206'
    // }
    console.log(await pool.wallet.rewardBalances());
    // {
    //     GGmeY8wGA8y2apHrxLrUXCgF8REBtg5WGwgYS4j2FMJ2: '0',
    //     ML5NV692BwwGctQfQZe6wiP7i5CV3VwsmFUz2dR1PFH: '0'
    // }


    // For every method above you can specify address
    console.log(await pool.wallet.balances("3M7rAK6vfnCw9r1G86XJaw7v4kkr6vEKGDk"));
    // {
    //     lpToken: '0',
    //     gauge: '600000',
    //     '5eg2eUvmgBftgsx3NZuCgk5q7195zx7VxNoNWatGS3HD': '29800000',
    //     DJEYQHGZ2LZzr37a5NK7BrYY3XKdAVXAFvaML9SGV7Do: '19800000',
    //     CPsgiCdE97iKU7zW9roH8C3mJ3yHMhGc7bkvTatp3R4L: '9800000'
    // }


    // Or several addresses
    console.log(await pool.wallet.coinBalances("3M7rAK6vfnCw9r1G86XJaw7v4kkr6vEKGDk", "3MEGJrFNBPehczb7vcgf8NwT1Fj1G49ZHVY"));
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
}

const statsTest = async () => {
    await curve.init(NODE, "Seed", { seed: SEED, chainId: 84 });

    const pool = curve.getPool('waves3pool');

    console.log(await pool.stats.parameters());
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
    console.log(await pool.stats.balances());
    // [ '1340783.424594', '912176.567704', '547361.662204' ]
    console.log(await pool.stats.totalLiquidity());
    // 2800321.654502
    console.log(await pool.stats.volume());
    // 1242646.258629
    console.log(await pool.stats.baseApy());
    // { day: '7.94191715333079245', week: '1.13455959333297035' }
    console.log(await pool.stats.rewardsApy());
    // [
    //     {
    //         token: '9U3bZbDrpQ2TpFw8YvyitZMdKG2Lx8N6uTCJnqEgh6Pp',
    //         symbol: 'CRV Token',
    //         decimals: 8,
    //         price: 1.2,
    //         gauge: '3mybhsp1exjeivdt5ggbsarelfnswzwnnce',
    //         apy: '0.0000'
    //     },
    //     {
    //         token: '2sFcNkyjHFFc5B8jAPuXxcVKc2Q89JVPSAjzKt1ev9fm',
    //         symbol: 'BONUS',
    //         decimals: 1,
    //         price: 1,
    //         gauge: '3mybhsp1exjeivdt5ggbsarelfnswzwnnce',
    //         apy: '0.0000'
    //     }
    // ]
}

const depositTest = async () => {
    await curve.init(NODE, "Seed", { seed: SEED, chainId: 82 });

    const pool = curve.getPool('waves3pool');

    console.log(await pool.wallet.balances());
    // {
    //     lpToken: '599.971465',
    //     gauge: '0',
    //     '5eg2eUvmgBftgsx3NZuCgk5q7195zx7VxNoNWatGS3HD': '30059128.030221',
    //     DJEYQHGZ2LZzr37a5NK7BrYY3XKdAVXAFvaML9SGV7Do: '19987762.381362',
    //     CPsgiCdE97iKU7zW9roH8C3mJ3yHMhGc7bkvTatp3R4L: '9952566.702206'
    // }

    console.log(await pool.depositBalancedAmounts());
    // [ '24379194.57631', '16585922.546544', '9952566.702206' ]
    console.log(await pool.depositExpected([100, 100, 100]));
    // 300.018445
    console.log(await pool.depositBonus([100, 100, 100]));
    // 0.023838534327447767
    const depositTx = await pool.deposit(['100', '100', '100'], 0.1); // slippage = 0.1%
    console.log(depositTx);
    // DthYmA37pxhxYQnkdDYn4VpkSjYthp9gKyc5Xg8YNadp

    console.log(await pool.wallet.balances());
    // {
    //     lpToken: '899.957178',
    //     gauge: '0',
    //     '5eg2eUvmgBftgsx3NZuCgk5q7195zx7VxNoNWatGS3HD': '30059028.030221',
    //     DJEYQHGZ2LZzr37a5NK7BrYY3XKdAVXAFvaML9SGV7Do: '19987662.381362',
    //     CPsgiCdE97iKU7zW9roH8C3mJ3yHMhGc7bkvTatp3R4L: '9952466.702206'
    // }
}

const stakingTest = async () => {
    await curve.init(NODE, "Seed", { seed: SEED, chainId: 82 });

    const pool = curve.getPool('waves3pool');

    const balances = await pool.wallet.lpTokenBalances() as IDict<string>;
    console.log(balances);
    // { lpToken: '899.957178', gauge: '0' }

    console.log(await pool.stake(balances.lpToken));
    // 4F7zotFJ67EZGnLsaRsjEtWXdCqYxiZAe7nMNXRpdPDY

    console.log(await pool.wallet.lpTokenBalances());
    // { lpToken: '0', gauge: '899.957178' }

    console.log(await pool.unstake(balances.lpToken));
    // 62cboXHJ7nsxegZzk4ChacQ8Gwtp8x9mza1qf2A8SFyU

    console.log(await pool.wallet.lpTokenBalances());
    // { lpToken: '899.957178', gauge: '0' }
}

const withdrawTest = async () => {
    await curve.init(NODE, "Seed", { seed: SEED, chainId: 82 });

    const pool = curve.getPool('waves3pool');

    console.log(await pool.wallet.balances());
    // {
    //     lpToken: '899.957178',
    //     gauge: '0',
    //     '5eg2eUvmgBftgsx3NZuCgk5q7195zx7VxNoNWatGS3HD': '30059028.030221',
    //     DJEYQHGZ2LZzr37a5NK7BrYY3XKdAVXAFvaML9SGV7Do: '19987662.381362',
    //     CPsgiCdE97iKU7zW9roH8C3mJ3yHMhGc7bkvTatp3R4L: '9952466.702206'
    // }

    console.log(await pool.withdrawExpected(10));
    // [ '4.788653', '3.257984', '1.955132' ]
    const withdrawTx = await pool.withdraw('10', 0.1); // slippage = 0.1%
    console.log(withdrawTx);
    // 3gXMh1mopu9tVk39RUfZZSTb4FAqfz846nurj2QELzhE

    console.log(await pool.wallet.balances());
    // {
    //     lpToken: '889.957178',
    //     gauge: '0',
    //     '5eg2eUvmgBftgsx3NZuCgk5q7195zx7VxNoNWatGS3HD': '30059032.818874',
    //     DJEYQHGZ2LZzr37a5NK7BrYY3XKdAVXAFvaML9SGV7Do: '19987665.639345',
    //     CPsgiCdE97iKU7zW9roH8C3mJ3yHMhGc7bkvTatp3R4L: '9952468.657338'
    // }
}

const withdrawOneCoinTest = async () => {
    await curve.init(NODE, "Seed", { seed: SEED, chainId: 82 });

    const pool = curve.getPool('waves3pool');

    console.log(await pool.wallet.balances());
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
    console.log(await pool.withdrawOneCoinBonus(10,'USDN'));
    // 0.012038550558512755
    const tx = await pool.withdrawOneCoin(10, 'USDN', 0.1); // slippage = 0.1%
    // OR const tx = await pool.withdrawOneCoin('10', '5eg2eUvmgBftgsx3NZuCgk5q7195zx7VxNoNWatGS3HD');
    // OR const tx = await pool.withdrawOneCoin('10', 0);
    console.log(tx);
    // PzeJUDhtoX9Mpc3tpLyeqT4sKzNUZ85nReYo1HiWUtf

    console.log(await pool.wallet.balances());
    // {
    //     lpToken: '879.957178',
    //     gauge: '0',
    //     '5eg2eUvmgBftgsx3NZuCgk5q7195zx7VxNoNWatGS3HD': '30059042.821849',
    //     DJEYQHGZ2LZzr37a5NK7BrYY3XKdAVXAFvaML9SGV7Do: '19987665.639345',
    //     CPsgiCdE97iKU7zW9roH8C3mJ3yHMhGc7bkvTatp3R4L: '9952468.657338'
    // }
}

const poolSwapTest = async () => {
    await curve.init(NODE, "Seed", { seed: SEED, chainId: 82 });

    const pool = curve.getPool('waves3pool');

    console.log(await pool.wallet.coinBalances());
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

    console.log(await pool.wallet.coinBalances());
    // {
    //     '5eg2eUvmgBftgsx3NZuCgk5q7195zx7VxNoNWatGS3HD': '30059032.821849',
    //     DJEYQHGZ2LZzr37a5NK7BrYY3XKdAVXAFvaML9SGV7Do: '19987675.623844',
    //     CPsgiCdE97iKU7zW9roH8C3mJ3yHMhGc7bkvTatp3R4L: '9952468.657338'
    // }
}

const rewardsTest = async () => {
    await curve.init(NODE, "Seed", { seed: SEED, chainId: 84 });

    const pool = curve.getPool('waves3pool');

    console.log(await pool.rewardTokens());
    // [
    //     {
    //         token: '9U3bZbDrpQ2TpFw8YvyitZMdKG2Lx8N6uTCJnqEgh6Pp',
    //         symbol: 'CRV Token',
    //         decimals: 8
    //     },
    //     {
    //         token: '2sFcNkyjHFFc5B8jAPuXxcVKc2Q89JVPSAjzKt1ev9fm',
    //         symbol: 'BONUS',
    //         decimals: 1
    //     }
    // ]
    console.log(await pool.rewardsProfit());
    // [
    //     {
    //         day: '0',
    //         week: '0',
    //         month: '0',
    //         year: '0',
    //         token: '9U3bZbDrpQ2TpFw8YvyitZMdKG2Lx8N6uTCJnqEgh6Pp',
    //         symbol: 'CRV Token',
    //         price: 1.2
    //     },
    //     {
    //         day: '0',
    //         week: '0',
    //         month: '0',
    //         year: '0',
    //         token: '2sFcNkyjHFFc5B8jAPuXxcVKc2Q89JVPSAjzKt1ev9fm',
    //         symbol: 'BONUS',
    //         price: 1
    //     }
    // ]

    console.log(await pool.wallet.rewardBalances());
    // {
    //     GGmeY8wGA8y2apHrxLrUXCgF8REBtg5WGwgYS4j2FMJ2: '0',
    //     ML5NV692BwwGctQfQZe6wiP7i5CV3VwsmFUz2dR1PFH: '0'
    // }

    console.log(await pool.claimableRewards());
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
    console.log(await pool.claim());
    // 6gpHpnjHL8372mgAGeL7wYMMc4priQjywrjqEaKP9TwB
    console.log(await pool.claimedRewards());
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

    console.log(await pool.wallet.rewardBalances());
    // {
    //     GGmeY8wGA8y2apHrxLrUXCgF8REBtg5WGwgYS4j2FMJ2: '58.74161447',
    //     ML5NV692BwwGctQfQZe6wiP7i5CV3VwsmFUz2dR1PFH: '0'
    // }
}

const userBalancesBaseProfitAndShareTest = async () => {
    await curve.init(NODE, "Seed", { seed: SEED, chainId: 84 });

    const pool = curve.getPool('waves3pool');

    console.log(await pool.userBalances());
    // [ '625782.932618', '731796.575426', '682268.245315' ]

    console.log(await pool.userShare());
    // {
    //     lpUser: '900000',
    //     lpTotal: '14379436.268194',
    //     lpShare: '6.258937994604961104',
    //     gaugeUser: '900000',
    //     gaugeTotal: '2089048.252053',
    //     gaugeShare: '43.081819633200441537'
    // }
}
