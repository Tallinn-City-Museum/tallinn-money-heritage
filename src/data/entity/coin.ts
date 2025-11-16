/**
 * Enum for representing coin sides
 */
export enum CoinSide {
    HEADS = 0,
    TAILS = 1
};

export interface Coin {
    id: number;
    title: string;
    muisId?: number;
    date?: string | null;
    country?: string | null;
    description?: string | null;
    weight?: number;
    material?: string;
    //headDescription?: string;
    //tailsDescription?: string;
    diameterMm: number;
    headImageResource?: any;
    tailsImageResource?: any;
    prediction?: CoinSide | null;
};