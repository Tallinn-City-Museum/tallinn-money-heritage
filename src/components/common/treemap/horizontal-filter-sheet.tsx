import { AggregatedCoinMeta } from "@/src/data/entity/aggregated-meta";
import buildTreemapBuckets, { BACK_KEY, OTHER_KEY } from "@/src/utils/treemap-bucketing";
import { useMemo, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import BaseTreemap from "./treemap";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Minimum supported height
const MIN_HEIGHT = 100;

export interface HorizontalFilterSheetProps {
    enabled: boolean;
    metas: AggregatedCoinMeta[];
    activeKey: string;
    onSelect: (key: string) => void;
    displayHeightRatio: number;
    onLayout?: (e: any) => void;
}

/**
 * Horizontally rendered filter sheet
 */
export default function HorizontalFilterSheet({
    enabled,
    metas,
    activeKey,
    onSelect,
    displayHeightRatio,
    onLayout
}: HorizontalFilterSheetProps) {
    const insets = useSafeAreaInsets();
    const screenHeight = Dimensions.get("window").height - insets.top - insets.bottom;
    const screenWidth = Dimensions.get("window").width - insets.left - insets.right;
    const sheetHeight = Math.max(screenHeight * displayHeightRatio, MIN_HEIGHT);
    const [containerSize, setContainerSize] = useState({ w: screenWidth, h: sheetHeight })
    const [page, setPage] = useState(0)

    const buckets = useMemo(() => buildTreemapBuckets(metas), [metas])

    const onTreemapSelect = (key: string) => {
        if (key === OTHER_KEY)
            setPage(Math.min(page + 1, buckets.length - 1));
        else if (key === BACK_KEY)
            setPage(0);
        else onSelect(key);
    }

    return (
        <View
            style={[
                stylesheet.sheetContainer,
                {
                    height: sheetHeight,
                }
            ]}
            pointerEvents={enabled ? "auto" : "none"}
            onLayout={(e) => {
                onLayout?.(e);
                const { width, height } = e.nativeEvent.layout;
                setContainerSize({ w: width, h: height })
            }}
        >
            <View style={stylesheet.treemap}>
                {containerSize.w > 0 &&
                    <BaseTreemap
                        items={buckets[page]}
                        activeKey={activeKey}
                        onSelect={onTreemapSelect}
                        width={containerSize.w}
                        height={containerSize.h}
                        horizontal={true}
                    />
                }
            </View>
        </View>
    )
}

const stylesheet = StyleSheet.create({
    sheetContainer: {
        width: "100%"
    },

    treemap: {
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden"
    }
})