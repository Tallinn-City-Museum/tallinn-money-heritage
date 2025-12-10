// Provides global network status and shows a centered offline popup when there is no internet connection

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { NetworkErrorModal } from "../components/common/NetworkErrorModal";

type NetworkContextValue = {
    isConnected: boolean | null;
    retryCheck: () => void;
};

const NetworkContext = createContext<NetworkContextValue>({
    isConnected: null,
    retryCheck: () => undefined,
});

interface NetworkProviderProps {
    children: ReactNode;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
    const [isConnected, setIsConnected] = useState<boolean | null>(null);
    const [showOfflineModal, setShowOfflineModal] = useState<boolean>(false);

    // Helper to compute "online" state from NetInfo
    const computeOnline = (state: NetInfoState): boolean => {
        const hasConnection = !!state.isConnected;
        const internetReachable =
            state.isInternetReachable === null || !!state.isInternetReachable;
        return hasConnection && internetReachable;
    };

    // Listen to network state changes and show/hide modal
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
            const online = computeOnline(state);
            setIsConnected(online);
            setShowOfflineModal(!online);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    // Retry button: check network again and hide modal if connection is back
    const retryCheck = () => {
        NetInfo.fetch().then((state) => {
            const online = computeOnline(state);
            setIsConnected(online);
            setShowOfflineModal(!online);
        });
    };

    return (
        <NetworkContext.Provider
            value={{
                isConnected,
                retryCheck,
            }}
        >
            {children}
            <NetworkErrorModal
                visible={showOfflineModal}
                message={
                    "Ei saanud serveriga ühendust. Kontrolli internetti ja proovi uuesti."
                }
                onRetry={retryCheck}
            />
        </NetworkContext.Provider>
    );
};

export const useNetwork = (): NetworkContextValue => {
    return useContext(NetworkContext);
};
