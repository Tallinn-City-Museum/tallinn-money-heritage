// Centered modal for offline / network errors

import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { networkStyles } from "./stylesheet";

interface NetworkErrorModalProps {
    visible: boolean;
    message: string | null;
    onRetry: () => void;
}

export const NetworkErrorModal: React.FC<NetworkErrorModalProps> = ({
    visible,
    message,
    onRetry,
}) => {
    if (!visible) {
        return null;
    }

    return (
        <Modal
            transparent
            animationType="fade"
            visible={visible}
        >
            <View style={networkStyles.offlineBackdrop}>
                <View style={networkStyles.offlineContainer}>
                    <Text style={networkStyles.offlineTitle}>
                        Võrguühendus puudub
                    </Text>
                    <Text style={networkStyles.offlineMessage}>
                        {message ??
                            "Ei saanud serveriga ühendust. Kontrolli internetti ja proovi uuesti."}
                    </Text>

                    <TouchableOpacity
                        style={networkStyles.offlineButton}
                        onPress={onRetry}
                    >
                        <Text style={networkStyles.offlineButtonText}>
                            Proovi uuesti
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};
