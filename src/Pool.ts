import BigNumber from 'bignumber.js';
import memoize from "memoizee";
import { curve } from "./curve";
import { IDict, IRewardToken, IReward, IRewardApy, IProfit } from './interfaces';
import { callViewMethod, getDataByRegExp, getAssetDetails, getDataByKey } from './data';
import { BN, formatUnits, parseUnits, formatNumber, parseBN, _getBalances, _prepareAddresses, _getCoinIds, _cutZeros, _getUsdRate } from './utils';
import { depositTx, withdrawTx, withdrawOneCoinTx, swapTx, stakeTx, unstakeTx, claimTx } from "./transactions";
import { POOLS_DATA } from "./constants/poolsData";

const DAY = 1440;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

export class Pool {
    id: string;
    name: string;
    fullName: string;
    symbol: string;
    referenceAsset: string;
    address: string;
    lpToken: string;
    gauge?: string;
    coins: string[];
    coinIds: string[];
    decimals: number[];
    lpTokenDecimals: number;
    stats: {
        parameters: () => Promise<{
            fee: string,
            admin_fee: string,
            virtual_price: string,
            A: number,
            initial_A?: number,
            future_A?: number,
            initial_A_time?: number,
            future_A_time?: number,
        }>,
        balances: () => Promise<string[]>,
        totalLiquidity: (useApi?: boolean) => Promise<string>,
        rewardsApy: () => Promise<IRewardApy[]>;
    }
    wallet: {
        balances: (...addresses: (string | string[])[]) => Promise<IDict<IDict<string>> | IDict<string>>,
        lpTokenBalances: (...addresses: (string | string[])[]) => Promise<IDict<IDict<string>> | IDict<string>>,
        coinBalances: (...addresses: (string | string[])[]) => Promise<IDict<IDict<string>> | IDict<string>>,
        rewardBalances: (...addresses: (string | string[])[]) => Promise<IDict<IDict<string>> | IDict<string>>,
    };

    constructor(id: string) {
        const poolData = POOLS_DATA[id];

        this.id = id;
        this.name = poolData.name;
        this.fullName = poolData.full_name;
        this.symbol = poolData.symbol;
        this.referenceAsset = poolData.reference_asset;
        this.address = poolData.pool_address;
        this.lpToken = poolData.token_id;
        this.gauge = poolData.gauge_address;
        this.coins = poolData.coins;
        this.coinIds = poolData.coin_ids;
        this.decimals = poolData.decimals;
        this.lpTokenDecimals = poolData.token_decimals;
        this.stats = {
            parameters: this.statsParameters.bind(this),
            balances: this.statsBalances.bind(this),
            totalLiquidity: this.statsTotalLiquidity.bind(this),
            rewardsApy: this.statsRewardsApy,
        }
        this.wallet = {
            balances: this.walletBalances.bind(this),
            lpTokenBalances: this.walletLpTokenBalances.bind(this),
            coinBalances: this.walletCoinBalances.bind(this),
            rewardBalances: this.walletRewardBalances.bind(this),
        }
    }

    // --- STATS ---

    private async statsParameters(): Promise<{
        fee: string,
        admin_fee: string,
        virtual_price: string,
        A: number,
        initial_A?: number,
        future_A?: number,
        initial_A_time?: number,
        future_A_time?: number,
    }> {
        const res = await Promise.all([
            getDataByRegExp(this.address, "admin_fee%7Cfee%7Cfuture_A%7Cfuture_A_time%7Cinitial_A%7Cinitial_A_time"), // %7C == |
            callViewMethod(this.address, 'get_virtual_price()'),
            callViewMethod(this.address, 'A()'),
        ]);
        const A = Number(formatUnits(res.pop() as number, 0));
        const virtual_price = formatUnits(res.pop() as number, this.lpTokenDecimals);

        const [_admin_fee, _fee, future_A, future_A_time, initial_A, initial_A_time] = (res[0] as any[]).map((_x) => _x.value);
        const fee = formatUnits(_fee ,8);
        const admin_fee = formatUnits(_fee * _admin_fee, 18);

        return { fee, admin_fee, virtual_price, A, future_A, initial_A, future_A_time, initial_A_time };
    }

    private async statsBalances(): Promise<string[]> {
        const _balances = await getDataByRegExp(this.address, "balances_%5Cd"); // %5C == \
        return _balances.map((_b, i) => formatUnits(_b.value as number, this.decimals[i]));
    }

