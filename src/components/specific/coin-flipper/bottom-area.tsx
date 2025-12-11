import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { CoinSide } from "@/src/data/entity/coin";
import { styles } from "../../common/stylesheet";

export function BottomArea({
    side,
    coinName,
    predicted,
    isFlipping,
}: {
    side: CoinSide;
    coinName: string;
    predicted: CoinSide | null;
    isFlipping: boolean;
}) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        // Show for 2 seconds every time the side changes
        setVisible(true);
        const timer = setTimeout(() => setVisible(false), 2000);
        return () => clearTimeout(timer);
    }, [side]);

    if (!visible) {
        return null;
    }

    const formattedName =
        coinName && coinName.length > 0
            ? coinName.charAt(0).toUpperCase() + coinName.slice(1)
            : "";

    const sideLabel = side === CoinSide.HEADS ? "avers" : "revers";

    return (
        <View style={styles.bottomCoinInfoContainer}>
            <View style={styles.coinInfoRow}>
                <Text style={styles.coinInfoName}>
                    {formattedName ? `${formattedName},` : ""}
                </Text>
                <Text style={styles.coinInfoSide}>{sideLabel}</Text>
            </View>

            {predicted !== null && !isFlipping && (
                <View style={styles.predictionResultBox}>
                    <Text style={styles.predictionResultText}>
                        {predicted === side
                            ? "Ennustus läks täppi!"
                            : "Ennustus ei läinud täppi"}
                    </Text>
                </View>
            )}
        </View>
    );
}
