import React from "react";
import {
    render,
    screen,
    waitFor,
    fireEvent,
    act
} from "@testing-library/react-native";
import {
    RotationGestureHandler,
    State
} from "react-native-gesture-handler";
import Flipper from "../app/coin-flipper";

// 1) Wallet mock – provides a single coin so Flipper can render normally
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
            y: 0
        }
    ];

    return {
        useWallet: () => ({
            addCoin: jest.fn(),
            coins: mockCoins
        })
    };
});

// 2) coin-service
jest.mock("../service/coin-service", () => ({
    coinService: {
        generateNewCoin: jest.fn().mockResolvedValue({
            id: 1,
            muisId: 1,
            ref: "ref",
            name: "test",
            date: "1900",
            material: "silver",
            diameter: 25.4,
            region: "EE",
            nomValue: "1",
            lemmaName: "lemma",
            headImageResource: "heads.png",
            tailsImageResource: "tails.png"
        })
    }
}));

// 3) Safe area
jest.mock("react-native-safe-area-context", () => {
    const actual = jest.requireActual("react-native-safe-area-context");
    return {
        ...actual,
        useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
        SafeAreaProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
    };
});

// 4) Router
jest.mock("expo-router", () => ({
    useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
    useLocalSearchParams: () => ({})
}));

jest.mock("@react-navigation/native", () => ({
    useFocusEffect: (cb: any) => cb && cb()
}));

// 5) Toast
jest.mock("react-native-toast-message", () => ({
    __esModule: true,
    default: { show: jest.fn() }
}));

// 6) Tutorial – not relevant for this test
jest.mock("../components/tutorial/first-run-tutorial", () => ({
    FirstRunTutorial: () => null
}));

// 7) BottomArea
jest.mock("../components/specific/coin-flipper/bottom-area", () => {
    const React = require("react");
    const { Text } = require("react-native");
    return {
        BottomArea: () => <Text testID="bottom-area">Bottom</Text>
    };
});

// 8) InfoBottomSheet – not relevant for this test
jest.mock("../components/common/InfoBottomSheet", () => ({
    InfoBottomSheet: () => null
}));

const flush = () => new Promise((r) => setImmediate(r));

describe("Coin flipper – rotation only when zoomed", () => {
    test("RotationGestureHandler is enabled only after zooming in", async () => {
        render(<Flipper />);
        await flush();

        // On first render rotation must be disabled (isZoomed = false)
        let rotEl: any = screen.UNSAFE_getByType(RotationGestureHandler);
        expect(rotEl.props.enabled).toBe(false);

        // Simulates pinch-zoom using the same trick as in zoom-and-side test:
        // RNGH jest mock for PinchGestureHandler will interpret 'press' as a pinch
        const pinchZone = await screen.findByTestId("coin-pinch");
        fireEvent.press(pinchZone);

        // After zoom, RotationGestureHandler should be enabled
        await waitFor(() => {
            rotEl = screen.UNSAFE_getByType(RotationGestureHandler);
            expect(rotEl.props.enabled).toBe(true);
        });

        // Additionally, verify that rotation handlers can be called
        const { onGestureEvent, onHandlerStateChange } = rotEl.props;

        await act(async () => {
            // Simulate a non-trivial rotation
            onGestureEvent?.({ nativeEvent: { rotation: 0.5 } });
            onHandlerStateChange?.({
                nativeEvent: { state: State.END, rotation: 0.5 }
            });
        });
    });
});
