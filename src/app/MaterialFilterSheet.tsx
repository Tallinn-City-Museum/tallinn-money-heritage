import React, { JSX, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialStat, AggregatedCoinMeta } from "../data/entity/aggregated-meta";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const SHEET_HEIGHT = Math.max(screenHeight * 0.16, 160);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const [modalSize, setModalSize] = useState({ w: 0, h: 0 });
  const [showOthers, setShowOthers] = useState(false);

  const { primaryItems, otherItems, activeKeyForPrimary } = useMemo(() => {
    const filtered = [...materials].sort((a, b) => (b.count || 0) - (a.count || 0));

    const primary = filtered.slice(0, 6);
    const others = filtered.slice(6);

    if (others.length === 0) {
      return { primaryItems: primary, otherItems: [], activeKeyForPrimary: activeMaterial };
    }

    const otherCount = Math.max(
      1,
      others.reduce((sum, item) => sum + (item.count || 1), 0)
    );

    const withOther = [...primary, { key: "__other__", label: "Muud", count: otherCount }];
    const activeInPrimary = withOther.some((m) => m.key === activeMaterial)
      ? activeMaterial
      : others.some((m) => m.key === activeMaterial)
        ? "__other__"
        : activeMaterial;

    const normalizedActive = activeInPrimary;

    return { primaryItems: withOther, otherItems: others, activeKeyForPrimary: normalizedActive };
  }, [materials, activeMaterial]);

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
        onMoveShouldSetPanResponder: (_, gesture) => !dragDisabled && Math.abs(gesture.dy) > 3,
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

  const normalizedActiveForOthers = activeMaterial;

  return (
    <View style={styles.absoluteWrap} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.sheetContainer,
          {
            height: SHEET_HEIGHT + insets.top + insets.bottom + 4,
            paddingBottom: insets.bottom,
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
          setContainerSize({ w: width, h: height - (insets.bottom) });
        }}
      >
        <View style={styles.treemap} pointerEvents="box-none">
          {containerSize.w > 0 &&
            renderTreemap({
              items: primaryItems,
              active: activeKeyForPrimary,
              onSelect: (key) => {
                if (key === "__other__") {
                  setShowOthers(true);
                  return;
                }
                  const next = key === activeMaterial ? "" : key;
                  onSelectMaterial(next);
                },
              width: containerSize.w,
              height: containerSize.h,
            })}
        </View>
      </Animated.View>

      <Modal
        transparent
        visible={showOthers}
        animationType="fade"
        onRequestClose={() => setShowOthers(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowOthers(false)}>
          <View
            style={styles.modalCard}
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => {
              e.stopPropagation();
            }}
          >
            <Text style={styles.modalTitle}>Muud materjalid</Text>
            <View style={styles.modalTreemapWrap}>
              <View
                style={StyleSheet.absoluteFillObject}
                pointerEvents="none"
                onLayout={(e) => {
                  const { width, height } = e.nativeEvent.layout;
                  setModalSize({ w: width, h: height });
                }}
              />
              {otherItems.length > 0 &&
                renderTreemap({
                  items: otherItems,
                  active: normalizedActiveForOthers,
                  onSelect: (key) => {
                    const next = key === activeMaterial ? "" : key;
                    onSelectMaterial(next);
                  },
                  width:
                    modalSize.w > 0
                      ? modalSize.w
                      : containerSize.w > 0
                        ? containerSize.w
                        : Dimensions.get("window").width * 0.8,
                  height:
                    modalSize.h > 0
                      ? modalSize.h
                      : containerSize.h > 0
                        ? Math.max(200, containerSize.h * 0.8)
                        : Dimensions.get("window").height * 0.5,
                })}
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

type TreemapProps = {
  items: AggregatedCoinMeta[];
  active: string;
  onSelect: (key: string) => void;
  width: number;
  height: number;
};

const palette = ["#3a5f5b", "#2c4b47", "#456d67", "#365752", "#5a8c84"];
const MIN_BLOCK_HEIGHT = 40;
const MIN_BLOCK_WIDTH = 40;
const sumCounts = (items: AggregatedCoinMeta[]) =>
  items.reduce((sum, item) => sum + (item.count || 1), 0);

const renderTreemap = ({
  items,
  active,
  onSelect,
  width,
  height,
}: TreemapProps) => {
  if (items.length === 0) return null;

  const renderSlice = (
    slice: AggregatedCoinMeta[],
    x: number,
    y: number,
    w: number,
    h: number,
    horizontal: boolean,
    paletteOffset: number
  ): JSX.Element[] => {
    if (slice.length === 0) return [];
    if (slice.length === 1) {
      const m = slice[0];
      const isActive = active === m.key;
      return [
        <TouchableOpacity
          key={`${m.key}-${x}-${y}`}
          style={[
            styles.treemapBlock,
            {
              position: "absolute",
              left: x,
              top: y,
              width: Math.max(MIN_BLOCK_WIDTH, w),
              height: Math.max(MIN_BLOCK_HEIGHT, h),
              backgroundColor: isActive ? "#7bd7cc" : palette[paletteOffset % palette.length],
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
        </TouchableOpacity>,
      ];
    }

    const total = sumCounts(slice);
    let splitIdx = 1;
    let running = 0;
    let bestDiff = Number.MAX_VALUE;
    slice.forEach((item, idx) => {
      running += item.count || 1;
      const diff = Math.abs(running / total - 0.5);
      if (diff < bestDiff && idx < slice.length - 1) {
        bestDiff = diff;
        splitIdx = idx + 1;
      }
    });

    const first = slice.slice(0, splitIdx);
    const second = slice.slice(splitIdx);
    const firstWeight = sumCounts(first);
    const secondWeight = total - firstWeight;

    const nodes: JSX.Element[] = [];
    if (horizontal) {
      const firstW = w * (firstWeight / total);
      const secondW = w - firstW;
      nodes.push(
        ...renderSlice(first, x, y, firstW, h, !horizontal, paletteOffset),
        ...renderSlice(second, x + firstW, y, secondW, h, !horizontal, paletteOffset + first.length)
      );
    } else {
      const firstH = h * (firstWeight / total);
      const secondH = h - firstH;
      nodes.push(
        ...renderSlice(first, x, y, w, firstH, !horizontal, paletteOffset),
        ...renderSlice(second, x, y + firstH, w, secondH, !horizontal, paletteOffset + first.length)
      );
    }

    return nodes;
  };

  return <>{renderSlice(items, 0, 0, width, height, true, 0)}</>;
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "rgba(22, 32, 35, 0.96)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 16,
  },
  modalTitle: {
    color: "#e7f2ef",
    fontWeight: "800",
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
  },
  modalTreemapWrap: {
    width: "100%",
    aspectRatio: 1,
    maxHeight: 360,
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
