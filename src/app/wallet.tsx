import React, { useEffect, useRef, useState, useCallback } from "react";
import { View, Text, Image, Animated, PanResponder, Dimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { NavigationContext } from "@react-navigation/native";
import { useWallet } from "../context/wallet-context";
import { styles } from "../components/common/stylesheet";
import { CoinSide } from "../data/entity/coin";
// TUTORIAL: imports
import { FirstRunTutorial, TutorialProgress, TutorialStepKey } from "../components/tutorial/first-run-tutorial";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Get screen dimensions for centering coin
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const EDGE_BACK_WIDTH = 24; // px from the left edge for the back-swipe

const PROGRESS_KEY = "tutorial.progress";
const RESET_KEY = "tutorial.resetToken";
const WALLET_TUTORIAL_STEPS: TutorialStepKey[] = ["dragCoin", "walletInfo", "last"];

const buildInitialWalletTutorial = (): TutorialProgress => ({
    // Flip-page steps are treated as completed here so wallet-specific steps can show
    filterCoins: true,
    filteringChoice: true,
    filterNavigation: true,
    tapTwice: true,
    zoomedIn: true,
    rotated: true,
    zoomedOut: true,
    doubleTapped: true,
    openedInfo: true,
    // Wallet steps start here:
    swipeWallet: true, // entering Wallet implies swipe already done
    dragCoin: false,
    walletInfo: false,
    last: false,
});

async function loadProgress(): Promise<Partial<TutorialProgress>> {
    try {
        const raw = await AsyncStorage.getItem(PROGRESS_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}
async function saveProgress(update: Partial<TutorialProgress>) {
    try {
        const current = await loadProgress();
        const merged = { ...current, ...update };
        await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(merged));
    } catch {}
}

    // Small hook to check "tutorial.done" and avoid showing the overlay after completion
    function useTutorialDone() {
        const navigation = React.useContext(NavigationContext);
        const [hydrated, setHydrated] = useState(false);
        const [done, setDone] = useState(false);
        const readFlag = async (mountedRef: { current: boolean }) => {
    // Small hook to check "tutorial.done" and avoid showing the overlay after completion
    function useTutorialDone() {
        const navigation = React.useContext(NavigationContext);
        const [hydrated, setHydrated] = useState(false);
        const [done, setDone] = useState(false);
        const readFlag = async (mountedRef: { current: boolean }) => {
            try {
                const v = await AsyncStorage.getItem("tutorial.done");
            if (mountedRef.current) setDone(v === "1");
        } finally {
            if (mountedRef.current) setHydrated(true);
        }
    };

    useEffect(() => {
        const mounted = { current: true };
        readFlag(mounted);
            if (mountedRef.current) setDone(v === "1");
        } finally {
            if (mountedRef.current) setHydrated(true);
        }
    };

    useEffect(() => {
        const mounted = { current: true };
        readFlag(mounted);
        return () => {
            mounted.current = false;
            mounted.current = false;
        };
    }, []);

        // Also refresh when screen gains focus (covers cases where component stays mounted)
        useEffect(() => {
            if (!navigation) return;
            const mounted = { current: true };
            const unsubscribe = navigation.addListener("focus", () => {
                readFlag(mounted);
            });
            return () => {
                mounted.current = false;
                unsubscribe && unsubscribe();
            };
        }, [navigation]);
        return { hydrated, done };
    }

        // Also refresh when screen gains focus (covers cases where component stays mounted)
        useEffect(() => {
            if (!navigation) return;
            const mounted = { current: true };
            const unsubscribe = navigation.addListener("focus", () => {
                readFlag(mounted);
            });
            return () => {
                mounted.current = false;
                unsubscribe && unsubscribe();
            };
        }, [navigation]);
        return { hydrated, done };
    }

export default function Wallet() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const params = useLocalSearchParams<{ teach?: string }>();
    const { coins, updateCoinPosition } = useWallet();
    const navigation = React.useContext(NavigationContext);
    const navigation = React.useContext(NavigationContext);
    const { hydrated: tutHydrated, done: tutorialDone } = useTutorialDone(); // gate overlay
    const [tutorialRunKey, setTutorialRunKey] = useState(0);
    const [resetToken, setResetToken] = useState<string | null>(null);
    const [tutorialRunKey, setTutorialRunKey] = useState(0);
    const [resetToken, setResetToken] = useState<string | null>(null);

    // --- Tutorial state for Wallet screen only ---
    const [tutorial, setTutorial] = useState<TutorialProgress>(buildInitialWalletTutorial);
    const [tutorial, setTutorial] = useState<TutorialProgress>(buildInitialWalletTutorial);

    // allow forcing "last" to show on Wallet (when user skips walletInfo)
    const [forceLastHere, setForceLastHere] = useState(false);
    const [tutorialStorageReady, setTutorialStorageReady] = useState(false);

    // Normalize persisted skips so wallet steps can show again
    useEffect(() => {
        (async () => {
            try {
                const rawDone = await AsyncStorage.getItem("tutorial.done");
                if (rawDone === "1") {
                    setTutorialStorageReady(true);
                    return;
                }

                const rawSkips = await AsyncStorage.getItem("tutorial.skips");
                const parsed = rawSkips ? JSON.parse(rawSkips) : {};
                const cleared = { ...parsed, dragCoin: false, walletInfo: false };
                if (
                    parsed.dragCoin !== cleared.dragCoin ||
                    parsed.walletInfo !== cleared.walletInfo
                ) {
                    await AsyncStorage.setItem("tutorial.skips", JSON.stringify(cleared));
                }
            } catch {
                // ignore
            } finally {
                setTutorialStorageReady(true);
            }
        })();
    }, []);

    // Reset wallet tutorial state when a new resetToken is observed (set by coin-flipper reset button)
    const resetWalletTutorial = useCallback(async (token: string | null) => {
        // clear persisted wallet skips/progress to allow showing steps again
        await AsyncStorage.multiRemove(["tutorial.skips", PROGRESS_KEY]).catch(() => {});
        setTutorial(buildInitialWalletTutorial());
        setForceLastHere(false);
        setTutorialRunKey((k) => k + 1);
        setResetToken(token);
    }, []);

    // Watch reset token on focus
    useEffect(() => {
        let cancelled = false;
        const checkReset = async () => {
            try {
                const token = await AsyncStorage.getItem(RESET_KEY);
                if (cancelled) return;
                if (token && token !== resetToken) {
                    await resetWalletTutorial(token);
                }
            } catch {
                // ignore
            }
        };
        checkReset();
        const unsubscribe = navigation?.addListener("focus", checkReset);
        return () => {
            cancelled = true;
            unsubscribe && unsubscribe();
        };
    }, [resetToken, resetWalletTutorial, navigation]);
    const [tutorialStorageReady, setTutorialStorageReady] = useState(false);

    // Normalize persisted skips so wallet steps can show again
    useEffect(() => {
        (async () => {
            try {
                const rawDone = await AsyncStorage.getItem("tutorial.done");
                if (rawDone === "1") {
                    setTutorialStorageReady(true);
                    return;
                }

                const rawSkips = await AsyncStorage.getItem("tutorial.skips");
                const parsed = rawSkips ? JSON.parse(rawSkips) : {};
                const cleared = { ...parsed, dragCoin: false, walletInfo: false };
                if (
                    parsed.dragCoin !== cleared.dragCoin ||
                    parsed.walletInfo !== cleared.walletInfo
                ) {
                    await AsyncStorage.setItem("tutorial.skips", JSON.stringify(cleared));
                }
            } catch {
                // ignore
            } finally {
                setTutorialStorageReady(true);
            }
        })();
    }, []);

    // Reset wallet tutorial state when a new resetToken is observed (set by coin-flipper reset button)
    const resetWalletTutorial = useCallback(async (token: string | null) => {
        // clear persisted wallet skips/progress to allow showing steps again
        await AsyncStorage.multiRemove(["tutorial.skips", PROGRESS_KEY]).catch(() => {});
        setTutorial(buildInitialWalletTutorial());
        setForceLastHere(false);
        setTutorialRunKey((k) => k + 1);
        setResetToken(token);
    }, []);

    // Watch reset token on focus
    useEffect(() => {
        let cancelled = false;
        const checkReset = async () => {
            try {
                const token = await AsyncStorage.getItem(RESET_KEY);
                if (cancelled) return;
                if (token && token !== resetToken) {
                    await resetWalletTutorial(token);
                }
            } catch {
                // ignore
            }
        };
        checkReset();
        const unsubscribe = navigation?.addListener("focus", checkReset);
        return () => {
            cancelled = true;
            unsubscribe && unsubscribe();
        };
    }, [resetToken, resetWalletTutorial, navigation]);

    // hydrate tutorial progress from storage and merge
    useEffect(() => {
        loadProgress().then((stored) => {
            setTutorial((prev) => {
                const merged = { ...prev, ...stored };
                // force flip-page tasks as completed when on Wallet
                const normalized: TutorialProgress = {
                    ...merged,
                    filterCoins: true,
                    tapTwice: true,
                    zoomedIn: true,
                    rotated: true,
                    zoomedOut: true,
                    doubleTapped: true,
                    openedInfo: true,
                    swipeWallet: true,
                };
                return normalized;
                // force flip-page tasks as completed when on Wallet
                const normalized: TutorialProgress = {
                    ...merged,
                    filterCoins: true,
                    tapTwice: true,
                    zoomedIn: true,
                    rotated: true,
                    zoomedOut: true,
                    doubleTapped: true,
                    openedInfo: true,
                    swipeWallet: true,
                };
                return normalized;
            });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSkipStep = (step: TutorialStepKey) => {
        setTutorial((prev) => {
            let next = { ...prev, [step]: true };

            // If user skips walletInfo while staying on Wallet, we want to show "last" HERE.
            // To reach "last", both wallet tasks must be completed.
            if (step === "walletInfo") {
                next = { ...next, dragCoin: true }; // ensure dragCoin is also done
                setForceLastHere(true); // override overlay gating so "last" can show in Wallet
                saveProgress({ walletInfo: true, dragCoin: true });
                return next;
            }

            // default: persist the single step
            saveProgress({ [step]: true } as Partial<TutorialProgress>);
            return next;
        });
    };

    const handleSkipAll = async () => {
        const all: TutorialProgress = {
            filterCoins: true,
            filteringChoice: true,
            filterNavigation: true,
            tapTwice: true,
            zoomedIn: true,
            rotated: true,
            zoomedOut: true,
            doubleTapped: true,
            openedInfo: true,
            swipeWallet: true,
            dragCoin: true,
            walletInfo: true,
            last: true,
        };
        setTutorial(all);
        await AsyncStorage.setItem("tutorial.done", "1"); // ensure global done
        saveProgress(all);
    };

    // --- Full-screen single-finger swipe detector on Wallet (EDGE-ONLY):
    // Left→Right from the *left edge* => go back to coin-flipper (main)
    const screenSwipe = useRef(
        PanResponder.create({
            // Only start if finger is within the left edge strip
            onStartShouldSetPanResponder: (evt) => {
                // @ts-ignore
                const startX = evt.nativeEvent.pageX ?? 1000;
                return startX < EDGE_BACK_WIDTH;
            },
            onMoveShouldSetPanResponder: (_, g) => {
                const single = (g.numberActiveTouches ?? 1) === 1;
                const horizontal = g.dx > 16 && Math.abs(g.dx) > Math.abs(g.dy);
                return single && horizontal;
            },
            // If child already grabbed it, don't try to take over mid-gesture
            onPanResponderTerminationRequest: () => false,
            onPanResponderRelease: async (_, g) => {
                const absX = Math.abs(g.dx);
                const absY = Math.abs(g.dy);
                if (g.dx > 80 && absX > absY) {
                    // user chose the "swipe back" branch -> mark both walletInfo and dragCoin as done
                    setTutorial((prev) => {
                        const next = { ...prev, walletInfo: true, dragCoin: true };
                        saveProgress({ walletInfo: true, dragCoin: true });
                        return next;
                    });
                    router.replace({
                        pathname: "/coin-flipper",
                        params: { fromWallet: "back" },
                    });
                }
            },
        })
    ).current;

    // Suppress the tutorial on Wallet when both wallet tasks are done,
    // EXCEPT when forceLastHere is set (user skipped walletInfo → show "last" here).
    const pendingWalletSteps = !(tutorial.dragCoin && tutorial.walletInfo);
    const walletShouldShowOverlay =
        tutHydrated &&
        tutorialStorageReady &&
        (forceLastHere || pendingWalletSteps) &&
        (!tutorialDone || forceLastHere || pendingWalletSteps);

    // Whenever global tutorial.done is cleared (e.g., via emoticon reset),
    // clear local progress for wallet steps and remount FirstRunTutorial so its local state resets too.
    useEffect(() => {
        if (tutHydrated && !tutorialDone) {
            // clear persisted wallet skips/progress to allow showing steps again
            AsyncStorage.multiRemove(["tutorial.skips", PROGRESS_KEY]).catch(() => {});
            // reset local wallet tutorial state
            setTutorial(buildInitialWalletTutorial());
            setForceLastHere(false);
            setTutorialRunKey((k) => k + 1);
        }
    }, [tutorialDone, tutHydrated]);

    return (
        <View style={styles.container} {...screenSwipe.panHandlers}>
            {/* Screen title*/}
            <View
                pointerEvents="box-none"
                style={{
                    position: "absolute",
                    top: insets.top + 20,
                    left: 0,
                    right: 0,
                    zIndex: 5,
                    alignItems: "center",
                    justifyContent: "flex-start",
                }}
            >
                <Text style={styles.walletTitle}>Minu Rahakott</Text>
            </View>

            {/* If wallet is empty, show prompt */}
            {coins.length === 0 ? (
                <View style={styles.walletEmptyState}>
                    <Text style={styles.walletEmptyText}>Rahakott on tühi</Text>
                    <Text style={styles.walletEmptySubtext}>
                        Viska münte, et neid lisada rahakotti!
                    </Text>
                </View>
            ) : (
                // If coin exists, show draggable coin centered
                <View style={styles.walletCoinCenterArea}>
                    {coins.map((c) => (
                        <DraggableCoin
                            key={c.id}
                            coin={c}
                            updateCoinPosition={updateCoinPosition}
                            onFirstDrag={() => {
                                if (!tutorial.dragCoin) {
                                    const upd = { dragCoin: true };
                                    setTutorial((p) => ({ ...p, ...upd }));
                                    saveProgress(upd);
                                }
                            }}
                            onTapOpenInfo={() => {
                                // user chose the "walletInfo" path by tapping the coin
                                // Mark both wallet tasks as done so Wallet won’t show "last"
                                const upd = { walletInfo: true, dragCoin: true };
                                setTutorial((p) => ({ ...p, ...upd }));
                                saveProgress(upd);
                                // navigate to flipper; it will show "last" (unless finished from Wallet)
                                router.replace({
                                    pathname: "/coin-flipper",
                                    params: { openInfo: "1", coinId: c.id, fromWallet: "info", infoReq: String(Date.now()), },
                                });
                            }}
                            tutorialRunKey={tutorialRunKey}
                        />
                    ))}
                </View>
            )}

            {/* TUTORIAL OVERLAY (wallet steps) */}
            {walletShouldShowOverlay && (
                <FirstRunTutorial
                    key={tutorialRunKey}
                    progress={tutorial}
                    onSkipStep={handleSkipStep}
                    onSkipAll={handleSkipAll}
                    allowedSteps={WALLET_TUTORIAL_STEPS}
                    onFinish={async () => {
                        // back to coin flip page
                        const upd = { last: true };
                        setTutorial((p) => ({ ...p, ...upd }));
                        saveProgress(upd);
                        await AsyncStorage.setItem("tutorial.done", "1"); // await before navigation

                        // IMPORTANT: pass a one-shot param so Coin-Flipper suppresses overlay immediately
                        router.replace({
                            pathname: "/coin-flipper",
                            params: { tutorialDone: "1" },
                        });
                    }}
                />
            )}
        </View>
    );
}

function DraggableCoin({
    coin,
    updateCoinPosition,
    onFirstDrag,
    onTapOpenInfo,
    tutorialRunKey,
}: {
    coin: any,
    updateCoinPosition: Function,
    onFirstDrag: () => void,
    onTapOpenInfo: () => void,
    tutorialRunKey: number,
}) {
    // Set initial center position, or use coin.x/y if defined
    const initialX = coin.x !== undefined ? coin.x : SCREEN_WIDTH / 2 - 40; // 40 is half coin size
    const initialY = coin.y !== undefined ? coin.y : SCREEN_HEIGHT / 2 - 100; // offset for title area

    // Animation ref for drag position
    const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
    // Keep last dragged position across renders (authoritative absolute coords)
    const lastPosition = useRef({ x: initialX, y: initialY });

    // Initialize offset to stored position when coin changes
    useEffect(() => {
        pan.setOffset({ x: lastPosition.current.x, y: lastPosition.current.y });
        pan.setValue({ x: 0, y: 0 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [coin?.id]);

    const touchStartTs = useRef<number>(0);
    const movedOnce = useRef<boolean>(false);
    const firstDragSent = useRef<boolean>(false);

    useEffect(() => {
        firstDragSent.current = false;
        movedOnce.current = false;
    }, [tutorialRunKey]);

    // During drag, animate coin position (kept inline to avoid Fabric non-callable return)
    const handlePanMove = (evt: any, gesture: any) => {
        Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false })(evt, gesture);
    };

    // PanResponder controls drag logic for the coin
    const panResponder = useRef(
        PanResponder.create({
            // Grab as soon as we touch the coin
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,

            // IMPORTANT: capture so parent edge-swipe can't steal once we began
            onStartShouldSetPanResponderCapture: () => true,
            onMoveShouldSetPanResponderCapture: () => true,

    // When user starts dragging, set drag offset to last position and zero deltas
    onPanResponderGrant: () => {
        touchStartTs.current = Date.now();
        movedOnce.current = false;
        firstDragSent.current = false;

        // Use the stable pattern: setOffset(lastPosition), setValue(0,0)
        pan.setOffset({
            x: lastPosition.current.x,
            y: lastPosition.current.y,
                });
                pan.setValue({ x: 0, y: 0 });
                // Notify tutorial immediately when drag starts
                if (!firstDragSent.current) {
                    firstDragSent.current = true;
                    onFirstDrag();
                }
            },

            // During drag, animate coin position
            onPanResponderMove: (evt, gesture) => {
                handlePanMove(evt, gesture);
                if (!movedOnce.current && (Math.abs(gesture.dx) + Math.abs(gesture.dy)) > 4) {
                    movedOnce.current = true;
                    if (!firstDragSent.current) {
                        firstDragSent.current = true;
                        onFirstDrag(); // notify tutorial on first real move
                    }
                }
            },

            // When drag released, either tap-to-open or save new position and reset offset
            onPanResponderRelease: (_, gesture) => {
                // Flatten offset to bake the translation into the value
                pan.flattenOffset();

                // Detect quick tap with minimal movement -> open coin info in coin-flipper
                const dt = Date.now() - touchStartTs.current;
                const moved = Math.abs(gesture.dx) + Math.abs(gesture.dy);
                if (dt < 250 && moved < 6) {
                    onTapOpenInfo();
                    return; // navigation is done by parent callback
                }

                // Compute and persist new absolute position
                lastPosition.current = {
                    x: lastPosition.current.x + gesture.dx,
                    y: lastPosition.current.y + gesture.dy,
                };
                updateCoinPosition(coin.id, lastPosition.current.x, lastPosition.current.y);

                // After persisting, reset offset/value so the next drag starts cleanly
                pan.setOffset({ x: lastPosition.current.x, y: lastPosition.current.y });
                pan.setValue({ x: 0, y: 0 });
            },

            // If another responder steals it, keep where we were and reset accounting
            onPanResponderTerminate: (_, gesture) => {
                pan.flattenOffset();
                lastPosition.current = {
                    x: lastPosition.current.x + (gesture?.dx ?? 0),
                    y: lastPosition.current.y + (gesture?.dy ?? 0),
                };
                updateCoinPosition(coin.id, lastPosition.current.x, lastPosition.current.y);
                pan.setOffset({ x: lastPosition.current.x, y: lastPosition.current.y });
                pan.setValue({ x: 0, y: 0 });
            },

            // Don't allow termination while active unless absolutely necessary
            onPanResponderTerminationRequest: () => false,
        })
    ).current;

    // Choose correct image for coin side
    const imageSource = coin.side === CoinSide.HEADS
        ? coin.headImageResource
        : coin.tailsImageResource;

    const coinSize = 160 * coin.diameter / 25.4

    // Render animated, draggable coin image
    return (
        <Animated.View
            {...panResponder.panHandlers}
            style={[
                styles.walletCoinContainer,
                {
                    position: "absolute",
                    transform: [
                        { translateX: pan.x },
                        { translateY: pan.y }
                    ],
                },
            ]}
        >
            <Image
                source={{ uri: imageSource }}
                style={{
                    width: coinSize,
                    height: coinSize
                }}
                resizeMode="contain"
            />
        </Animated.View>
    );
}





