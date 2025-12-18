import { AggregatedCoinMeta } from "@/src/data/entity/aggregated-meta";
import { JSX } from "react";
import TreemapBlock from "./block";

// Color scheme constants
// you can modify them as needed
const BG_ACTIVE = "#7bd7cc";
const BG_AVAILABLE = "#365752";
const BG_UNAVAILABLE = "#1f2a29";

const OPACITY_ACTIVE = 0.94;
const OPACITY_AVAILABLE = 0.82;
const OPACITY_UNAVAILABLE = 0.35;

const FG_LABEL_AVAILABLE = "#e7f2ef";
const FG_LABEL_UNAVAILABLE = "#7a8c88";

export interface TreemapProps {
    items: AggregatedCoinMeta[];
    activeKey: string;
    onSelect: (key: string) => void;
    width: number;
    height: number;
    horizontal: boolean;
}

/**
 * The bread and butter function, which will render treemap blocks.
 * PS! This function is recursive and not very performant on large
 * sets of data.
 *
 * TODO: Implement the same function but without recursion
 *
 * @param slice specifies an array of AggregatedCoinMetas
 * @param x specifies the absolute position x for the block
 * @param y specifies the absolute position y for the block
 * @param w specifies the width of the block
 * @param h specifies the height of the block
 * @param active specifies the key which is currently active
 * @param horizontal boolean flag which determines whether the splitting should be done horizontally or vertically
 * @param onSelect callback function which gets called whenever the block is selected
 * @returns an array of TreemapBlock components
 */
function renderSlice(
    slice: AggregatedCoinMeta[],
    x: number,
    y: number,
    w: number,
    h: number,
    active: string,
    horizontal: boolean,
    onSelect: (key: string) => void
): JSX.Element[] {
    // base cases in recursion
    if (slice.length === 0) return [];
    if (slice.length === 1) {
        const m = slice[0]
        const isActive = active == m.key;
        const isAvailable = m.available ?? true;
        const onSelectBlock = () => {
            if (!isAvailable) return;
            onSelect(m.key);
        }

        return [
            <TreemapBlock
                key={m.key}
                keyValue={m.key}
                label={m.label}
                x={x}
                y={y}
                w={w}
                h={h}
                onSelect={onSelectBlock}
                backgroundColor={isActive ? BG_ACTIVE : (isAvailable ? BG_AVAILABLE : BG_UNAVAILABLE)}
                opacity={isActive ? OPACITY_ACTIVE : (isAvailable ? OPACITY_AVAILABLE : OPACITY_UNAVAILABLE)}
                labelColor={isAvailable ? FG_LABEL_AVAILABLE : FG_LABEL_UNAVAILABLE}
                disabled={!isAvailable}
            />
        ]
    }

    const totalElementCount = slice.reduce((a, b) => a + b.count, 0)

    // find split closest to half the total weight for more balanced rectangles
    let splitIdx = 1;
    let running = 0;
    let bestDiff = Number.MAX_VALUE;
    slice.forEach((item, idx) => {
        running += item.count || 1;
        const diff = Math.abs(running / totalElementCount - 0.5);
        if (diff < bestDiff && idx < slice.length - 1) {
            bestDiff = diff;
            splitIdx = idx + 1;
        }
    });

    const firstSlice = slice.slice(0, splitIdx);
    const secondSlice = slice.slice(splitIdx);
    const firstWeight = firstSlice.reduce((a, b) => a + b.count, 0);

    const nodes: JSX.Element[] = [];

    if (horizontal) {
        const firstW = w * (firstWeight / totalElementCount);
        const secondW = w - firstW;

        nodes.push(
            ...renderSlice(firstSlice, x, y, firstW, h, active, !horizontal, onSelect),
            ...renderSlice(secondSlice, x + firstW, y, secondW, h, active, !horizontal, onSelect)
        );
    } else {
        const firstH = h * (firstWeight / totalElementCount);
        const secondH = h - firstH;

        nodes.push(
            ...renderSlice(firstSlice, x, y, w, firstH, active, !horizontal, onSelect),
            ...renderSlice(secondSlice, x, y + firstH, w, secondH, active, !horizontal, onSelect)
        );
    }

    return nodes;
}

/**
 * The base Treemap component, which can be used as a base
 * for complex treemap graphs
 */
export default function BaseTreemap({
    items,
    activeKey,
    onSelect,
    width,
    height,
    horizontal = true
}: TreemapProps) {
    // Return an empty element if no items are present
    if (items.length === 0)
        return <></>;

    return <>{renderSlice(items, 0, 0, width, height, activeKey, horizontal, onSelect)}</>
}