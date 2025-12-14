import { Text } from "@react-navigation/elements";
import { StyleSheet, TouchableOpacity } from "react-native";

interface TreemapBlockProps {
    key: string;
    label: string;
    x: number;
    y: number;
    w: number;
    h: number;
    onSelect: (key: string) => void;
    backgroundColor: string;
    labelColor: string;
    opacity: number;
    disabled: boolean;
}

// The minimum height that can be given to treemap block
const MIN_BLOCK_HEIGHT = 48;

/**
 * The base block component for drawing a treemap.
 * Treemap blocks are positioned absolutely and its
 * positional props x, y, w, h have to be calculated
 * before using the component
 */
export default function TreemapBlock({
    key,
    label,
    x,
    y,
    w,
    h,
    onSelect,
    backgroundColor,
    labelColor,
    opacity,
    disabled = false
}: TreemapBlockProps) {
    const onPress = () => onSelect(key);

    return (
        <TouchableOpacity
            key={`${key}-${x}-${y}`}
            style={[
                stylesheet.treemapBlock,
                {
                    left: x,
                    top: y,
                    width: w,
                    height: Math.max(MIN_BLOCK_HEIGHT, h),
                    backgroundColor,
                    opacity: opacity
                }
            ]}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={{ disabled: disabled }}
        >
            <Text
                style={[
                    stylesheet.blockLabel,
                    { color: labelColor }
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
                ellipsizeMode="clip"
                maxFontSizeMultiplier={1.1}
            >
                {label}
            </Text>
        </TouchableOpacity>
    )
}

const stylesheet = StyleSheet.create({
    treemapBlock: {
        position: "absolute",
        borderRadius: 4,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: "#1f2a29",
        justifyContent: "flex-start",
    },

    blockLabel: {
        fontWeight: "700",
        marginBottom: 6
    }
})