import { Signer } from "@waves/signer";
import { curve as _curve } from "./curve";
import { getBalances } from "./utils";
import { getPool } from "./Pool";

async function init (
    node: string,
    providerType: 'Keeper' | 'Signer' | 'Seed' | 'None' = 'None',
    options: { signer?: Signer, seed?: string, wxUrl?: string, chainId?: number } = {},
): Promise<void> {
    await _curve.init(node, providerType, options);
    // @ts-ignore
    this.signerAddress = _curve.signerAddress;
    // @ts-ignore
    this.chainId = _curve.chainId;
}

const curve = {
    init,
    chainId: 0,
    signerAddress: '',
    getPoolList: () => ['waves3pool'],
    getBalances,
    getPool,
}

export default curve;
