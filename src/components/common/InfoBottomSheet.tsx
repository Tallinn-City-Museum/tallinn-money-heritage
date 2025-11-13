// src/components/specific/coin-flipper/InfoBottomSheet.tsx

import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Animated,
    PanResponderInstance,
} from "react-native";
import { Coin } from "../../data/entity/coin"; // Adjust path if needed
import { styles } from "./stylesheet"; // Adjust path if needed

type InfoBottomSheetProps = {
    coin: Coin | null;
    onClose: () => void;
    bottomSheetAnim: Animated.Value;
    dragY: Animated.Value;
    sheetPanResponder: PanResponderInstance;
};

export const InfoBottomSheet = ({
    coin,
    onClose,
    bottomSheetAnim,
    dragY,
    sheetPanResponder,
}: InfoBottomSheetProps) => {
    
    // The component won't render if coin is null,
    // but we check just in case.
    if (!coin) {
        return null;
    }

    return (
        <Animated.View
            {...sheetPanResponder.panHandlers}
            style={[
                styles.bottomSheet,
                {
                    transform: [
                        {
                            translateY: Animated.add(
                                bottomSheetAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [400, 0], // Sheet slides up from 400px below
                                }),
                                dragY // Add the drag-down gesture value
                            ),
                        },
                    ],
                },
            ]}
        >
            {/* Handle and Close Button */}
            <View style={styles.sheetHeader}>
                <View style={styles.sheetHandle} />
                <TouchableOpacity onPress={onClose} style={styles.sheetCloseBtn}>
                    <Text style={styles.sheetCloseIcon}>✕</Text>
                </TouchableOpacity>
            </View>

            {/* Scrollable info content */}
            <View style={{ width: "100%", paddingHorizontal: 20 }}>
                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>Aasta</Text>
                    <Text style={styles.infoValue}>{coin.date ?? "—"}</Text>
                </View>

                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>Mõõdud</Text>
                    <Text style={styles.infoValue}>
                        Läbimõõt: {coin.diameterMm ?? "—"} mm{"\n"}Kaal: {coin.weight ?? "—"} g
                    </Text>
                </View>

                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>Materjal</Text>
                    <Text style={styles.infoValue}>{coin.material ?? "—"}</Text>
                </View>

                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>Kirjeldus</Text>
                    <Text style={styles.infoValue}>
                        <Text style={{ fontWeight: "bold" }}>Kull pool: </Text>
                        {coin.headDescription ?? "—"}
                        {"\n"}
                        <Text style={{ fontWeight: "bold" }}>Kiri pool: </Text>
                        {coin.tailsDescription ?? "—"}
                    </Text>
                </View>
            </View>
        </Animated.View>
    );
};