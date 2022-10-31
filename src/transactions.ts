import { IInvokeScriptParams } from "@waves/waves-transactions";
import { IPayment } from "./interfaces";
import { curve } from "./curve";
import json = Mocha.reporters.json;

export const depositTx = (
    dApp: string,
    payment: IPayment[],
    minLpTokenAmount: number,
): IInvokeScriptParams => ({
    dApp,
    call: {
        function: "add_liquidity",
        args: [
            { type: 'integer', value: minLpTokenAmount },
        ],
    },
    payment,
    chainId: curve.chainId,
});

export const withdrawTx = (
    dApp: string,
    minAmounts: number[],
    payment: IPayment[],
): IInvokeScriptParams => ({
    dApp,
    call: {
        function: "remove_liquidity",
        args: [{ type: 'string', value: minAmounts.join(",") }],
    },
    payment,
    chainId: curve.chainId,
});

export const withdrawOneCoinTx = (
    dApp: string,
    i: number,
    minAmount: number,
    payment: IPayment[],
): IInvokeScriptParams => ({
    dApp,
    call: {
        function: "remove_liquidity_one_coin",
        args: [
            { type: 'integer', value: i },
            { type: 'integer', value: minAmount },
        ],
    },
    payment,
    chainId: curve.chainId,
});

export const swapTx = (
    dApp: string,
    j: number,
    minAmount: number,
    payment: IPayment[],
): IInvokeScriptParams => ({
    dApp,
    call: {
        function: "exchange",
        args: [
            { type: 'integer', value: j },
            { type: 'integer', value: minAmount },
        ],
    },
    payment,
    chainId: curve.chainId,
});

export const stakeTx = (
    dApp: string,
    payment: IPayment[],
): IInvokeScriptParams => ({
    dApp,
    call: {
        function: "deposit",
        args: [],
    },
    payment: payment,
    chainId: curve.chainId,
});

export const unstakeTx = (
    dApp: string,
    amount: number,
): IInvokeScriptParams => ({
    dApp,
    call: {
        function: "withdraw",
        args: [
            { type: 'integer', value: amount },
        ],
    },
    payment: [],
    chainId: curve.chainId,
});

export const claimTx = (
    dApp: string,
): IInvokeScriptParams => ({
    dApp,
    call: {
        function: "claim",
        args: [],
    },
    payment: [],
    chainId: curve.chainId,
});
