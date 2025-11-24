/**
 * Enum for representing coin sides
 */
export enum CoinSide {
    HEADS = 0,
    TAILS = 1
};

export interface Coin {
    id: number;
    muisId: number;
    ref: string;
    name: string;
    date?: string | null;
    material?: string | null;
    diameter: number;
    region?: string | null;
    nomValue?: string | null;
    lemmaName?: string | null;

    headImageResource?: any;
    tailsImageResource?: any;
    prediction?: CoinSide | null;
};