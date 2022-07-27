import { invokeScript, broadcast, waitForTx } from "@waves/waves-transactions";
import { address } from '@waves/ts-lib-crypto'
import { Signer } from '@waves/signer';
import { ICurve, IDict, IPoolData } from "./interfaces";
import { POOLS_DATA } from "./constants/poolsData";
import { COINS } from "./constants/coins";


class Curve implements ICurve {
    node: string
    providerType: 'Keeper' | 'Signer' | 'Seed' | 'None'
    signer: Signer
    seed: string
    signerAddress: string
    chainId: number
    constants: {
        COINS: IDict<string>,
        decimals: IDict<number>,
        poolsData: IDict<IPoolData>,
        GAUGES: string[],
    }

    constructor() {
        // @ts-ignore
        this.node = null;
        this.providerType = 'None';
        // @ts-ignore
        this.signer = null;
        this.seed = '';
        this.signerAddress = '';
        this.chainId = 87;
        this.constants = {
            COINS: {},
            decimals: {},
            poolsData: {},
            GAUGES: [],
        };
    }

    async init(
        node: string,
        providerType: 'Keeper' | 'Signer' | 'Seed' | 'None' = 'None',
        options: { signer?: Signer, seed?: string, chainId?: number } = {},
    ): Promise<void> {
        this.node = node;
        this.providerType = providerType;
        this.chainId = options.chainId ?? 87;

        if (providerType === 'Keeper') {
            // @ts-ignore
            const publicState = await WavesKeeper.publicState();
            // @ts-ignore
            this.signerAddress = publicState.account.address;
        } else if (providerType === 'Signer') {
            if (!options.signer) throw Error('Signer object must be passed for Signer providerType')
            this.signer = options.signer as Signer;
            const { address } = await this.signer.login();
            this.signerAddress = address;
        } else if (providerType === 'Seed') {
            if (!options.seed) throw ("Seed phrase (options.seed) is needed for Seed provider type")
            this.seed = options.seed;
            this.signerAddress = address(this.seed, this.chainId);
        } else if (providerType !== 'None') {
            throw Error('Wrong providerType');
        }

        for (const poolId in POOLS_DATA) {
            if (!POOLS_DATA.hasOwnProperty(poolId)) continue;
            this.constants.decimals[POOLS_DATA[poolId].token_id] = POOLS_DATA[poolId].token_decimals;
            if (POOLS_DATA[poolId].gauge_address) this.constants.decimals[POOLS_DATA[poolId].gauge_address as string] = POOLS_DATA[poolId].token_decimals;
            POOLS_DATA[poolId].coin_ids.forEach((addr, i) => {
                this.constants.decimals[addr] = POOLS_DATA[poolId].decimals[i];
            });
        }

        this.constants.decimals['WAVES'] = 8;
        this.constants.COINS = COINS;
        this.constants.poolsData = POOLS_DATA;
        // @ts-ignore
        this.constants.GAUGES = Object.values(POOLS_DATA).map((d) => d.gauge_address).filter((addr) => addr);
    }

    async invoke(tx: any): Promise<string> {
        if (!this.node) throw Error('Curve object is not initialized. Call curve.init()');
        if (this.providerType === 'None') throw Error("Can't invoke scripts without provider (curve.provider === 'None')")
        // @ts-ignore
        tx.fee = this.providerType === 'Keeper' ? { assetId: 'WAVES', tokens: '0.005' } : 500000;

        if (this.providerType === 'Signer') {
            // @ts-ignore
            return (await this.signer.invoke(tx).broadcast()).id;
        } else if (this.providerType === 'Keeper') {
            try {
                // @ts-ignore
                return JSON.parse(await WavesKeeper.signAndPublishTransaction({type: 16, data: tx})).id;
            } catch (err) {
                throw Error((err as { message: string }).message);
            }
        } else {
            try {
                const sentTx = await broadcast(invokeScript(tx, this.seed as string), this.node);
                await waitForTx(sentTx.id, { apiBase: this.node });

                return (sentTx).id
            } catch (err) {
                throw Error((err as { message: string }).message);
            }
        }
    }
}

export const curve = new Curve();
