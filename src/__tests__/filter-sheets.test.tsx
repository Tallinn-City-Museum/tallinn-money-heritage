import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { View } from "react-native";
import HorizontalFilterSheet from "../components/common/treemap/horizontal-filter-sheet";
import VerticalFilterSheet from "../components/common/treemap/vertical-filter-sheet";

// Mock @react-navigation/elements Text so it does not require a theme / NavigationContainer
jest.mock("@react-navigation/elements", () => {
    const RN = jest.requireActual("react-native");
    return {
        __esModule: true,
        Text: RN.Text,
    };
});

// Safe-area mock so useSafeAreaInsets works in tests without a real provider
jest.mock("react-native-safe-area-context", () => {
    const actual = jest.requireActual("react-native-safe-area-context");
    return {
        ...actual,
        useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
        SafeAreaProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    };
});

// Treemap bucketing mock so we fully control items & pages for the filter sheets
// Labels are coin-themed, keys are simple A/B/OTHER/BACK
const mockBuckets = [
    [
        { key: "A", label: "Copper coins", count: 10, available: true },
        { key: "__OTHER__", label: "More coins", count: 1, available: true },
    ],
    [
        { key: "B", label: "Silver coins", count: 5, available: true },
        { key: "__BACK__", label: "Back to main list", count: 1, available: true },
    ],
];

jest.mock("@/src/utils/treemap-bucketing", () => {
    const buildTreemapBuckets = jest.fn(() => mockBuckets);
    const BACK_KEY = "__BACK__";
    const OTHER_KEY = "__OTHER__";

    return {
        __esModule: true,
        default: buildTreemapBuckets,
        BACK_KEY,
        OTHER_KEY,
    };
});

describe("HorizontalFilterSheet", () => {
    test("calls onSelect for a regular treemap block", () => {
        const onSelect = jest.fn();

        render(
            <HorizontalFilterSheet
                enabled={true}
                metas={[]}
                activeKey=""
                onSelect={onSelect}
                displayHeightRatio={0.2}
            />
        );

        // TreemapBlock sets accessibilityRole="button"
        const buttons = screen.getAllByRole("button");
        expect(buttons.length).toBeGreaterThanOrEqual(2);

        // With our mock buckets, the first button corresponds to key "A" (Copper coins)
        fireEvent.press(buttons[0]);

        expect(onSelect).toHaveBeenCalledWith("A");
        expect(onSelect).toHaveBeenCalledTimes(1);
    });

    test("navigates between pages when OTHER/BACK blocks are pressed", () => {
        const onSelect = jest.fn();

        render(
            <HorizontalFilterSheet
                enabled={true}
                metas={[]}
                activeKey=""
                onSelect={onSelect}
                displayHeightRatio={0.1}
            />
        );

        // Page 0: "Copper coins" + "More coins"
        expect(screen.getByText("Copper coins")).toBeTruthy();
        expect(screen.getByText("More coins")).toBeTruthy();
        expect(screen.queryByText("Silver coins")).toBeNull();

        const buttonsPage0 = screen.getAllByRole("button");
        // In our mock: [0] => key "A" (Copper coins), [1] => OTHER ("More coins")
        fireEvent.press(buttonsPage0[1]);

        // Page 1: "Silver coins" + "Back to main list"
        expect(screen.getByText("Silver coins")).toBeTruthy();
        expect(screen.getByText("Back to main list")).toBeTruthy();
        expect(screen.queryByText("Copper coins")).toBeNull();

        const buttonsPage1 = screen.getAllByRole("button");
        // In our mock: [0] => key "B" (Silver coins), [1] => BACK ("Back to main list")
        fireEvent.press(buttonsPage1[1]);

        // Back to page 0
        expect(screen.getByText("Copper coins")).toBeTruthy();
        expect(screen.getByText("More coins")).toBeTruthy();
        expect(screen.queryByText("Silver coins")).toBeNull();

        // OTHER/BACK should not be forwarded to onSelect
        expect(onSelect).not.toHaveBeenCalled();
    });

    test("applies at least the minimum height when displayHeightRatio is very small", () => {
        // MIN_HEIGHT inside HorizontalFilterSheet is 100; using a tiny ratio ensures
        // screenHeight * ratio is below that on any realistic device
        const displayHeightRatio = 0.01;

        const { UNSAFE_getAllByType } = render(
            <HorizontalFilterSheet
                enabled={true}
                metas={[]}
                activeKey=""
                onSelect={() => {}}
                displayHeightRatio={displayHeightRatio}
            />
        );

        // The outermost View created by HorizontalFilterSheet is the first View
        const rootView = UNSAFE_getAllByType(View)[0];

        // style is an array: [stylesheet.sheetContainer, { height: sheetHeight }]
        const styleArray = Array.isArray(rootView.props.style)
            ? rootView.props.style
            : [rootView.props.style];

        const heightStyle = styleArray.find(
            (s: any) => s && typeof s.height === "number"
        );

        expect(heightStyle).toBeDefined();
        // We only check that height is at least the known MIN_HEIGHT (100)
        expect(heightStyle!.height).toBeGreaterThanOrEqual(100);
    });
});

describe("VerticalFilterSheet", () => {
    test("forwards selection from treemap blocks to onSelect", () => {
        const onSelect = jest.fn();

        render(
            <VerticalFilterSheet
                enabled={true}
                metas={[]}
                activeKey=""
                onSelect={onSelect}
                displayWidthRatio={0.4}
                height={200}
            />
        );

        const buttons = screen.getAllByRole("button");
        expect(buttons.length).toBeGreaterThan(0);

        // First block is key "A" (Copper coins) from our mock buckets
        fireEvent.press(buttons[0]);

        expect(onSelect).toHaveBeenCalledWith("A");
        expect(onSelect).toHaveBeenCalledTimes(1);
    });

    test("toggles pointerEvents based on enabled prop", () => {
        const { rerender, UNSAFE_getAllByType } = render(
            <VerticalFilterSheet
                enabled={true}
                metas={[]}
                activeKey=""
                onSelect={() => {}}
                displayWidthRatio={0.4}
                height={200}
            />
        );

        let rootView = UNSAFE_getAllByType(View)[0];
        expect(rootView.props.pointerEvents).toBe("auto");

        rerender(
            <VerticalFilterSheet
                enabled={false}
                metas={[]}
                activeKey=""
                onSelect={() => {}}
                displayWidthRatio={0.4}
                height={200}
            />
        );

        rootView = UNSAFE_getAllByType(View)[0];
        expect(rootView.props.pointerEvents).toBe("none");
    });
});
