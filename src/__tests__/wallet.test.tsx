import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react-native";
import * as RN from "react-native";
import Wallet from "../app/wallet";
import { CoinSide } from "../data/entity/coin";

// mocks
jest.mock("expo-router", () => ({
    useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
    useLocalSearchParams: () => ({}),
}));

jest.mock("react-native-safe-area-context", () => ({
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Uses globalThis so the factory doesn't close over out-of-scope variables
jest.mock("../context/wallet-context", () => ({
    useWallet: () => ({
        coins: (globalThis as any).__mockCoins || [],
        updateCoinPosition: (globalThis as any).__mockUpdateCoinPosition || (() => {}),
    }),
}));

// Helper to create a simple PanResponder object for the component
const mockPanCreateImpl = (cfg: any) => ({
    panHandlers: {
        onStartShouldSetPanResponder: cfg?.onStartShouldSetPanResponder,
        onMoveShouldSetPanResponder: cfg?.onMoveShouldSetPanResponder,
        onStartShouldSetPanResponderCapture: cfg?.onStartShouldSetPanResponderCapture,
        onMoveShouldSetPanResponderCapture: cfg?.onMoveShouldSetPanResponderCapture,
        onPanResponderGrant: cfg?.onPanResponderGrant,
        onPanResponderMove: cfg?.onPanResponderMove,
        onPanResponderRelease: cfg?.onPanResponderRelease,
        onPanResponderTerminate: cfg?.onPanResponderTerminate,
        onPanResponderTerminationRequest: cfg?.onPanResponderTerminationRequest,
    },
});

let panCreateSpy: jest.SpyInstance;

const flush = () => new Promise((r) => setImmediate(r));

beforeEach(() => {
    jest.clearAllMocks();
    (globalThis as any).__mockCoins = [];
    (globalThis as any).__mockUpdateCoinPosition = jest.fn();

    // spy on RN.PanResponder.create
    panCreateSpy = jest
        .spyOn(RN.PanResponder, "create")
        .mockImplementation(mockPanCreateImpl as any);
});

afterEach(() => {
    panCreateSpy?.mockRestore();
});

describe("Wallet screen", () => {
    test("shows empty state texts when there are no coins", async () => {
        render(<Wallet />);
        await flush();

        await waitFor(() => {
            expect(screen.getByText("Minu Rahakott")).toBeTruthy();
            expect(screen.getByText("Rahakott on tühi")).toBeTruthy();
            expect(screen.getByText("Viska münte, et neid lisada rahakotti!")).toBeTruthy();
        });
    });

    test("dragging a coin calls updateCoinPosition with new coordinates", async () => {
        (globalThis as any).__mockCoins = [
        {
            id: "c1",
            title: "Test Coin",
            x: 10,
            y: 20,
            side: CoinSide.HEADS,
            headImageResource: "heads.png",
            tailsImageResource: "tails.png",
            diameterMm: 25,
        },
        ];

        render(<Wallet />);
        await flush();

        // Find the PanResponder config that DraggableCoin created
        const allCalls = panCreateSpy.mock.calls as Array<[any]>;
        const cfg = allCalls.map((c) => c[0]).find((c) => typeof c?.onPanResponderGrant === "function");
        expect(cfg).toBeTruthy();

        // Simulate a drag; wrap callback invocations in act()
        await act(async () => {
        cfg!.onPanResponderGrant?.();
        cfg!.onPanResponderRelease?.(null as any, { dx: 30, dy: 15 } as any);
        await flush();
        });

        const updateCoinPositionMock = (globalThis as any).__mockUpdateCoinPosition as jest.Mock;
        await waitFor(() => {
            // initial (10,20) + (30,15) => (40,35)
            expect(updateCoinPositionMock).toHaveBeenCalledWith("c1", 40, 35);
            expect(updateCoinPositionMock).toHaveBeenCalledTimes(1);
        });
    });
});
