import React, { createContext, useContext, useState, ReactNode } from "react";
import { WalletCoin, WalletService } from "../service/wallet-service";
import { Coin, CoinSide } from "../data/entity/coin";

interface WalletContextType {
    addCoin: (coin: Coin, side: CoinSide, prediction: CoinSide | null) => WalletCoin | undefined;
    getCoins: () => WalletCoin[];
    updateCoinPosition: (coinId: string, x: number, y: number) => void;
    clearWallet: () => void;
}

// Create React context to provide wallet state and actions to all screens
const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
    // Add a coin to the wallet only if the coin is not yet added
    const addCoin = (coin: Coin, side: CoinSide, prediction: CoinSide | null) => {
        const alreadyInWallet = WalletService.getCoins().some(c => c.id === coin.id);
        if (!alreadyInWallet) {
            // return created coin so caller can use it immediately
            const created = WalletService.addCoin(coin, side, prediction);
            return created;
        }
        return undefined;
    };

    const getCoins = () => {
        return WalletService.getCoins();
    }

    // Update a coin's position in the wallet when it is dragged
    const updateCoinPosition = (coinId: string, x: number, y: number) => {
        WalletService.updateCoinPosition(coinId, x, y);
    };

    // Clear the wallet (remove all coins)(not in use right now)
    const clearWallet = () => {
        WalletService.clearWallet();
    };

    // Provide wallet state and actions to all children
    return (
        <WalletContext.Provider value={{ addCoin, getCoins, updateCoinPosition, clearWallet }}>
            {children}
        </WalletContext.Provider>
    );
}
// Custom hook to access wallet context safely
export function useWallet() {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error("useWallet must be used within WalletProvider");
    }
    return context;
}