    private async statsTotalLiquidity(): Promise<string> {
        const balances = await this.statsBalances();
        return _cutZeros(balances.map(BN).reduce((a, b) => a.plus(b)).toFixed(Math.max(...this.decimals)));
    }

    private statsRewardsApy = async (): Promise<IRewardApy[]> => {
        if (!this.gauge) return [];

        const rewardsApy: IRewardApy[] = [];
        const rewardTokens = await this.rewardTokens();
        for (const rewardToken of rewardTokens) {
            const totalLiquidityUSD = Number(await this.statsTotalLiquidity());
            const rewardPrice = await _getUsdRate(rewardToken.token);

            let _speed = 0
            try {
                _speed = (await getDataByKey(this.gauge, rewardToken.token + "_speed")).value as number;
            } catch (err: any) {
                console.log(err.message);
            }
            const speed = formatUnits(_speed, rewardToken.decimals);
            const apyBN = BN(speed).times(525600).times(rewardPrice).div(Number(totalLiquidityUSD));
            const apy = apyBN.times(100).toFixed(4);

            rewardsApy.push({
                token: rewardToken.token,
                symbol: rewardToken.symbol,
                decimals: rewardToken.decimals,
                price: rewardPrice,
                gauge: this.gauge.toLowerCase(),
                apy,
            });
        }

        return rewardsApy
    }

    // --- WALLET BALANCES ---

    private async walletBalances(...addresses: (string | string[])[]): Promise<IDict<IDict<string>> | IDict<string>> {
        if (!this.gauge) {
            return await this._balances(
                ['lpToken', ...this.coinIds],
                [this.lpToken, ...this.coinIds],
                ...addresses
            );
        } else {
            return await this._balances(
                ['lpToken', 'gauge', ...this.coinIds],
                [this.lpToken, this.gauge, ...this.coinIds],
                ...addresses
            );
        }
    }

    private async walletLpTokenBalances(...addresses: (string | string[])[]): Promise<IDict<IDict<string>> | IDict<string>> {
        if (!this.gauge) {
            return await this._balances(['lpToken'], [this.lpToken], ...addresses);
        } else {
            return await this._balances(['lpToken', 'gauge'], [this.lpToken, this.gauge], ...addresses);
        }
    }

    private async walletCoinBalances(...addresses: (string | string[])[]): Promise<IDict<IDict<string>> | IDict<string>> {
        return await this._balances(this.coinIds, this.coinIds, ...addresses);
    }

    private async walletRewardBalances(...addresses: (string | string[])[]): Promise<IDict<IDict<string>> | IDict<string>> {
        const rewardTokens = await this.rewardTokens();
        const rewardTokenIds = rewardTokens.map((token) => token.token);

        return await this._balances(rewardTokenIds, rewardTokenIds, ...addresses)
    }

    // --- DEPOSIT ---

    private async calcLpTokenAmount(amounts: (number | string)[], isDeposit = true): Promise<string> {
        if (amounts.length !== this.coinIds.length) {
            throw Error(`${this.name} pool has ${this.coinIds.length} coins (amounts provided for ${amounts.length})`);
        }

        const _amounts = amounts.map((amount, i) => parseUnits(amount, this.decimals[i]));
        const _expected = await callViewMethod(this.address, `calc_token_amount(${_amounts.join(',')},true)`) as number;

        return formatUnits(_expected, this.lpTokenDecimals)
    }

    public async depositExpected(amounts: (number | string)[]): Promise<string> {
        return await this.calcLpTokenAmount(amounts);
    }

    // Returns %
    public async depositBonus(amounts: (number | string)[]): Promise<string> {
        const totalAmountBN = amounts.map(BN).reduce((acc, n) => acc.plus(n), BN(0));
        const expectedBN = BN(await this.depositExpected(amounts));

        const poolBalancesBN = (await this.statsBalances()).map(BN);
        const poolTotalBalanceBN = BN(await this.statsTotalLiquidity());
        const poolBalancesRatiosBN = poolBalancesBN.map((b) => b.div(poolTotalBalanceBN));

        const balancedAmountsBN = poolBalancesRatiosBN.map((r) => r.times(totalAmountBN));
        const balancedExpectedBN = BN(await this.depositExpected(balancedAmountsBN.map((aBN, i) => aBN.toFixed(this.decimals[i]))));

        return expectedBN.minus(balancedExpectedBN).div(balancedExpectedBN.gt(expectedBN) ? balancedExpectedBN : expectedBN).times(100).toString();
    }

