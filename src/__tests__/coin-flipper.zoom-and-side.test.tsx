import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";

import Flipper from "../app/coin-flipper";

// Mocks

// 1) Wallet: provides a ready coin via an array reference
jest.mock("../context/wallet-context", () => {
    const mockCoins = [
        {
            id: "test-coin",
            title: "test coin",
            diameterMm: 25.4,
            headImageResource: "heads.png",
            tailsImageResource: "tails.png",
            side: 0,
            flippedAt: "",
            prediction: null,
            x: 0,
            y: 0,
        },
    ];

    return {
        useWallet: () => ({
            addCoin: jest.fn(),
            coins: mockCoins, // same array instance on every render
        }),
    };
});

// 2) coin-service
jest.mock("../service/coin-service", () => ({
    coinService: {
        generateNewCoin: jest.fn(),
    },
}));

// 3) Safe area
jest.mock("react-native-safe-area-context", () => {
    const actual = jest.requireActual("react-native-safe-area-context");
    return {
        ...actual,
        useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
        SafeAreaProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    };
});

// 4) Router + nav: coinId set so Flipper uses wallet coin, not fetchData()
jest.mock("expo-router", () => ({
    useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
    useLocalSearchParams: () => ({ coinId: "test-coin" }),
}));

jest.mock("@react-navigation/native", () => ({
    useFocusEffect: (cb: any) => cb && cb(),
}));

// 5) Toast
jest.mock("react-native-toast-message", () => ({
    __esModule: true,
    default: { show: jest.fn() },
}));

// 6) BottomArea
jest.mock("../components/specific/coin-flipper/bottom-area", () => {
    const React = require("react");
    const { Text } = require("react-native");

    return {
        BottomArea: ({ side }: { side: any }) =>
            React.createElement(
                Text,
                { testID: "bottom-area" },
                `Side:${String(side)}`
            ),
    };
});

// 7) InfoBottomSheet + tutorial
jest.mock("../components/common/InfoBottomSheet", () => ({
    InfoBottomSheet: () => null,
}));

jest.mock("../components/tutorial/first-run-tutorial", () => ({
    FirstRunTutorial: () => null,
}));

describe("Coin flipper – side change & zoom", () => {
    test("changes displayed side in BottomArea when coin is tapped", async () => {
        render(<Flipper />);

        // Wait until the coin tree is mounted
        const tapZone = await screen.findByTestId("coin-tap");

        // Initially no result => BottomArea not rendered
        expect(screen.queryByTestId("bottom-area")).toBeNull();

        // First tap: sets lastResult and renders BottomArea
        fireEvent.press(tapZone);

        const bottomArea1 = await screen.findByTestId("bottom-area");
        const text1 = (bottomArea1.props as any).children;

        // Second tap: side toggles => text must change
        fireEvent.press(tapZone);

        await waitFor(() => {
            const bottomArea2 = screen.getByTestId("bottom-area");
            const text2 = (bottomArea2.props as any).children;
            expect(text2).not.toEqual(text1);
        });
    });

    test("hides BottomArea when zoomed in via pinch", async () => {
        render(<Flipper />);

        const tapZone = await screen.findByTestId("coin-tap");

        // First tap → BottomArea visible
        fireEvent.press(tapZone);
        const bottomArea = await screen.findByTestId("bottom-area");
        expect(bottomArea).toBeTruthy();

        // Pinch (RNGH mock fires scale=10, END, which sets isZoomed)
        const pinchZone = screen.getByTestId("coin-pinch");
        fireEvent.press(pinchZone);

        await waitFor(() => {
            expect(screen.queryByTestId("bottom-area")).toBeNull();
        });
    });
});
