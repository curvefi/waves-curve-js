import { Signer } from '@waves/signer';

export type REFERENCE_ASSET = 'USD' | 'EUR' | 'BTC' | 'ETH' | 'LINK' | 'CRYPTO' | 'OTHER';

export interface IDict<T> {
    [index: string]: T,
}

export interface IPayment {
    assetId: string,
    amount: number,
}

export interface IPoolData {
    name: string,
    full_name: string,
    symbol: string,
    reference_asset: REFERENCE_ASSET,
    pool_address: string,
    token_id: string,
    gauge_address?: string,
    coins: string[],
    coin_ids: string[],
    decimals: number[],
    token_decimals: number,
}

export interface ICurve {
    node: string,
    providerType: 'Keeper' | 'Signer' | 'Seed' | 'None',
    signer: Signer,
    seed: string,
    signerAddress: string,
    chainId: number,
}

export interface IAssetDetails {
    assetId: string,
    name: string,
    decimals: number,
    quantity: number,
}

export interface IRewardToken {
    token: string,
    symbol: string,
    decimals: number,
}

export interface IReward extends IRewardToken{
    amount: string,
}

export interface IRewardApy extends IRewardToken {
    gauge: string,
    price: number,
    apy: string,
}