    public async depositBalancedAmounts(): Promise<string[]> {
        const poolBalancesBN = (await this.statsBalances()).map(BN);
        // @ts-ignore
        const walletBalancesBN = Object.values(await this.walletCoinBalances()).map(BN);


        return this._balancedAmounts(poolBalancesBN, walletBalancesBN, this.decimals)
    }

    // slippage is %
    public async deposit(amounts: (number | string)[], slippage = 0.5): Promise<string> {
        if (amounts.length !== this.coinIds.length) {
            throw Error(`${this.name} pool has ${this.coinIds.length} coins (amounts provided for ${amounts.length})`);
        }
        const _payment = amounts
            .map((a, i) => ({ assetId: this.coinIds[i], amount: parseUnits(a, this.decimals[i]) }))
            .filter((_p) => _p.amount > 0);
        const minMintAmountBN = BN(await this.depositExpected(amounts)).times(100 - slippage).div(100);
        const _minMintAmount = parseBN(minMintAmountBN, this.lpTokenDecimals);

        return await curve.invoke(depositTx(this.address, _payment, _minMintAmount));
    }

    // --- WITHDRAW ---

    public async withdrawExpected(lpTokenAmount: number | string): Promise<string[]> {
        lpTokenAmount = formatNumber(lpTokenAmount, this.lpTokenDecimals);
        const poolCoinBalancesBN = (await this.stats.balances()).map(BN);
        const _lpTokenTotalSupply = (await getAssetDetails(this.lpToken) as { quantity: number }).quantity;
        const lpTokenTotalSupplyBN = BN(formatUnits(_lpTokenTotalSupply, this.lpTokenDecimals));

        const expectedAmountsBN: BigNumber[] = [];
        for (const poolCoinBalanceBN of poolCoinBalancesBN) {
            expectedAmountsBN.push(poolCoinBalanceBN.times(BN(lpTokenAmount)).div(lpTokenTotalSupplyBN));
        }

        return expectedAmountsBN.map((amountBN: BigNumber, i: number) => amountBN.toFixed(this.decimals[i]));
    }

    // slippage is %
    public async withdraw(lpTokenAmount: number | string, slippage = 0.5): Promise<string> {
        lpTokenAmount = formatNumber(lpTokenAmount, this.lpTokenDecimals);
        const minAmountsBN = (await this.withdrawExpected(lpTokenAmount)).map((amount) => BN(amount).times(100 - slippage).div(100));
        const _minAmounts = minAmountsBN.map((amountBN, i) => parseBN(amountBN, this.decimals[i]));
        const _payment = [ { assetId: this.lpToken, amount: parseUnits(lpTokenAmount, this.lpTokenDecimals) } ];

        return await curve.invoke(withdrawTx(this.address, _minAmounts, _payment))
    }

    // --- WITHDRAW ONE COINS ---

    public async withdrawOneCoinExpected(lpTokenAmount: number | string, coin: string | number): Promise<string> {
        const i = this._getCoinIdx(coin);
        const _lpTokenAmount = parseUnits(lpTokenAmount, this.lpTokenDecimals);
        const _expected = await callViewMethod(this.address, `calc_withdraw_one_coin(${_lpTokenAmount}, ${i})`) as number;

        return formatUnits(_expected, this.decimals[i]);
    }

    public async withdrawOneCoinBonus(lpTokenAmount: number | string, coin: string | number): Promise<string> {
        const totalAmount = await this.withdrawOneCoinExpected(lpTokenAmount, coin);
        return await this._withdrawBonus(totalAmount, lpTokenAmount);
    }

    // slippage is %
    public async withdrawOneCoin(lpTokenAmount: number | string, coin: string | number, slippage = 0.5): Promise<string> {
        const i = this._getCoinIdx(coin);
        const expectedBN = BN(await this.withdrawOneCoinExpected(lpTokenAmount, coin));
        const _minAmount = parseBN(expectedBN.times(100 - slippage).div(100), this.decimals[i]);
        const _payment = [ { assetId: this.lpToken, amount: parseUnits(lpTokenAmount, this.lpTokenDecimals) } ];

        return await curve.invoke(withdrawOneCoinTx(this.address, i, _minAmount, _payment));
    }

