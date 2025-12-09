import React from "react";
import { render, screen } from "@testing-library/react-native";
import { Animated } from "react-native";
import { InfoBottomSheet } from "../components/common/InfoBottomSheet";
import { CoinSide } from "../data/entity/coin";

describe("InfoBottomSheet – personal logging", () => {
    const baseCoin: any = {
        id: 1,
        name: "Test münt",
        muisId: "MUIS-1",
        date: "1900",
        region: "EE",
        diameter: 25.4,
        material: "silver",
        headImageResource: "heads.png",
        tailsImageResource: "tails.png",
    };

    const createAnimatedValues = () => ({
        dragY: new Animated.Value(0),
        bottomSheetAnim: new Animated.Value(1), // 1 => sheet is fully visible
    });

    test("before first flip wallet section is hidden, after flip it is shown", () => {
        const { dragY, bottomSheetAnim } = createAnimatedValues();

        // --- BEFORE FLIP: no flippedAt, no prediction ---
        const beforeCoin = {
            ...baseCoin,
            flippedAt: "", // no wallet data yet
            prediction: null,
        };

        const { rerender } = render(
        <InfoBottomSheet
            coin={beforeCoin}
            onClose={jest.fn()}
            dragY={dragY}
            bottomSheetAnim={bottomSheetAnim}
        />
        );

        // Wallet section must NOT be visible before first flip
        expect(screen.queryByText("Rahakotti lisatud")).toBeNull();
        expect(screen.queryByText("Esimene ennustus")).toBeNull();

        // --- AFTER FLIP: coin has flippedAt + prediction ---
        const afterCoin = {
            ...baseCoin,
            flippedAt: new Date().toISOString(),
            prediction: CoinSide.HEADS,
        };

        rerender(
        <InfoBottomSheet
            coin={afterCoin}
            onClose={jest.fn()}
            dragY={dragY}
            bottomSheetAnim={bottomSheetAnim}
        />
        );

        // Wallet section must now be visible
        expect(screen.getByText("Rahakotti lisatud")).toBeTruthy();
        expect(screen.getByText("Esimene ennustus")).toBeTruthy();

        // Optional: also check formatted prediction text ("Avers" for HEADS)
        expect(screen.getByText("Avers")).toBeTruthy();
    });
});