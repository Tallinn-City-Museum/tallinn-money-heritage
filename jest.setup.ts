// jest.setup.ts
import "@testing-library/jest-native/extend-expect";

import "react-native-gesture-handler"; // just to ensure module is loaded

import mockAsyncStorage from "@react-native-async-storage/async-storage/jest/async-storage-mock";

// AsyncStorage mock
jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);

// Helpful with RN
jest.mock("react-native-reanimated", () => require("react-native-reanimated/mock"));

// Tells Jest to use manual __mocks__/react-native-gesture-handler
jest.mock("react-native-gesture-handler");
