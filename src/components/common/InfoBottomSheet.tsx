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
  bottomSheetAnim: Animated.Value;
};

export const InfoBottomSheet = ({
  coin,
  onClose,
  bottomSheetAnim,
}: InfoBottomSheetProps) => {
  if (!coin) return null;

  const walletCoin = coin as any;
  const hasWalletData = walletCoin.flippedAt;
  const hasPrediction = walletCoin.prediction !== undefined;
  const predictionCount =
    walletCoin.predictionCount ??
    walletCoin.prediction_count ??
    walletCoin.predictions ??
    null;

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

  // dragY jälgib ainult handle’i swipe’i
  const dragY = useRef(new Animated.Value(0)).current;

  // PanResponder kogu sheetile, kuid aktiveerub alles siis, kui liikumine on märgatav
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

  // TranslateY arvutus
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
      {...handlePanResponder.panHandlers}
    >
      {/* Header ja sulgemisriba */}
      <View 
        style={styles.sheetHeader}
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
        style={{ flex: 1, width: "100%" }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, paddingTop: 8 }}
        showsVerticalScrollIndicator={true}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
      >
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Nimi</Text>
          <Text style={styles.infoValue}>{coin.name ?? "—"}</Text>

          <Text style={styles.infoTitle}>Museaali nr</Text>
          <Text style={styles.infoValue}>{coin.muisId ?? "—"}</Text>

          <Text style={styles.infoTitle}>Aasta</Text>
          <Text style={styles.infoValue}>{coin.date ?? "—"}</Text>

          <Text style={styles.infoTitle}>Riik</Text>
          <Text style={styles.infoValue}>{coin.region ?? "—"}</Text>

                    <Text style={styles.infoTitle}>Läbimõõt</Text>
                    <Text style={styles.infoValue}>{coin.diameter ?? "—"} mm</Text>

          <Text style={styles.infoTitle}>Materjal</Text>
          <Text style={styles.infoValue}>{coin.material ?? "—"}</Text>
        </View>

        {hasWalletData && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Rahakotti lisatud</Text>
            <Text style={styles.infoValue}>{addedDateFormatted}</Text>
            <Text style={styles.infoTitle}>Viimane ennustus</Text>
            <Text style={styles.infoValue}>{predictionFormatted ?? "—"}</Text>
            <Text style={styles.infoTitle}>Ennustuste arv</Text>
            <Text style={styles.infoValue}>
              {predictionCount !== null && predictionCount !== undefined
                ? predictionCount
                : "—"}
            </Text>
          </View>
        )}
      </ScrollView>
    </Animated.View>
  );
};
