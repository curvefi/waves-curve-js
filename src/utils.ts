import BigNumber from 'bignumber.js';
import { curve } from "./curve";
import { IDict } from "./interfaces";
import { getAssetBalance, getGaugeBalance } from "./data";

export const _cutZeros = (strn: string): string => {
    return strn.replace(/0+$/gi, '').replace(/\.$/gi, '');
}

export const formatUnits = (_n: number | string, decimals: number): string => {
    const _strn = String(_n);
    if (decimals <= 0) return _strn;
    if (decimals >= _strn.length) return _cutZeros("0." + "0".repeat(decimals - _strn.length) + _strn);
    return _cutZeros(_strn.slice(0, _strn.length - decimals) + "." + _strn.slice(_strn.length - decimals));
}

export const parseUnits = (n: number | string, decimals: number): number => {
    if (Number(n) !== Number(n)) throw Error(`${n} is not a number`); // NaN
    const [integer, fractional] = String(n).split(".");
    if (!fractional) return Number(integer + '0'.repeat(decimals));
    if (fractional.length >= decimals) return Number(integer + fractional.slice(0, decimals));
    return Number(integer + fractional + '0'.repeat(decimals - fractional.length));
}

export const parseBN = (nBN: BigNumber, decimals: number): number => {
    return parseUnits(nBN.toFixed(decimals), decimals);
}

export const formatNumber = (n: number | string, decimals: number): string => {
    return formatUnits(parseUnits(n, decimals), decimals);
}

export const BN = (val: number | string): BigNumber => new BigNumber(val);


export const _prepareAddresses = (addresses: (string | string[])[]): string[] => {
    if (addresses.length == 1 && Array.isArray(addresses[0])) addresses = addresses[0] as string[];
    if (addresses.length === 0 && curve.signerAddress !== '') addresses = [curve.signerAddress];

    // filter duplicates
    return (addresses as string[]).filter((val, idx, arr) => arr.indexOf(val) === idx)
}

// coins can be either addresses or symbols
export const _getCoinIds = (coins: string[]): string[] => {
    coins = coins as string[];

    const coinAddresses = coins.map((c) => curve.constants.coins[c.toLowerCase()] || c);
    const availableAddresses = Object.keys(curve.constants.decimals);
    for (const coinAddr of coinAddresses) {
        // @ts-ignore
        if (!availableAddresses.includes(coinAddr)) throw Error(`Coin with address '${coinAddr}' is not available`);
    }

    return coinAddresses
}

export const getBalances = async (coins: string[], ...addresses: (string | string[])[]): Promise<IDict<string[]> | string[]> => {
    const preparedAddresses = _prepareAddresses(addresses);
    const balances: IDict<string[]> = await _getBalances(coins, preparedAddresses);

    return preparedAddresses.length === 1 ? balances[preparedAddresses[0]] : balances
}

export const _getBalances = async (coins: string[], addresses: string[]): Promise<IDict<string[]>> => {
    const coinIds = _getCoinIds(coins);

    const calls = [];
    for (const addr of addresses) {
        for (const coinId of coinIds) {
            // @ts-ignore
            if (curve.constants.GAUGES.includes(coinId)) {
                calls.push(getGaugeBalance(addr, coinId))
            } else {
                calls.push(getAssetBalance(addr, coinId));
            }
        }
    }
    const _balances: number[] = await Promise.all(calls);

    const balances: IDict<string[]>  = {};
    addresses.forEach((address: string, i: number) => {
        balances[address] = coinIds.map((coinId, j: number ) =>
            formatUnits(_balances[i * coinIds.length + j], curve.constants.decimals[coinId]));
    });

    return balances;
}