import { useState, useEffect } from "react";
import { CoinSide } from "@/src/data/entity/coin";
import { Text, View } from "react-native";
import { styles } from "../../common/stylesheet";

export function BottomArea({ side, predicted }: { side: CoinSide, predicted: CoinSide | null }) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        // Kui side muutub, näita 2 sekundit
        setVisible(true);
        const timer = setTimeout(() => setVisible(false), 2000);
        return () => clearTimeout(timer);
    }, [side]); // käivitub iga kord, kui side muutub

    const color = predicted === side ? "green" : "red";

    if (!visible) return null; // peida, kui timeout läbi

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
