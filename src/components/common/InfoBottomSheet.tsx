import React, { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  PanResponder,
  ScrollView,
  Dimensions,
} from "react-native";
import { Coin, CoinSide } from "../../data/entity/coin";
import { styles } from "./stylesheet";

type InfoBottomSheetProps = {
  coin: Coin | null;
  onClose: () => void;
  dragY: Animated.Value;
  bottomSheetAnim: Animated.Value;
};

export const InfoBottomSheet = ({
  coin,
  onClose,
  bottomSheetAnim,
  dragY,
}: InfoBottomSheetProps) => {
  if (!coin) return null;

  const walletCoin = coin as any;
  const hasWalletData = walletCoin.flippedAt;
  const hasPrediction = walletCoin.prediction !== undefined;

  let addedDateFormatted: string | null = null;
  let predictionFormatted: string | null = null;

  if (hasWalletData) {
    try {
      const dateObj = new Date(walletCoin.flippedAt);
      addedDateFormatted = isNaN(dateObj.getTime())
        ? "N/A"
        : dateObj.toLocaleDateString("et-EE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
    } catch {
      addedDateFormatted = "N/A";
    }
  }

  if (hasPrediction) {
    if (walletCoin.prediction === CoinSide.HEADS) predictionFormatted = "Avers";
    else if (walletCoin.prediction === CoinSide.TAILS) predictionFormatted = "Revers";
    else predictionFormatted = "Ei ennustanud";
  }

  const screenHeight = Dimensions.get("window").height;
  const SHEET_HEIGHT = screenHeight * 0.5;

  const handlePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
      onMoveShouldSetPanResponderCapture: (_, gestureState) => Math.abs(gestureState.dy) > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          dragY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const threshold = SHEET_HEIGHT / 6;
        const fastEnough = gestureState.vy > 0.7;
        if (gestureState.dy > threshold || fastEnough) {
          Animated.timing(bottomSheetAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            dragY.setValue(0);
            onClose();
          });
        } else {
          Animated.spring(dragY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
      onPanResponderTerminationRequest: () => false,
    })
  ).current;

  // TranslateY calculation
  const translateY = Animated.add(
    bottomSheetAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [SHEET_HEIGHT, 0],
    }),
    dragY
  );

  return (
    <Animated.View
      style={[
        styles.bottomSheet,
        {
          height: SHEET_HEIGHT,
          transform: [{ translateY }],
          zIndex: 10,
        },
      ]}
    >
      {/* Header + drag area */}
      <View
        style={styles.sheetHeader}
        {...handlePanResponder.panHandlers}
      >
        <View style={styles.sheetHandle} />
        <TouchableOpacity
          onPress={onClose}
          style={styles.sheetCloseBtn}
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.sheetCloseIcon}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable info content */}
      <ScrollView
          style={styles.infoScroll}
          contentContainerStyle={styles.infoScrollContent}
          showsVerticalScrollIndicator={true}
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
      >
          <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                  <Text style={styles.infoTitle}>Nimetus</Text>
                  <Text style={styles.infoValue}>{coin.name ?? "—"}</Text>
              </View>

              <View style={styles.infoRow}>
                  <Text style={styles.infoTitle}>Dateering</Text>
                  <Text style={styles.infoValue}>{coin.date ?? "—"}</Text>
              </View>

              <View style={styles.infoRow}>
                  <Text style={styles.infoTitle}>Riik</Text>
                  <Text style={styles.infoValue}>{coin.region ?? "—"}</Text>
              </View>

              <View style={styles.infoRow}>
                  <Text style={styles.infoTitle}>Läbimõõt</Text>
                  <Text style={styles.infoValue}>
                      {coin.diameter ?? "—"} mm
                  </Text>
              </View>

              <View style={styles.infoRow}>
                  <Text style={styles.infoTitle}>Materjal</Text>
                  <Text style={styles.infoValue}>{coin.material ?? "—"}</Text>
              </View>

              <View style={styles.infoRow}>
                  <Text style={styles.infoTitle}>Museaali nr</Text>
                  <Text style={styles.infoValue}>{coin.muisId ?? "—"}</Text>
              </View>
          </View>

          {hasWalletData && (
              <View style={styles.infoCard}>
                  <View style={styles.infoRow}>
                      <Text style={styles.infoTitle}>Rahakotti lisatud</Text>
                      <Text style={styles.infoValue}>{addedDateFormatted}</Text>
                  </View>

                  <View style={styles.infoRow}>
                      <Text style={styles.infoTitle}>Esimene ennustus</Text>
                      <Text style={styles.infoValue}>{predictionFormatted ?? "—"}</Text>
                  </View>
              </View>
          )}
      </ScrollView>
    </Animated.View>
  );
};
