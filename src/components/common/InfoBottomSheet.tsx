import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Animated,
    PanResponderInstance,
} from "react-native";
import { Coin } from "../../data/entity/coin"; 
import { styles } from "./stylesheet";

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
                    zIndex: 10, // so that the sheet is above other elements
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
            <View style={{ width: "100%", paddingHorizontal: 20}}>
                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>Nimi</Text>
                    <Text style={styles.infoValue}>{coin.title ?? "—"}</Text>

                    <Text style={styles.infoTitle}>Museaali nr</Text>
                    <Text style={styles.infoValue}>{coin.muisId ?? "—"}</Text>

                    <Text style={styles.infoTitle}>Aasta</Text>
                    <Text style={styles.infoValue}>{coin.date ?? "—"}</Text>

                    <Text style={styles.infoTitle}>Riik</Text>
                    <Text style={styles.infoValue}>{coin.country ?? "—"}</Text>

                    <Text style={styles.infoTitle}>Läbimõõt</Text>
                    <Text style={styles.infoValue}>{coin.diameterMm ?? "—"}</Text>

                    <Text style={styles.infoTitle}>Kaal</Text>
                    <Text style={styles.infoValue}>{coin.weight ?? "—"}</Text>

                    <Text style={styles.infoTitle}>Materjal</Text>
                    <Text style={styles.infoValue}>{coin.material ?? "—"}</Text>
                </View>
            </View>
        </Animated.View>
    );
};