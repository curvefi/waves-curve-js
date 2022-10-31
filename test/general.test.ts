import { assert } from "chai";
import { curve } from "../src/curve";
import { SEED, NODE } from "./constants.test";
import { Pool } from "../src/Pool";
import { BN } from "../src/utils";
import { IDict } from "../src/interfaces";

const POOLS =  ['waves3pool'];

const liquidityTest = (id: string) => {
    describe(`${id} deposit-stake-unstake-withdraw`, function () {
        let pool: Pool;
        let coinIds: string[];

        before(async function () {
            pool = new Pool(id);
            coinIds = pool.coinIds;
        });

        it('Deposit', async function () {
            const amount = '10';
            const amounts = coinIds.map(() => amount);
            const initialBalances = await pool.wallet.balances() as IDict<string>;
            const lpTokenExpected = await pool.depositExpected(amounts);

            await pool.deposit(amounts);

            const balances = await pool.wallet.balances() as IDict<string>;

            coinIds.forEach((c, i) => {
                assert.deepStrictEqual(BN(balances[c]), BN(initialBalances[c]).minus(BN(amounts[i])));
            })

            assert.approximately(Number(balances.lpToken) - Number(initialBalances.lpToken), Number(lpTokenExpected), 0.01);
        });

        it('Stake', async function () {
            const depositAmount: string = (await pool.wallet.lpTokenBalances() as IDict<string>).lpToken;

            await pool.stake(depositAmount);

            const balances = await pool.wallet.lpTokenBalances() as IDict<string>;

            assert.strictEqual(depositAmount, balances.gauge);
            assert.strictEqual(Number(balances.lpToken), 0);
        });

        it('Unstake', async function () {
            const withdrawAmount: string = (await pool.wallet.lpTokenBalances() as IDict<string>).gauge;

            await pool.unstake(withdrawAmount);

            const balances = await pool.wallet.lpTokenBalances() as IDict<string>;

            assert.strictEqual(withdrawAmount, balances.lpToken);
            assert.strictEqual(Number(balances.gauge), 0);
        });

        it('Withdraw one coin', async function () {
            const initialBalances = await pool.wallet.balances() as IDict<string>;
            const lpTokenAmount: string = BN(initialBalances.lpToken).div(10).toFixed(pool.lpTokenDecimals);
            const expected = await pool.withdrawOneCoinExpected(lpTokenAmount, 0);

            await pool.withdrawOneCoin(lpTokenAmount, 0);

            const balances = await pool.wallet.balances() as IDict<string>;

            assert.deepStrictEqual(BN(balances.lpToken), BN(initialBalances.lpToken).minus(BN(lpTokenAmount)));
            coinIds.forEach((c: string, i: number) => {
                if (i === 0) {
                    assert.approximately(Number(balances[c]) - Number(initialBalances[c]), Number(expected), 0.01)
                } else {
                    assert.strictEqual(balances[c], initialBalances[c]);
                }
            })
        });

        it('Withdraw', async function () {
            const initialBalances = await pool.wallet.balances() as IDict<string>;
            const lpTokenAmount: string = initialBalances.lpToken;
            const coinsExpected = await pool.withdrawExpected(lpTokenAmount);

            await pool.withdraw(lpTokenAmount);

            const balances = await pool.wallet.balances() as IDict<string>;

            assert.deepStrictEqual(BN(balances.lpToken), BN(initialBalances.lpToken).minus(BN(lpTokenAmount)));
            coinIds.forEach((c: string, i: number) => {
                assert.approximately(Number(balances[c]) - Number(initialBalances[c]), Number(coinsExpected[i]), 0.01);
            })
        });
    });
}

const exchangeTest = (id: string) => {
    describe(`${id} exchange`, function () {
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 6; j++) {
                if (i !== j) {
                    it(`${i} --> ${j}`, async function () {
                        const pool = new Pool(id);
                        const coinIds = pool.coinIds;
                        if (i >= coinIds.length || j >= coinIds.length) {
                            console.log('Skip')
                        } else {
                            const swapAmount = '10';
                            const initialCoinBalances = await pool.wallet.coinBalances() as IDict<string>;
                            const expected = await pool.swapExpected(i, j, swapAmount);

                            await pool.swap(i, j, swapAmount, 0.05);

                            const coinBalances = await pool.wallet.coinBalances() as IDict<string>;

                            // @ts-ignore
                            assert.deepStrictEqual(BN(Object.values(coinBalances)[i]), BN(Object.values(initialCoinBalances)[i]).minus(BN(swapAmount)));
                            // @ts-ignore
                            assert.isAtLeast(Number(Object.values(coinBalances)[j]), Number(BN(Object.values(initialCoinBalances)[j]).plus(BN(expected).times(0.995)).toString()));
                        }
                    });
                }
            }
        }
    });
}

describe('General test', async function () {
    this.timeout(120000);

    before(async function () {
        await curve.init(NODE, "Seed", { seed: SEED, chainId: 84 });
    });

    for (const poolId of POOLS) {
        liquidityTest(poolId);
        exchangeTest(poolId);
    }
})
