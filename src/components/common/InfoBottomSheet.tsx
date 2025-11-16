import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Animated,
    PanResponderInstance,
} from "react-native";
import { Coin, CoinSide } from "../../data/entity/coin"; 
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

    // Checking if coin came from wallet
    const walletCoin = coin as any;
    const hasWalletData = walletCoin.flippedAt;
    const hasPrediction = walletCoin.prediction !== undefined;

    let addedDateFormatted: string | null = null;
    let predictionFormatted: string | null = null;

    if (hasWalletData) {
        // Format the date
        try {
            const dateObj = new Date(walletCoin.flippedAt);
            if (isNaN(dateObj.getTime())) { // Check if the resulting date object is invalid
                addedDateFormatted = "N/A";
            } else {
                addedDateFormatted = dateObj.toLocaleDateString("et-EE", {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
            }
        } catch (e) {
            addedDateFormatted = "N/A";
        }
    }

    if (hasPrediction) {
        // Format the prediction
        if (walletCoin.prediction === CoinSide.HEADS) {
            predictionFormatted = "Avers";
        } else if (walletCoin.prediction === CoinSide.TAILS) {
            predictionFormatted = "Revers";
        } else {
            predictionFormatted = "Ei ennustanud";
        }
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
                {hasWalletData && (
                    <>
                        <View style={styles.infoCard}>
                            <Text style={styles.infoTitle}>Rahakotti lisatud</Text>
                            <Text style={styles.infoValue}>{addedDateFormatted}</Text>
                            <Text style={styles.infoTitle}>Ennustus</Text>
                            <Text style={styles.infoValue}>{predictionFormatted}</Text>
                        </View>
                    </>
                )}

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