    // TODO add baseProfit
    // ---------------- USER BALANCES, BASE PROFIT AND SHARE ----------------

    private async _userLpTotalBalance(address: string): Promise<string> {
        const withGauge = !!this.gauge;
        const lpBalance = await this.walletLpTokenBalances(address) as IDict<string>;
        let lpTotalBalanceBN = BN(lpBalance.lpToken);
        if (withGauge) lpTotalBalanceBN = lpTotalBalanceBN.plus(BN(lpBalance.gauge as string));

        return formatNumber(lpTotalBalanceBN.toString(), this.lpTokenDecimals)
    }

    public async userBalances(address = ""): Promise<string[]> {
        address = address || curve.signerAddress;
        if (!address) throw Error("Need to connect wallet or pass address into args");

        const lpTotalBalance = await this._userLpTotalBalance(address);

        return await this.withdrawExpected(lpTotalBalance);
    }

    public async userShare(address = ""):
        Promise<{ lpUser: string, lpTotal: string, lpShare: string, gaugeUser?: string, gaugeTotal?: string, gaugeShare?: string }>
    {
        address = address || curve.signerAddress;
        if (!address) throw Error("Need to connect wallet or pass address into args");

        const withGauge = !!this.gauge;
        const userLpBalance = await this.walletLpTokenBalances(address) as IDict<string>;
        let userLpTotalBalanceBN = BN(userLpBalance.lpToken);
        if (withGauge) userLpTotalBalanceBN = userLpTotalBalanceBN.plus(BN(userLpBalance.gauge as string));

        const _lpTotal = (await getAssetDetails(this.lpToken) as { quantity: number }).quantity;
        const lpTotal = formatUnits(_lpTotal, this.lpTokenDecimals);

        let gaugeTotal = "0";
        if (withGauge) {
            const _gaugeTotal = (await getDataByKey(this.gauge as string, 'tokens')).value as number;
            gaugeTotal = formatUnits(_gaugeTotal, this.lpTokenDecimals);
        }

        return {
            lpUser: formatNumber(userLpTotalBalanceBN.toString(), this.lpTokenDecimals),
            lpTotal,
            lpShare: userLpTotalBalanceBN.div(lpTotal).times(100).toString(),
            gaugeUser: userLpBalance.gauge,
            gaugeTotal,
            gaugeShare: withGauge ? BN(userLpBalance.gauge).div(gaugeTotal).times(100).toString() : undefined,
        }
    }

    // --- SWAP ---

    public async swapExpected(inputCoin: string | number, outputCoin: string | number, amount: number | string): Promise<string> {
        const i = this._getCoinIdx(inputCoin);
        const j = this._getCoinIdx(outputCoin);
        const _amount = parseUnits(amount, this.decimals[i]);
        return formatUnits(await callViewMethod(this.address, `get_dy(${i}, ${j}, ${_amount})`) as number, this.decimals[j]);
    }

    // TODO change for non-USD
    // Returns %
    public async swapPriceImpact(inputCoin: string | number, outputCoin: string | number, amount: number | string): Promise<string> {
        const i = this._getCoinIdx(inputCoin);
        const amountBN = BN(amount);
        const expectedBN = BN(await this.swapExpected(inputCoin, outputCoin, amount));
        const smallAmount = 1;
        const smallAmountBN = BN(smallAmount);

        if (smallAmountBN.gte(amountBN)) return '0'

        const smallAmountExpectedBN = BN(await this.swapExpected(inputCoin, outputCoin, smallAmount));

        const actualRateBN = expectedBN.div(amountBN);
        const smallAmountRateBN = smallAmountExpectedBN.div(smallAmountBN);

        return smallAmountRateBN.minus(actualRateBN).div(smallAmountRateBN).times(100).toString()
    }

    // slippage is %
    public async swap(inputCoin: string | number, outputCoin: string | number, amount: number | string, slippage = 0.5): Promise<string> {
        const i = this._getCoinIdx(inputCoin);
        const j = this._getCoinIdx(outputCoin);
        const _amount = parseUnits(amount, this.decimals[i]);
        const expectedBN = BN(await this.swapExpected(i, j, amount));
        const minRecvAmountBN = expectedBN.times(100 - slippage).div(100);
        const _minRecvAmount = parseBN(minRecvAmountBN, this.decimals[j]);
        const _payment = [ { assetId: this.coinIds[i], amount: _amount } ];

        return await curve.invoke(swapTx(this.address, j, _minRecvAmount, _payment));
    }

