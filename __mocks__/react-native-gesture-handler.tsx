import React from "react";
import { TouchableOpacity, View } from "react-native";

export const State = {
    END: "END",
    ACTIVE: "ACTIVE",
    CANCELLED: "CANCELLED",
    FAILED: "FAILED",
};

// TapGestureHandler: behaves like a TouchableOpacity that fires onHandlerStateChange(END)
export const TapGestureHandler = ({
    onHandlerStateChange,
    children,
    testID,
}: any) => (
    <TouchableOpacity
        testID={testID}
        onPress={() =>
        onHandlerStateChange &&
        onHandlerStateChange({ nativeEvent: { state: State.END } })
    }
    >
        {children}
    </TouchableOpacity>
);

// PinchGestureHandler: onPress simulates a big pinch (scale 10) then END
export const PinchGestureHandler = ({
    onGestureEvent,
    onHandlerStateChange,
    children,
    testID,
}: any) => (
    <TouchableOpacity
        testID={testID}
        onPress={() => {
            onGestureEvent &&
                onGestureEvent({ nativeEvent: { scale: 10 } });
            onHandlerStateChange &&
                onHandlerStateChange({ nativeEvent: { state: State.END } });
        }}
        >
        {children}
        </TouchableOpacity>
);

// Tests don’t need to simulate rotation/pan; they just need to render children
export const RotationGestureHandler = ({ children, testID }: any) => (
    <View testID={testID}>{children}</View>
);

export const PanGestureHandler = ({ children, testID }: any) => (
    <View testID={testID}>{children}</View>
);

// Export anything else the app might import (no-op)
export const Directions = {};
export const GestureHandlerRootView = ({ children }: any) => (
    <View>{children}</View>
);

export default {
    State,
    TapGestureHandler,
    PinchGestureHandler,
    RotationGestureHandler,
    PanGestureHandler,
    Directions,
    GestureHandlerRootView,
};
