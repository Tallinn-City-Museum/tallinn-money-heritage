import { useState, useEffect } from "react";
import { CoinSide } from "@/src/data/entity/coin";
import { Text, View } from "react-native";
import { styles } from "../../common/stylesheet";

export function BottomArea({ side, predicted }: { side: CoinSide, predicted: CoinSide | null }) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        // Shows for 2 seconds every time the side changes
        setVisible(true);
        const timer = setTimeout(() => setVisible(false), 2000);
        return () => clearTimeout(timer);
    }, [side]);

    const color = predicted === side ? "green" : "red";

    if (!visible) return null; // hide when the timeout ends

    return (
        <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={styles.resultText}>
                {side === CoinSide.HEADS ? "Revers" : "Avers"}
            </Text>
            {predicted !== null && (
                <Text style={{ color: color }}>
                    {predicted === side ? "Ennustus läks täppi!" : "Ennustus ei läinud täppi"}
                </Text>
            )}
        </View>
    );
}