    // --- STAKING ---

    public async stake(amount: number | string): Promise<string> {
        if (!this.gauge) Error(`There is no gauge for pool ${this.name} (id: ${this.id})`)
        const _amount = parseUnits(amount, this.lpTokenDecimals);
        const _payment = [ { assetId: this.lpToken, amount: _amount } ];

        return await curve.invoke(stakeTx(this.gauge as string, _payment));
    }

    public async unstake(amount: number | string): Promise<string> {
        if (!this.gauge) Error(`There is no gauge for pool ${this.name} (id: ${this.id})`)
        const _amount = parseUnits(amount, this.lpTokenDecimals);

        return await curve.invoke(unstakeTx(this.gauge as string, _amount));
    }

    public async claim(): Promise<string> {
        if (!this.gauge) Error(`There is no gauge for pool ${this.name} (id: ${this.id})`)

        return await curve.invoke(claimTx(this.gauge as string));
    }

    public async claimableRewards(): Promise<IReward[]> {
        const rewardTokens = await this.rewardTokens();
        const promises = rewardTokens.map((t) =>
            callViewMethod(this.gauge as string, `claimable_reward("${curve.signerAddress}", "${t.token}")`)
        );
        const rewards = await Promise.all(promises) as number[];

        return rewards.map((n, i) => ({
            ...rewardTokens[i],
            amount: formatUnits(n, rewardTokens[i].decimals),
        }))
    }

    public async claimedRewards(): Promise<IReward[]> {
        const rewardTokens = await this.rewardTokens();
        const promises = rewardTokens.map((t) =>
            callViewMethod(this.gauge as string, `claimed_reward("${curve.signerAddress}", "${t.token}")`)
        );
        const rewards = await Promise.all(promises) as number[];

        return rewards.map((n, i) => ({
            ...rewardTokens[i],
            amount: formatUnits(n, rewardTokens[i].decimals),
        }))
    }

    public rewardsProfit = async (address = ""): Promise<IProfit[]> => {
        if (!this.gauge) throw Error(`${this.name} doesn't have gauge`);

        address = address || curve.signerAddress;
        if (!address) throw Error("Need to connect wallet or pass address into args");

        const balance = (await this.walletLpTokenBalances(address) as IDict<string>).gauge
        const _totalSupply = (await getDataByKey(this.gauge as string, 'tokens')).value as number;
        const totalSupply = formatUnits(_totalSupply, this.lpTokenDecimals);

        const rewardTokens = await this.rewardTokens();
        const result: IProfit[] = [];
        for (const rewardToken of rewardTokens) {
            let _speed = 0
            try {
                _speed = (await getDataByKey(this.gauge, rewardToken.token + "_speed")).value as number;
            } catch (err: any) {
                console.log(err.message);
            }
            const speed = formatUnits(_speed, rewardToken.decimals);
            const tokenPrice = await _getUsdRate(rewardToken.token);

            result.push(
                {
                    day: BN(speed).times(DAY).times(balance).div(totalSupply).toString(),
                    week: BN(speed).times(WEEK).times(balance).div(totalSupply).toString(),
                    month: BN(speed).times(MONTH).times(balance).div(totalSupply).toString(),
                    year: BN(speed).times(YEAR).times(balance).div(totalSupply).toString(),
                    token: rewardToken.token,
                    symbol: rewardToken.symbol,
                    price: tokenPrice,
                }
            )
        }

        return result;
    }

    public rewardTokens = memoize(
        async (): Promise<IRewardToken[]> => {
            const rewardIds = ((await getDataByKey(this.gauge as string, "rewards")).value as string).split(',');
            if (rewardIds.length === 1 && rewardIds[0] === '') return [];

            const wavesIdx = rewardIds.indexOf('WAVES');
            if (wavesIdx >= 0) rewardIds.splice(wavesIdx, 1);

            const promises = rewardIds.map((id) => getAssetDetails(id));
            const rewards = (await Promise.all(promises)).map((details) => ({
                token: details.assetId,
                symbol: details.name,
                decimals: details.decimals,
            }));

            if (wavesIdx >= 0) rewards.unshift({
                token: 'WAVES',
                symbol: 'WAVES',
                decimals: 8,
            });

            // Update constants.DECIMALS
            await rewards.forEach((token) => {
                curve.constants.decimals[token.token] = token.decimals;
            });

            return rewards
        },
        {
            promise: true,
            maxAge: 10 * 60 * 1000, // 10m
        },
    )

