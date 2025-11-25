// jest.setup.ts
import "@testing-library/jest-native/extend-expect";

import "react-native-gesture-handler"; // just to ensure module is loaded

// AsyncStorage mock (single source of truth)
jest.mock("@react-native-async-storage/async-storage", () =>
    require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// Reanimated mock recommended by RN Reanimated for Jest
jest.mock("react-native-reanimated", () => require("react-native-reanimated/mock"));

// Tells Jest to use manual __mocks__/react-native-gesture-handler
jest.mock("react-native-gesture-handler");

// Silence RN DevMenu TurboModule in Jest (prevents DevMenu errors)
jest.mock("react-native/Libraries/TurboModule/TurboModuleRegistry", () => {
    const actual = jest.requireActual("react-native/Libraries/TurboModule/TurboModuleRegistry");
    return {
        ...actual,
        getEnforcing: (name: string) => {
            if (name === "DevMenu") return {};
            try {
                return actual.getEnforcing(name);
            } catch {
                return {};
            }
        },
    };
});

// Silence Animated & "not wrapped in act(...)" warnings in tests
try {
    // Present in some RN versions; safe no-op if missing
    jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper");
} catch {
    // Ignore for RN versions where the helper doesn't exist (e.g., 0.81+)
}

// React 18: tell RTL we're in an act-enabled env
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

// filter the act() console spam without hiding real errors
const origError = console.error;
console.error = (...args: any[]) => {
    if (typeof args[0] === "string" && args[0].includes("not wrapped in act(")) return;
    origError(...args);
};
