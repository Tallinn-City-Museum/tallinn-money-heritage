import AsyncStorage from "@react-native-async-storage/async-storage";
import { Coin, CoinSide } from "../data/entity/coin";

// WalletCoin object extends basic Coin with extra info: which side, position, flip timestamp
export interface WalletCoin extends Coin {
    side: CoinSide;
    flippedAt: string; // ISO date string
    prediction: CoinSide | null;
    x: number;
    y: number;
}

const COINS_KEY = "coins";

class WalletServiceClass {
    // Private array holds the current coins in wallet
    private coins: WalletCoin[] = [];

    // Add a coin to wallet (creates random initial position)
    addCoin(coin: Coin, resultSide: CoinSide, prediction: CoinSide | null) {
        // Generate random position for coin (if not set by context)
        const randomX = Math.random() * 200 - 100; // center area
        const randomY = Math.random() * 200 - 100;

        // Build full WalletCoin object with all properties needed to display
        const walletCoin: WalletCoin = {
            ...coin,
            side: resultSide,
            flippedAt: new Date().toISOString(),
            prediction: prediction,
            x: randomX,
            y: randomY,
        };

        // Add coin to wallet array
        this.coins.push(walletCoin);
        AsyncStorage.setItem(COINS_KEY, JSON.stringify(this.coins)).then();
        return walletCoin;
    }

    // Get current coins array (copy, so mutations don't affect state)
    getCoins(): WalletCoin[] {
        // sync with AsyncStorage if the wallet is empty
        if (this.coins.length == 0) {
            AsyncStorage.getItem(COINS_KEY).then(data => {
                if (data) this.coins = JSON.parse(data) as WalletCoin[];
            });
        }
        return this.coins;
    }

    // Update a coin's drag position (called from UI)
    updateCoinPosition(coinId: string, x: number, y: number) {
        const coin = this.coins.find(c => String(c.id) === coinId);
        if (coin) {
            coin.x = x;
            coin.y = y;
        }
    }

    // Return current coin count
    getCoinCount(): number {
        return this.coins.length;
    }

    // Remove all coins from wallet
    clearWallet() {
        this.coins = [];
        AsyncStorage.setItem(COINS_KEY, JSON.stringify(this.coins)).then();
    }
}

// Export global singleton to use in context
export const WalletService = new WalletServiceClass();