    // --- ... ---

    private _getCoinIdx(coin: string | number, useUnderlying = true): number {
        if (typeof coin === 'number') {
            const coins_N = this.coins.length;
            const idx = coin;
            if (!Number.isInteger(idx)) {
                throw Error('Index must be integer');
            }
            if (idx < 0) {
                throw Error('Index must be >= 0');
            }
            if (idx > coins_N - 1) {
                throw Error(`Index must be < ${coins_N}`)
            }

            return idx
        }

        const [coinId] = _getCoinIds([coin]);
        const idx = this.coinIds.indexOf(coinId);
        if (idx === -1) {
            throw Error(`There is no ${coin} in ${this.name} pool`);
        }

        return idx
    }

    private async _balances(rawCoinNames: string[], rawcoinIds: string[], ...addresses: (string | string[])[]):
        Promise<IDict<IDict<string>> | IDict<string>> {
        const coinNames: string[] = [];
        const coinIds: string[] = [];
        // removing duplicates
        for (let i = 0; i < rawcoinIds.length; i++) {
            // @ts-ignore
            if (!coinIds.includes(rawcoinIds[i])) {
                coinNames.push(rawCoinNames[i]);
                coinIds.push(rawcoinIds[i])
            }
        }

        addresses = _prepareAddresses(addresses);
        const rawBalances: IDict<string[]> = await _getBalances(coinIds, addresses as string[]);

        const balances: IDict<IDict<string>> = {};
        for (const address of addresses) {
            balances[address as string] = {};
            for (const coinName of coinNames) {
                balances[address as string][coinName] = rawBalances[address as string].shift() as string;
            }
        }

        return addresses.length === 1 ? balances[addresses[0] as string] : balances
    }

    private async _withdrawBonus(totalAmount: number | string, expected: number | string): Promise<string> {
        const totalAmountBN = BN(totalAmount);
        const expectedBN = BN(expected);

        const poolBalancesBN = (await this.stats.balances()).map(BN);
        const poolTotalBalanceBN = BN(await this.stats.totalLiquidity());
        const poolBalancesRatiosBN = poolBalancesBN.map((balanceBN) => balanceBN.div(poolTotalBalanceBN));

        const balancedAmountsBN = poolBalancesRatiosBN.map((rBN) => rBN.times(totalAmountBN));
        const balancedAmounts = balancedAmountsBN.map((amountBN, i) => amountBN.toFixed(this.decimals[i]));
        const balancedExpectedBN = BN(await this.calcLpTokenAmount(balancedAmounts, false));

        return balancedExpectedBN.minus(expectedBN).div(balancedExpectedBN.gt(expectedBN) ? balancedExpectedBN : expectedBN).times(100).toString()
    }

    private _balancedAmounts(poolBalancesBN: BigNumber[], walletBalancesBN: BigNumber[], decimals: number[]): string[] {
        const poolTotalLiquidityBN = poolBalancesBN.reduce((a, b) => a.plus(b));
        const poolBalancesRatiosBN = poolBalancesBN.map((b) => b.div(poolTotalLiquidityBN));
        // Cross factors for each wallet balance used as reference to see the
        // max that can be used according to the lowest relative wallet balance
        const balancedAmountsForEachScenarioBN = walletBalancesBN.map((_, i) => (
            walletBalancesBN.map((_, j) => (
                poolBalancesRatiosBN[j].times(walletBalancesBN[i]).div(poolBalancesRatiosBN[i])
            ))
        ));
        const firstCoinBalanceForEachScenarioBN = balancedAmountsForEachScenarioBN.map(([a]) => a);
        const firstCoinLowestBalance = firstCoinBalanceForEachScenarioBN.reduce((minBN, nBN) => nBN.lt(minBN) ? nBN : minBN);
        const scenarioWithLowestBalancesIdx = firstCoinBalanceForEachScenarioBN.indexOf(firstCoinLowestBalance);

        return balancedAmountsForEachScenarioBN[scenarioWithLowestBalancesIdx].map((nBN, i) => _cutZeros(nBN.toFixed(decimals[i])));
    }
}

export function getPool(poolId: string): Pool {
    return new Pool(poolId);
}
