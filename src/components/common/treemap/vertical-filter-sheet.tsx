import { AggregatedCoinMeta } from "@/src/data/entity/aggregated-meta";
import buildTreemapBuckets, { BACK_KEY, OTHER_KEY } from "@/src/utils/treemap-bucketing";
import { useMemo, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import BaseTreemap from "./treemap";

// Minimum supported width
const MIN_WIDTH = 120;

export interface VerticalFilterSheetProps {
    enabled: boolean;
    metas: AggregatedCoinMeta[];
    activeKey: string;
    onSelect: (key: string) => void;
    displayWidthRatio: number;
    height: number;
}

/**
 * Vertically rendered filter sheet
 */
export default function VerticalFilterSheet({
    enabled,
    metas,
    activeKey,
    onSelect,
    displayWidthRatio,
    height
}: VerticalFilterSheetProps) {
    const screenWidth = Dimensions.get("window").width;
    const sheetWidth = Math.max(screenWidth * displayWidthRatio, MIN_WIDTH);
    const [page, setPage] = useState(0);

    const buckets = useMemo(() => buildTreemapBuckets(metas, 4), [metas])

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
                {
                    width: sheetWidth,
                    height: height
                }
            ]}
            pointerEvents={enabled ? "auto" : "none"}
        >
            <View style={stylesheet.treemap}>
                <BaseTreemap
                    items={buckets[page]}
                    activeKey={activeKey}
                    onSelect={onTreemapSelect}
                    width={sheetWidth}
                    height={height}
                    horizontal={false}
                />
            </View>
        </View>
    )
}

const stylesheet = StyleSheet.create({
    treemap: {
        width: "100%",
        height: "100%",
        overflow: "hidden"
    }
})