import React from "react";
import { Text, View, Pressable, TouchableOpacity, Animated } from "react-native";
import { CoinSide } from "@/src/data/entity/coin";
import { styles } from "../../common/stylesheet";

interface PredictionDialogProps {
    visible: boolean;
    dragY: Animated.Value;
    panHandlers: any;
    onChoosePrediction: (side: CoinSide) => void;
    onFlipWithoutPrediction: () => void;
    onClose: () => void;
}

export const PredictionDialog: React.FC<PredictionDialogProps> = ({
    visible,
    dragY,
    panHandlers,
    onChoosePrediction,
    onFlipWithoutPrediction,
    onClose,
}) => {
    if (!visible) {
        return null;
    }

    return (
        <Animated.View
            style={[styles.predictionSheet, { transform: [{ translateY: dragY }] }]}
            {...panHandlers}
        >
            <Text style={styles.predictionTitle}>Vali oma ennustus</Text>
            <View style={styles.choicesRow}>
                <Pressable
                    style={styles.choiceCard}
                    onPress={() => onChoosePrediction(CoinSide.TAILS)}
                >
                    <Text style={styles.choiceLabel}>Kull</Text>
                </Pressable>

                <Pressable
                    style={styles.choiceCard}
                    onPress={() => onChoosePrediction(CoinSide.HEADS)}
                >
                    <Text style={styles.choiceLabel}>Kiri</Text>
                </Pressable>
            </View>

            <TouchableOpacity
                onPress={onFlipWithoutPrediction}
                style={styles.skipBtn}
            >
                <Text style={styles.skipBtnText}>Viska ilma ennustuseta</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.predictionCloseButton}
                onPress={onClose}
                accessibilityRole="button"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
                <Text style={styles.predictionCloseIcon}>✕</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};
