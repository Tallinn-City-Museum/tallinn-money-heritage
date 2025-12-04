import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type FilterItem = {
  key: string;
  label: string;
  count: number;
};

export type MaterialStat = FilterItem;
export const DEFAULT_MATERIALS: MaterialStat[] = [
  { key: "Kõik", label: "Kõik", count: 24 },
  { key: "Hõbe", label: "Hõbe", count: 12 },
  { key: "Kuld", label: "Kuld", count: 6 },
  { key: "Vask", label: "Vask", count: 9 },
  { key: "Pronks", label: "Pronks", count: 7 },
  { key: "Nikkel", label: "Nikkel", count: 5 },
];

type MaterialFilterSheetProps = {
  isOpen: boolean;
  materials: MaterialStat[];
  activeMaterial: string;
  onRequestClose: () => void;
  onSelectMaterial: (material: string) => void;
  onLayout?: (e: any) => void;
  dragDisabled?: boolean;
};

export const MaterialFilterSheet = ({
  isOpen,
  materials,
  activeMaterial,
  onRequestClose,
  onSelectMaterial,
  onLayout,
  dragDisabled = false,
}: MaterialFilterSheetProps) => {
  const insets = useSafeAreaInsets();
  const sheetAnim = useRef(new Animated.Value(isOpen ? 1 : 0)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  const screenHeight = Dimensions.get("window").height;
  const SHEET_HEIGHT = Math.max(screenHeight * 0.135, 128);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  const displayMaterials = useMemo(
    () => materials.filter((m) => m.key.toLowerCase() !== "kõik"),
    [materials]
  );

  useEffect(() => {
    Animated.timing(sheetAnim, {
      toValue: isOpen ? 1 : 0,
      duration: 260,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => dragY.setValue(0));
  }, [isOpen]);

  const clampDrag = (val: number) => {
    const limit = SHEET_HEIGHT * 0.95;
    return Math.max(-limit, Math.min(val, limit));
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !dragDisabled,
        onMoveShouldSetPanResponder: (_, gesture) =>
          !dragDisabled && Math.abs(gesture.dy) > 3,
        onMoveShouldSetPanResponderCapture: () => !dragDisabled,
        onPanResponderMove: (_, gesture) => {
          if (dragDisabled) return;
          dragY.setValue(clampDrag(gesture.dy));
        },
        onPanResponderRelease: (_, gesture) => {
          if (dragDisabled) return;
          const closeThreshold = SHEET_HEIGHT * 0.12;
          if (gesture.dy < -closeThreshold || gesture.vy < -0.7) {
            onRequestClose();
          } else {
            Animated.spring(dragY, { toValue: 0, useNativeDriver: true }).start();
          }
        },
        onPanResponderTerminationRequest: () => false,
      }),
    [SHEET_HEIGHT, dragDisabled, onRequestClose]
  );

  const openY = screenHeight - (SHEET_HEIGHT + insets.bottom + 12);
  const closedY = -(SHEET_HEIGHT + insets.top + 80);

  const translateY = Animated.add(
    sheetAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [closedY, openY],
    }),
    dragY
  ).interpolate({
    inputRange: [closedY - SHEET_HEIGHT, openY + SHEET_HEIGHT],
    outputRange: [closedY - SHEET_HEIGHT, openY + SHEET_HEIGHT],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.absoluteWrap} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.sheetContainer,
          {
            height: SHEET_HEIGHT + insets.top + insets.bottom + 12,
            paddingBottom: insets.bottom + 40,
            paddingTop: 0,
            transform: [{ translateY }],
            opacity: sheetAnim,
          },
        ]}
        {...panResponder.panHandlers}
        pointerEvents={isOpen ? "auto" : "none"}
        onLayout={(e) => {
          onLayout?.(e);
          const { width, height } = e.nativeEvent.layout;
          setContainerSize({ w: width, h: height - (insets.bottom + 40) });
        }}
      >
        <View style={styles.treemap} pointerEvents="box-none">
          {containerSize.w > 0 &&
            renderTreemap({
              items: displayMaterials,
              active: activeMaterial,
              onSelect: onSelectMaterial,
              width: containerSize.w,
              height: containerSize.h,
            })}
        </View>
      </Animated.View>
    </View>
  );
};

type TreemapProps = {
  items: FilterItem[];
  active: string;
  onSelect: (key: string) => void;
  width: number;
  height: number;
};

const palette = ["#3a5f5b", "#2c4b47", "#456d67", "#365752", "#5a8c84"];
const MIN_BLOCK_HEIGHT = 40;

const renderTreemap = ({
  items,
  active,
  onSelect,
  width,
  height,
}: TreemapProps) => {
  if (items.length === 0) return null;

  const left: FilterItem[] = [];
  const right: FilterItem[] = [];
  let sumLeft = 0;
  let sumRight = 0;
  items.forEach((m) => {
    if (sumLeft <= sumRight) {
      left.push(m);
      sumLeft += m.count || 1;
    } else {
      right.push(m);
      sumRight += m.count || 1;
    }
  });

  const colWidth = width / 2;

  const placeColumn = (col: FilterItem[], colSum: number, x: number, paletteOffset: number) => {
    const factor = colSum > 0 ? height / colSum : 0;
    let y = 0;
    return col.map((m, idx) => {
      const isActive = active === m.key;
      let h = Math.max(MIN_BLOCK_HEIGHT, (m.count || 1) * factor);
      const isLast = idx === col.length - 1;
      if (isLast) {
        h = height - y;
      }
      const rect = (
        <TouchableOpacity
          key={`${m.key}-${x}-${idx}`}
          style={[
            styles.treemapBlock,
            {
              position: "absolute",
              left: x,
              top: y,
              width: colWidth,
              height: h,
              backgroundColor: isActive ? "#7bd7cc" : palette[(paletteOffset + idx) % palette.length],
              opacity: isActive ? 0.94 : 0.82,
            },
          ]}
          onPress={() => onSelect(m.key)}
          accessibilityRole="button"
        >
          <Text
            style={styles.cardLabel}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
            ellipsizeMode="clip"
            maxFontSizeMultiplier={1.1}
          >
            {m.label}
          </Text>
        </TouchableOpacity>
      );
      y += h;
      return rect;
    });
  };

  return (
    <>
      {placeColumn(left, sumLeft, 0, 0)}
      {placeColumn(right, sumRight, colWidth, left.length)}
    </>
  );
};

const styles = StyleSheet.create({
  absoluteWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  sheetContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(22, 32, 35, 0.96)",
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    paddingHorizontal: 0,
    paddingBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 12,
  },
  treemap: {
    width: "100%",
    height: "100%",
    position: "relative",
    overflow: "hidden",
  },
  treemapBlock: {
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#1f2a29",
    justifyContent: "flex-start",
  },
  cardLabel: {
    color: "#e7f2ef",
    fontWeight: "700",
    marginBottom: 6,
  },
});
