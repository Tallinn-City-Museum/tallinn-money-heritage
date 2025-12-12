import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { CoinSide } from "@/src/data/entity/coin";
import { styles } from "../../common/stylesheet";

export function BottomArea({
    side,
    coinName,
    predicted,
    isFlipping,
    resultSource,
    justAddedToWallet,
}: {
    side: CoinSide;
    coinName: string;
    predicted: CoinSide | null;
    isFlipping: boolean;
    resultSource: "flip" | "manual";
    justAddedToWallet: boolean;
}) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        let duration = 2500;

        if (resultSource === "flip") {
            duration = justAddedToWallet ? 5000 : 3000;
        }

        setVisible(true);
        const timer = setTimeout(() => setVisible(false), duration);
        return () => clearTimeout(timer);
    }, [side, resultSource, justAddedToWallet]);

    if (!visible) {
        return null;
    }

    const formattedName =
        coinName && coinName.length > 0
            ? coinName.charAt(0).toUpperCase() + coinName.slice(1)
            : "";

    const sideLabel = side === CoinSide.HEADS ? "avers" : "revers";

    const hasPrediction = predicted !== null;
    const predictionHit = hasPrediction && predicted === side;

    return (
        <View style={styles.bottomCoinInfoContainer}>
            <View style={styles.coinInfoRow}>
                {/* Single Text so that name + side share the same baseline */}
                <Text style={styles.coinInfoName}>
                    {formattedName ? `${formattedName}, ` : ""}
                    <Text style={styles.coinInfoSide}>{sideLabel}</Text>
                </Text>
            </View>

            {(justAddedToWallet || hasPrediction) && !isFlipping && (
                <View style={styles.predictionResultBox}>
                    {hasPrediction && (
                        <Text style={styles.predictionResultText}>
                            {predictionHit
                                ? "Ennustus läks täppi!"
                                : "Ennustus ei läinud täppi"}
                        </Text>
                    )}

                    {justAddedToWallet && (
                        <Text style={styles.predictionResultText}>
                            Münt on lisatud rahakotti
                        </Text>
                    )}
                </View>
            )}
        </View>
    );
}
