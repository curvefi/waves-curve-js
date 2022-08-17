import axios from "axios";
import { curve } from "./curve";
import { IAssetDetails } from "./interfaces";

export const getAssetBalance = async (address: string, assetId: string): Promise<number> => {
    if (!curve.node) throw Error('Curve object is not initialized. Call curve.init()');
    const url = assetId === "WAVES" ? `${curve.node}/addresses/balance/${address}` : `${curve.node}/assets/balance/${address}/${assetId}`;
    const res = await axios.get(url, { withCredentials: false });

    return res.data.balance as number;
};

export const getDataByRegExp = async (dApp: string, regExp: string): Promise<{ key: string, type: string, value: string | number | boolean }[]> => {
    if (!curve.node) throw Error('Curve object is not initialized. Call curve.init()');
    const res = await axios.get(`${curve.node}/addresses/data/${dApp}?matches=${regExp}`, { withCredentials: false });

    return res.data;
};

export const getDataByKey = async (dApp: string, key: string): Promise<{ key: string, type: string, value: string | number | boolean }> => {
    if (!curve.node) throw Error('Curve object is not initialized. Call curve.init()');
    const res = await axios.get(`${curve.node}/addresses/data/${dApp}/${key}`, { withCredentials: false });

    return res.data;
};

export const getAssetDetails = async (assetId: string): Promise<IAssetDetails> => {
    if (!curve.node) throw Error('Curve object is not initialized. Call curve.init()');
    const res = await axios.get(`${curve.node}/assets/details/${assetId}`, { withCredentials: false });

    return res.data;
};

export const callViewMethod = async (dApp: string, expr: string): Promise<number | string | boolean> => {
    if (!curve.node) throw Error('Curve object is not initialized. Call curve.init()');
    const res = await axios.post(`${curve.node}/utils/script/evaluate/${dApp}`, { expr }, {
        withCredentials: false,
        headers: { 'Content-Type': 'application/json' },
    });

    return res.data.result.value._2.value;
};

export const callViewMethodFullResult = async (dApp: string, expr: string): Promise<(number | string | boolean)[]> => {
    if (!curve.node) throw Error('Curve object is not initialized. Call curve.init()');
    const res = await axios.post(`${curve.node}/utils/script/evaluate/${dApp}`, { expr }, {
        withCredentials: false,
        headers: { 'Content-Type': 'application/json' },
    });

    return Object.keys(res.data.result.value).map((key: string) => res.data.result.value[key].value);
};

export const getGaugeBalance = async (userAddress: string, gaugeAddress: string): Promise<number> => {
    if (!curve.node) throw Error('Curve object is not initialized. Call curve.init()');
    const _balance = await callViewMethod(gaugeAddress, `claimable_tokens("${userAddress}")`);

    return _balance as number;
};
