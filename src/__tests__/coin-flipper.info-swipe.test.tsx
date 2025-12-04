import React from "react";
import { render, screen, waitFor } from "@testing-library/react-native";
import * as RN from "react-native";
import Flipper from "../app/coin-flipper";

// Mock wallet context so the flipper has a coin to work with
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

// Mock coin service
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

// Mock safe-area so hooks and provider do not crash in the test environment
jest.mock("react-native-safe-area-context", () => {
    const actual = jest.requireActual("react-native-safe-area-context");
    return {
        ...actual,
        useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
        SafeAreaProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
    };
});

// Mock expo-router navigation hooks
jest.mock("expo-router", () => ({
    useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
    useLocalSearchParams: () => ({})
}));

// Mock navigation focus hook
jest.mock("@react-navigation/native", () => ({
    useFocusEffect: (cb: any) => cb && cb()
}));

// Mock Toast so no real UI is rendered
jest.mock("react-native-toast-message", () => ({
    __esModule: true,
    default: { show: jest.fn() }
}));

// Mock tutorial overlay away
jest.mock("../components/tutorial/first-run-tutorial", () => ({
    FirstRunTutorial: () => null
}));

// Mock BottomArea – not relevant for this test, we only need a simple marker
jest.mock("../components/specific/coin-flipper/bottom-area", () => {
    const React = require("react");
    const { Text } = require("react-native");
    return {
        BottomArea: () => <Text testID="bottom-area">Bottom</Text>
    };
});

// Mock InfoBottomSheet with a simple View so we can assert that it appears
jest.mock("../components/common/InfoBottomSheet", () => {
    const React = require("react");
    const { View } = require("react-native");
    return {
        InfoBottomSheet: () => <View testID="info-sheet" />
    };
});

// We will spy on PanResponder.create to capture the config
let panCreateSpy: jest.SpyInstance;

beforeEach(() => {
    jest.clearAllMocks();
    // Replace RN.PanResponder.create with a spy that records the config,
    // but still returns an object with panHandlers so code does not crash
    panCreateSpy = jest
        .spyOn(RN.PanResponder, "create")
        .mockImplementation((cfg: any) => ({
            panHandlers: {},
            _cfg: cfg
        }));
});

afterEach(() => {
    panCreateSpy?.mockRestore();
});

// Small helper to flush pending microtasks and timers
const flush = () => new Promise((r) => setImmediate(r));

describe("Coin flipper – info bottom sheet", () => {
    test("swiping up opens the info sheet", async () => {
        render(<Flipper />);
        await flush();

        // Inspect all calls to PanResponder.create and find the one
        // that looks like the full-screen swipeResponder (it has
        // both onMoveShouldSetPanResponder and onPanResponderRelease)
        const allCalls = panCreateSpy.mock.calls as Array<[any]>;
        const swipeCfg = allCalls
            .map((c) => c[0])
            .find(
                (cfg) =>
                    typeof cfg?.onMoveShouldSetPanResponder === "function" &&
                    typeof cfg?.onPanResponderRelease === "function"
            );

        expect(swipeCfg).toBeTruthy();

        // Simulate an upward swipe: dy < -80 and |dy| > |dx|
        swipeCfg!.onPanResponderRelease?.(
            null as any,
            { dx: 0, dy: -120 } as any
        );

        // After the swipe, the mocked InfoBottomSheet should be rendered
        await waitFor(() => {
            expect(screen.getByTestId("info-sheet")).toBeTruthy();
        });
    });
});
