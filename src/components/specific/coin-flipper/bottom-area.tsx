import React from "react";
import { Text, View } from "react-native";
import { CoinSide } from "@/src/data/entity/coin";
import { styles } from "../../common/stylesheet";

export function BottomArea({
    side,
    coinName,
}: {
    side: CoinSide;
    coinName: string;
}) {
    const formattedName =
        coinName && coinName.length > 0
            ? coinName.charAt(0).toUpperCase() + coinName.slice(1)
            : "";

    return (
        <View style={styles.bottomCoinInfoContainer}>
            <View style={styles.coinInfoRow}>
                <Text style={styles.coinInfoName}>{formattedName}</Text>
                <Text style={styles.coinInfoSide}>
                    {side === CoinSide.HEADS ? "AVERS" : "REVERS"}
                </Text>
            </View>
        </View>
    );
}
