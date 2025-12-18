import { useState, useRef, useEffect, useCallback } from "react";
import { View, Animated, Easing, PanResponder, ActivityIndicator, TouchableOpacity, Pressable, Dimensions } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
    TapGestureHandler,
    PinchGestureHandler,
    PanGestureHandler,
    RotationGestureHandler,
    State,
} from "react-native-gesture-handler";
import { coinService, coinStatsService } from "../service/coin-service";
import { Coin, CoinSide } from "../data/entity/coin";
import { styles } from "../components/common/stylesheet";
import { BottomArea } from "../components/specific/coin-flipper/bottom-area";
import { useWallet } from "../context/wallet-context";
import { WalletCoin } from "../service/wallet-service";
// TUTORIAL: imports
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    FirstRunTutorial,
    TutorialProgress,
    TutorialStepKey,
} from "../components/tutorial/first-run-tutorial";

// Bottom sheet component import
import { InfoBottomSheet } from "../components/common/InfoBottomSheet";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { CoinFilterRow, CountryStat, MaterialStat, NameStat, NominalStat } from "../data/entity/aggregated-meta";
const PROGRESS_KEY = "tutorial.progress";
import { PredictionDialog } from "../components/specific/coin-flipper/prediction-dialog";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FilterView from "./filter";

const MIN_SCALE = 1;
const MAX_SCALE = 8;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const PAN_MARGIN_X = 10;
const PAN_MARGIN_Y = 10;

const COIN_TUTORIAL_STEPS: TutorialStepKey[] = [
    "filterCoins",
    "tapTwice",
    "zoomedIn",
    "rotated",
    "zoomedOut",
    "doubleTapped",
    "openedInfo",
    "swipeWallet",
    "last",
];

export default function Flipper() {
    const { addCoin, coins } = useWallet();
    const router = useRouter();
    const routeParams = useLocalSearchParams<{
        coinId?: string;
        openInfo?: string;
        fromWallet?: string;
        tutorialDone?: string;
        infoReq?: string;
        filterMaterial?: string;
        filterCountry?: string;
        filterNominal?: string;
        filterName?: string;
        filterReq?: string;
        filterAction?: string;
    }>();
    const getParam = (val?: string | string[]) => (Array.isArray(val) ? val[0] ?? "" : val ?? "");
    // initial side
    let initialSide = Math.random() < 0.5 ? CoinSide.HEADS : CoinSide.TAILS;
    const [coinSide, setCoinSide] = useState(initialSide);
    const [flipped, setFlipped] = useState(1);
    const [isFlipping, setIsFlipping] = useState(false);
    const flipAnimation = useRef(new Animated.Value(0)).current;
    const buildFreshTutorialState = (): TutorialProgress => ({
        filterCoins: false,
        filteringChoice: true, // filter-specific step stays off this screen
        filterNavigation: true, // filter-specific step stays off this screen
        tapTwice: false,
        zoomedIn: false,
        rotated: false,
        zoomedOut: false,
        doubleTapped: false,
        openedInfo: false,
        swipeWallet: false,
        dragCoin: false,
        walletInfo: false,
        last: false,
    });

    const [coin, setCoin] = useState<WalletCoin | null>(null);
    const [coinSize, setCoinSize] = useState<number>(200);

    const insets = useSafeAreaInsets();
    const hydrateCoin = (base: Coin, materialOverride?: string | null): WalletCoin => {
        const diameterMm =
            base.diameter !== undefined
                ? Number(base.diameter)
                : (base as any).diameter !== undefined
                    ? Number((base as any).diameter)
                    : 25.4;

        return {
            ...base,
            material: materialOverride ?? base.material,
            flippedAt: "",
            prediction: null,
            x: 0,
            y: 0,
            side: initialSide,
        };
    };

    // Filter properties
    const [showFilter, setShowFilter] = useState(false);
    const [coinFilter, setCoinFilter] = useState<CoinFilterRow>({});

    const fetchData = async (coinFilter: CoinFilterRow, forceNew: boolean = false) => {
        // If it came from Wallet with a specific coinId, do not generate a new coin unless forced
        if (routeParams?.coinId && !forceNew) return;
        setCoin(null);
        setLastResult(null);
        setPendingPrediction(null);
        setJustAddedToWallet(false);

        const generatedCoin = await coinService.generateNewCoin(coinFilter);
        const hydrated = hydrateCoin(generatedCoin, generatedCoin.material);

        setCoin(hydrated);
        setCoinSize((160 * hydrated.diameter) / 25.4);
    };

    // Load a specific coin from Wallet when coinId is provided via route params
    useEffect(() => {
        const coinIdParam = routeParams?.coinId;
        if (!coinIdParam) return;

        // Compare as strings to avoid number vs string mismatch
        const fromWallet = coins.find((c) => String(c.id) === String(coinIdParam));
        if (fromWallet) {
            setCoin(fromWallet);
            setLastResult(null);
            setJustAddedToWallet(false);

            // diameterMm can be string/number or absent; coerce safely to number
            const diameterMm =
                fromWallet.diameter !== undefined
                    ? Number(fromWallet.diameter)
                    : (fromWallet as any).diameter !== undefined
                        ? Number((fromWallet as any).diameter)
                        : 25.4; // sensible fallback

            setCoinSize((160 * diameterMm) / 25.4);
        }
        // if not found, do nothing; fetchData() doesn't run when coinId exists
    }, [routeParams?.coinId, coins]);

    // Only fetch a random coin if it didn't come from Wallet with a coinId
    useEffect(() => {
        if (routeParams?.coinId) return; // wallet will provide the coin
        fetchData(coinFilter);
    }, [routeParams?.coinId, coinFilter]);

    // prediction dialog
    const [isDialogVisible, setIsDialogVisible] = useState(false);
    const [pendingPrediction, setPendingPrediction] = useState<CoinSide | null>(null);
    const pendingPredictionRef = useRef<CoinSide | null>(null);

    // last flip result (null until the first flip finishes)
    const [lastResult, setLastResult] = useState<CoinSide | null>(null);
    const [resultSource, setResultSource] = useState<"flip" | "manual">("manual");
    const [justAddedToWallet, setJustAddedToWallet] = useState(false);

    // ZOOM / PAN / ROTATE state
    // ZOOM (pinch) state
    const renderScale = useRef(new Animated.Value(1)).current;
    const lastScaleRef = useRef(1);
    const [isZoomed, setIsZoomed] = useState(false);

    // PAN (drag) while zoomed
    const translate = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
    const panOffset = useRef({ x: 0, y: 0 });

    // ROTATION (two-finger)
    const renderRotation = useRef(new Animated.Value(0)).current;
    const lastRotationRef = useRef(0);

    // Gesture handler refs to control priority/simultaneity
    const pinchRef = useRef<any>(null);
    const panRef = useRef<any>(null);
    const rotateRef = useRef<any>(null);
    const doubleTapRef = useRef<any>(null);
    const singleTapRef = useRef<any>(null);

    // flip timers management
    const timersRef = useRef<number[]>([]);
    const clearFlipTimers = () => {
        timersRef.current.forEach((id) => clearTimeout(id));
        timersRef.current = [];
    };

    // TUTORIAL: progress & helpers
    const [tutorial, setTutorial] = useState<TutorialProgress>(buildFreshTutorialState);
    const [tutorialHydrated, setTutorialHydrated] = useState(false);
    const [tutorialRunKey, setTutorialRunKey] = useState(0);
    const tapCounterRef = useRef(0);

    useEffect(() => {
        (async () => {
            try {
                const raw = await AsyncStorage.getItem(PROGRESS_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    setTutorial((prev) => ({ ...prev, ...parsed }));
                }
            } catch {
                // ignore
            } finally {
                setTutorialHydrated(true);
            }
        })();
    }, []);

    useEffect(() => {
        if (!tutorialHydrated) return;
        setTutorial((prev) => ({
            ...prev,
            filteringChoice: true,
            filterNavigation: true,
        }));
    }, [tutorialHydrated]);

    useEffect(() => {
        if (!tutorialHydrated) return;
        AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(tutorial)).catch(() => { });
    }, [tutorial, tutorialHydrated]);

    const handleSkipStep = (step: TutorialStepKey) => {
        setTutorial((prev) => ({ ...prev, [step]: true }));
    };

    const handleSkipAll = () => {
        setTutorial({
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
        });
        AsyncStorage.setItem("tutorial.done", "1").catch(() => { });
    };

    // Re-open info whenever a fresh infoReq token arrives (even for the same coin).
    const lastInfoReqRef = useRef<string | undefined>(undefined);

    useFocusEffect(
        useCallback(() => {
            const wantsInfo = routeParams?.openInfo === "1";
            const token = routeParams?.infoReq ?? "";
            if (!wantsInfo) return;

            // Only act on a new token
            if (lastInfoReqRef.current === token) return;
            lastInfoReqRef.current = token;

            // If coin is ready, open immediately; otherwise defer a tick
            if (coin) {
                requestAnimationFrame(() => openInfoSheet());
            } else {
                setTimeout(() => {
                    if (coin) openInfoSheet();
                }, 0);
            }
        }, [routeParams?.openInfo, routeParams?.infoReq, coin?.id])
    );

    useFocusEffect(
        useCallback(() => {
            // Whenever we return from Wallet with a back-swipe, always generate a fresh coin
            if (routeParams?.fromWallet === "back" && !routeParams?.coinId) {
                fetchData(coinFilter);
            }
        }, [routeParams?.fromWallet, routeParams?.coinId])
    );

    // If returning from Wallet, normalize wallet steps and show "last" here (unless caller says done)
    useEffect(() => {
        if (routeParams?.fromWallet) {
            setTutorial((prev) => {
                const normalized = {
                    ...prev,
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
                };
                if (routeParams.tutorialDone === "1") {
                    return { ...normalized, last: true };
                }
                return { ...normalized, last: false };
            });
            // Remount tutorial overlay to ensure "last" shows after coming from Wallet
            setTutorialRunKey((k) => k + 1);
        }
    }, [routeParams?.fromWallet, routeParams?.tutorialDone]);
    // If Wallet told us tutorial is done, suppress overlay here immediately
    useEffect(() => {
        if (routeParams?.tutorialDone === "1") {
            setTutorial((prev) => ({
                ...prev,
                filterCoins: true,
                filteringChoice: true,
                filterNavigation: true,
                // normalize wallet steps too to avoid bouncing back
                swipeWallet: true,
                dragCoin: true,
                walletInfo: true,
                last: true,
            }));
            // also persist global done to keep it sticky on next mounts
            AsyncStorage.setItem("tutorial.done", "1").catch(() => { });
        }
    }, [routeParams?.tutorialDone]);

    // Pinch handlers
    // Pinch: live clamp to [1, MAX_SCALE]
    const onPinchEvent = ({ nativeEvent }: any) => {
        const nextUnclamped = lastScaleRef.current * nativeEvent.scale;
        const next = Math.max(MIN_SCALE, Math.min(nextUnclamped, MAX_SCALE));
        renderScale.setValue(next); // mark zoomed flag immediately for UI (labels hidden while zoomed)
        setIsZoomed(next > 1.001);

        // TUTORIAL: mark zoom completed when scale > 1x
        if (next > 1.001 && !tutorial.zoomedIn) {
            setTutorial((prev) => ({ ...prev, zoomedIn: true }));
        }
    };
    const onPinchStateChange = ({ nativeEvent }: any) => {
        if (
            nativeEvent.state === State.END ||
            nativeEvent.state === State.CANCELLED ||
            nativeEvent.state === State.FAILED
        ) {
            // finalize the scale
            renderScale.stopAnimation((val: number) => {
                const clamped = Math.max(MIN_SCALE, Math.min(val ?? lastScaleRef.current, MAX_SCALE));
                renderScale.setValue(clamped);
                lastScaleRef.current = clamped;

                if (clamped === 1) {
                    translate.setValue({ x: 0, y: 0 });
                    panOffset.current = { x: 0, y: 0 };
                    renderRotation.setValue(0);
                    lastRotationRef.current = 0;
                    setIsZoomed(false);

                    // TUTORIAL: mark zoomed out after having zoomed in
                    if (!tutorial.zoomedOut && tutorial.zoomedIn) {
                        setTutorial((prev) => ({ ...prev, zoomedOut: true }));
                    }
                }
            });
        }
    };

    // Pan handlers (when zoomed)
    const onPanGestureEvent = ({ nativeEvent }: any) => {
        if (!isZoomed) return;
        if (nativeEvent.numberOfPointers < 2) return;

        // Start from the stored origin and add this gesture's translation
        const rawX = panOffset.current.x + nativeEvent.translationX;
        const rawY = panOffset.current.y + nativeEvent.translationY;

        // Clamp so the coin cannot fully leave the screen
        const maxX = SCREEN_WIDTH / 2 - PAN_MARGIN_X;
        const maxY = SCREEN_HEIGHT / 2 - PAN_MARGIN_Y;

        const clampedX = Math.max(-maxX, Math.min(rawX, maxX));
        const clampedY = Math.max(-maxY, Math.min(rawY, maxY));

        translate.setValue({ x: clampedX, y: clampedY });
    };

    const onPanStateChange = ({ nativeEvent }: any) => {
        if (nativeEvent.numberOfPointers < 2) return;

        if (nativeEvent.state === State.BEGAN) {
            // New drag starts from the *current* visual position
            const currentX = (translate.x as any)._value ?? 0;
            const currentY = (translate.y as any)._value ?? 0;
            panOffset.current = { x: currentX, y: currentY };
            return;
        }

        if (
            nativeEvent.state === State.END ||
            nativeEvent.state === State.CANCELLED ||
            nativeEvent.state === State.FAILED
        ) {
            if (lastScaleRef.current <= 1.001) {
                translate.setValue({ x: 0, y: 0 });
                panOffset.current = { x: 0, y: 0 };
            } else {
                // Persist final, clamped position as new origin for the next drag
                const currentX = (translate.x as any)._value ?? 0;
                const currentY = (translate.y as any)._value ?? 0;

                const maxX = SCREEN_WIDTH / 2 - PAN_MARGIN_X;
                const maxY = SCREEN_HEIGHT / 2 - PAN_MARGIN_Y;

                const clampedX = Math.max(-maxX, Math.min(currentX, maxX));
                const clampedY = Math.max(-maxY, Math.min(currentY, maxY));

                panOffset.current = { x: clampedX, y: clampedY };
                translate.setValue({ x: clampedX, y: clampedY });
            }
        }
    };

    // Rotation handlers (when zoomed)
    const onRotateEvent = ({ nativeEvent }: any) => {
        if (!isZoomed) return; // rotate only in zoom view
        const next = lastRotationRef.current + nativeEvent.rotation; // radians
        renderRotation.setValue(next);
    };
    const onRotateStateChange = ({ nativeEvent }: any) => {
        if (!isZoomed) return;
        if (
            nativeEvent.state === State.END ||
            nativeEvent.state === State.CANCELLED ||
            nativeEvent.state === State.FAILED
        ) {
            // accumulate rotation
            renderRotation.stopAnimation((val: number) => {
                lastRotationRef.current = val ?? lastRotationRef.current;
                // snap tiny angles to 0 for neatness when nearly straight
                if (Math.abs(lastRotationRef.current) < 0.01) {
                    lastRotationRef.current = 0;
                    renderRotation.setValue(0);
                }
                // TUTORIAL: mark rotated after a non-trivial angle
                if (Math.abs(lastRotationRef.current) >= 0.01 && !tutorial.rotated) {
                    setTutorial((prev) => ({ ...prev, rotated: true }));
                }
            });
        }
    };

    // Tap handlers
    // Single tap: toggle side; sync label, drop verdict; CANCEL any leftover flip timers
    const onSingleTap = ({ nativeEvent }: any) => {
        if (nativeEvent.state === State.END) {
            clearFlipTimers(); // prevent late timeouts from previous flip
            setFlipped(1); // ensure upright (prevents upside-down artifact)
            flipAnimation.stopAnimation();
            flipAnimation.setValue(0);

            const nextSide = coinSide === CoinSide.HEADS ? CoinSide.TAILS : CoinSide.HEADS;
            setCoinSide(nextSide);
            setLastResult(nextSide);
            setResultSource("manual"); // hide prediction verdict in BottomArea
            setJustAddedToWallet(false);

            // TUTORIAL: two single taps required
            tapCounterRef.current += 1;
            if (tapCounterRef.current >= 2 && !tutorial.tapTwice) {
                setTutorial((prev) => ({ ...prev, tapTwice: true }));
            }
        }
    };

    // Double tap: open prediction dialog only if zoom is at original size
    const onDoubleTap = ({ nativeEvent }: any) => {
        if (nativeEvent.state === State.ACTIVE) {
            if (Math.abs(lastScaleRef.current - 1) < 0.01) {
                setPendingPrediction(null);
                setIsDialogVisible(true);

                // TUTORIAL: mark double tap
                if (!tutorial.doubleTapped) {
                    setTutorial((prev) => ({ ...prev, doubleTapped: true }));
                }
            }
        }
    };

    // --- Bottom sheet state ---
    const [isInfoVisible, setIsInfoVisible] = useState(false);
    const lastInfoCloseRef = useRef(0);
    const bottomSheetAnim = useRef(new Animated.Value(0)).current;
    const coinShiftAnim = useRef(new Animated.Value(0)).current; // 0 = normal, 1 = shifted up, for info sheet
    const dragY = useRef(new Animated.Value(0)).current;

    // --- Drag-down gesture on the prediction sheet ---
    const sheetPanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gesture) => {
                if (gesture.dy > 0) dragY.setValue(gesture.dy);
            },
            onPanResponderRelease: (_, gesture) => {
                if (gesture.dy > 100) {
                    closeInfoSheet();
                } else {
                    Animated.spring(dragY, { toValue: 0, useNativeDriver: true }).start();
                }
            },
        })
    ).current;

    // Coin flip logic and animation
    const flipCoin = async () => {
        setIsFlipping(true);
        setJustAddedToWallet(false);
        // Animation parameters
        const MAX_ROTATIONS_LOCAL = 30; // maximum amount of rotations the coin can do
        const MIN_ROTATIONS_LOCAL = 15;
        const rotations = Math.max(
            Math.floor(Math.random() * MAX_ROTATIONS_LOCAL) + 1,
            MIN_ROTATIONS_LOCAL
        );
        const duration = 1500; // milliseconds

        // Before starting a new flip, cancel any old timers to avoid stray toggles
        clearFlipTimers();
        // Hide previous result while a new flip is in progress
        setLastResult(null);

        // Remember starting side and compute final side based on rotations parity
        const startSide = coinSide;
        const finalSide =
            rotations % 2 === 0
                ? startSide
                : startSide === CoinSide.HEADS
                    ? CoinSide.TAILS
                    : CoinSide.HEADS;

        let currentFlip = flipped;

        Animated.timing(flipAnimation, {
            toValue: rotations,
            duration,
            easing: Easing.linear,
            useNativeDriver: true,
        }).start(() => {
            currentFlip = 1;
            setFlipped(currentFlip);
            flipAnimation.setValue(0);
            // Done with all timers for this flip
            clearFlipTimers();
            setIsFlipping(false);

            // Make sure coinSide and lastResult match the same final side
            setCoinSide(finalSide);
            setLastResult(finalSide);
            setResultSource("flip");

            const alreadyInWallet = coins.some((c) => c.id === coin?.id);
            let added = false;

            if (!alreadyInWallet && coin !== null) {
                const chosenPrediction = pendingPredictionRef.current ?? null;

                const updatedCoin = {
                    ...coin,
                    prediction: chosenPrediction,
                    flippedAt: new Date().toISOString(),
                };
                setCoin(updatedCoin);

                addCoin(coin, finalSide, chosenPrediction);
                added = true;
            }
            setJustAddedToWallet(added);
        });

        const step = duration / (rotations + 1);

        for (let t = step; duration - t > 0.001; t += step) {
            const id = setTimeout(() => {
                setCoinSide((prev) =>
                    prev === CoinSide.HEADS ? CoinSide.TAILS : CoinSide.HEADS
                );

                currentFlip = currentFlip === 1 ? -1 : 1;
                setFlipped(currentFlip);
            }, t) as unknown as number;

            timersRef.current.push(id);
        }
    };

    const handleChoosePrediction = (side: CoinSide) => {
        setPendingPrediction(side);
        pendingPredictionRef.current = side;
        setIsDialogVisible(false);
        requestAnimationFrame(() => flipCoin());
    };

    const handleFlipWithoutPrediction = () => {
        setPendingPrediction(null);
        pendingPredictionRef.current = null;
        setIsDialogVisible(false);
        requestAnimationFrame(() => flipCoin());
    };

    const forceCoinUpright = () => {
        // kill any remaining tick timers
        clearFlipTimers();
        // stop the animated rotateX and reset pose
        try {
            flipAnimation.stopAnimation(() => {
                flipAnimation.setValue(0); // rotateX -> 0deg
                setFlipped(1); // scaleY -> 1 (upright)
            });
        } catch { }
        setIsFlipping(false);
    };

    // --- Bottom sheet animations ---
    const openInfoSheet = () => {
        // If a flip is in progress (or just ended), force a stable, upright coin
        if (isFlipping) {
            forceCoinUpright();
        } else {
            // Even if not flipping, late timers can still bite
            forceCoinUpright();
        }

        setIsInfoVisible(true); // Mount the bottom sheet component

        // TUTORIAL: mark info opened
        if (!tutorial.openedInfo) {
            setTutorial((prev) => ({ ...prev, openedInfo: true }));
        }

        Animated.parallel([
            Animated.timing(bottomSheetAnim, {
                toValue: 1, // Animate sheet
                duration: 300,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
            Animated.timing(coinShiftAnim, {
                toValue: 1, // Animate coin
                duration: 300,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
        ]).start();
    };

    const closeInfoSheet = () => {
        Animated.parallel([
            Animated.timing(bottomSheetAnim, {
                toValue: 0, // Animate sheet
                duration: 300,
                easing: Easing.in(Easing.quad),
                useNativeDriver: true,
            }),
            Animated.timing(coinShiftAnim, {
                toValue: 0, // Animate coin
                duration: 300,
                easing: Easing.in(Easing.quad),
                useNativeDriver: true,
            }),
        ]).start(() => {
            setIsInfoVisible(false); // Unmount bottom sheet component after animation
            dragY.setValue(0); // Reset drag value
            lastInfoCloseRef.current = Date.now();
        });
    };

    // Coin must be at its initial state to allow info swipe
    const isCoinAtStart = () =>
        lastScaleRef.current <= 1.001 &&
        Math.abs(lastRotationRef.current) < 0.01 &&
        Math.abs(panOffset.current.x) < 0.5 &&
        Math.abs(panOffset.current.y) < 0.5;

    // --- Full-screen gesture detector:
    // Right -> open filter page (dedicated view)
    // Up -> open info sheet
    // Left -> go to wallet
    const swipeResponder = useRef(
        PanResponder.create({
            // Don't claim the gesture at start
            onStartShouldSetPanResponder: () => false,

            // Claim when: single finger, significant move
            onMoveShouldSetPanResponder: (_, g) => {
                const singleTouch = (g.numberActiveTouches ?? 1) === 1;
                const bigMove = Math.abs(g.dx) > 20 || Math.abs(g.dy) > 20;
                return singleTouch && bigMove;
            },

            // Allow RNGH handlers to take over if they want (reduces deadlocks)
            onPanResponderTerminationRequest: () => true,

            onPanResponderRelease: (_, g) => {
                const { dx = 0, dy = 0 } = g ?? {};
                const absX = Math.abs(dx);
                const absY = Math.abs(dy);
                const swipedRight = dx > 80 && absX > absY;
                const swipedLeft = dx < -80 && absX > absY;
                const swipedUp = dy < -80 && absY > absX;
                // defensive: mark on gesture object for any stray consumers
                (g as any).swipedRight = swipedRight;
                (g as any).swipedLeft = swipedLeft;
                (g as any).swipedUp = swipedUp;

                if (!isInfoVisible && swipedRight) {
                    setTutorial((prev) => ({ ...prev, filterCoins: true }));
                    setShowFilter(true);
                    return;
                }

                // vertical priority (info sheet)
                if (isCoinAtStart() && swipedUp) {
                    // normalize pose before sheet animation to avoid a "drop & flip" effect
                    forceCoinUpright();
                    openInfoSheet();
                    return;
                }

                // horizontal: right-to-left => go to wallet
                if (swipedLeft) {
                    setTutorial((prev) => ({ ...prev, swipeWallet: true }));
                    // hand off to wallet tutorial
                    router.push({ pathname: "./wallet", params: { teach: "1" } });
                    return;
                }
            },
        })
    ).current;

    // "Start playing" action from the last tutorial step on Coin-Flipper
    const handleFinishTutorialHere = async () => {
        // If info is open, close it; otherwise just hide tutorial
        if (isInfoVisible) {
            closeInfoSheet();
        }
        const allDone: TutorialProgress = {
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
        setTutorial(allDone);
        await AsyncStorage.multiSet([
            [PROGRESS_KEY, JSON.stringify(allDone)],
            ["tutorial.done", "1"],
        ]).catch(() => { });
    };

    const handleRestartTutorial = async () => {
        try {
            await AsyncStorage.multiRemove(["tutorial.done", "tutorial.skips", "tutorial.progress"]);
            await AsyncStorage.setItem("tutorial.done", "0");
            await AsyncStorage.setItem("tutorial.resetToken", String(Date.now()));
        } catch { }
        tapCounterRef.current = 0;
        setTutorial(buildFreshTutorialState());
        setTutorialRunKey((k) => k + 1);
    };

    // --- Render ---
    return (
        <>
            {showFilter && (
                <>
                    <FilterView
                        onFilterApply={(filter) => {
                            setCoinFilter(filter);
                            setShowFilter(false);
                        }}
                        onFilterCancel={() => {
                            setShowFilter(false);
                            setCoinFilter({});
                        }}
                    />
                </>
            )}
            {
                !showFilter && (

                    <View style={styles.container} {...swipeResponder.panHandlers}>
                        {!coin && <ActivityIndicator size={64} />}
                        {coin && (
                            <>
                                <TouchableOpacity
                                    accessibilityRole="button"
                                    accessibilityLabel="Ava juhend uuesti"
                                    onPress={handleRestartTutorial}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    style={{
                                        position: "absolute",
                                        top: insets.top + 12,
                                        right: 16,
                                        padding: 10,
                                        borderRadius: 18,
                                        backgroundColor: "rgba(23, 24, 35, 0.85)",
                                        borderWidth: 1,
                                        borderColor: "#32403d",
                                        zIndex: 22,
                                        shadowColor: "#000",
                                        shadowOpacity: 0.2,
                                        shadowRadius: 4,
                                        shadowOffset: { width: 0, height: 2 },
                                    }}
                                >
                                    <MaterialCommunityIcons name="lightbulb-on-outline" size={22} color="#dce9e6" />
                                </TouchableOpacity>

                                {/* top spacer keeps coin centered even when result appears */}
                                <View style={styles.coinTopSpacer} />
                                {/* top spacer keeps coin centered even when result appears */}
                                <View style={styles.coinTopSpacer} />

                                {/* Double-tap wraps single-tap; taps wait for gesture handlers (pinch/pan/rotate) */}
                                <TapGestureHandler
                                    ref={doubleTapRef}
                                    numberOfTaps={2}
                                    waitFor={[pinchRef, panRef, rotateRef]}
                                    onHandlerStateChange={onDoubleTap}
                                >
                                    <TapGestureHandler
                                        ref={singleTapRef}
                                        waitFor={[doubleTapRef, pinchRef, panRef, rotateRef]}
                                        onHandlerStateChange={onSingleTap}
                                        testID="coin-tap"
                                    >
                                        {/* Pinch, rotate and pan recognize simultaneously (rotate/pan only when zoomed) */}
                                        <PinchGestureHandler
                                            ref={pinchRef}
                                            simultaneousHandlers={[panRef, rotateRef]}
                                            onGestureEvent={onPinchEvent}
                                            onHandlerStateChange={onPinchStateChange}
                                            testID="coin-pinch"
                                        >
                                            <RotationGestureHandler
                                                ref={rotateRef}
                                                enabled={isZoomed}
                                                simultaneousHandlers={[pinchRef, panRef]}
                                                onGestureEvent={onRotateEvent}
                                                onHandlerStateChange={onRotateStateChange}
                                            >
                                                <PanGestureHandler
                                                    ref={panRef}
                                                    enabled={isZoomed}
                                                    simultaneousHandlers={[pinchRef, rotateRef]}
                                                    onGestureEvent={onPanGestureEvent}
                                                    onHandlerStateChange={onPanStateChange}
                                                >
                                                    <Animated.View
                                                        pointerEvents="box-none"
                                                        style={[
                                                            styles.coinLayer,
                                                            isInfoVisible && styles.coinLayerRaised,
                                                            { zIndex: isInfoVisible ? 1 : 2 },
                                                        ]}
                                                    >
                                                        <Animated.Image
                                                            source={{ uri: coinSide === CoinSide.HEADS ? coin.headImageResource : coin.tailsImageResource }}
                                                            style={[
                                                                {
                                                                    width: coinSize,
                                                                    height: coinSize,
                                                                },
                                                                {
                                                                    transform: [
                                                                        { translateX: translate.x },
                                                                        { translateY: translate.y },
                                                                        { scale: renderScale },
                                                                        {
                                                                            rotate: renderRotation.interpolate({
                                                                                inputRange: [-Math.PI * 2, Math.PI * 2],
                                                                                outputRange: ["-6.2832rad", "6.2832rad"],
                                                                            }),
                                                                        },
                                                                        { scaleY: flipped },
                                                                        {
                                                                            rotateX: flipAnimation.interpolate({
                                                                                inputRange: [0, 1],
                                                                                outputRange: ["0deg", "180deg"],
                                                                            }),
                                                                        },
                                                                        // coin shift
                                                                        {
                                                                            translateY: coinShiftAnim.interpolate({
                                                                                inputRange: [0, 1],
                                                                                outputRange: [0, -170],
                                                                            }),
                                                                        },
                                                                    ],
                                                                },
                                                            ]}
                                                            resizeMode="contain"
                                                        />
                                                    </Animated.View>
                                                </PanGestureHandler>
                                            </RotationGestureHandler>
                                        </PinchGestureHandler>
                                    </TapGestureHandler>
                                </TapGestureHandler>

                                {/* bottom area holds the result; hidden while zoomed */}
                                <View style={styles.bottomArea}>
                                    {lastResult !== null && !isZoomed && (
                                        <BottomArea
                                            side={lastResult}
                                            coinName={coin?.name ?? ""}
                                            predicted={resultSource === "flip" ? pendingPrediction : null}
                                            isFlipping={isFlipping}
                                            resultSource={resultSource}
                                            justAddedToWallet={justAddedToWallet}
                                        />
                                    )}
                                </View>
                                {/* bottom area holds the result; hidden while zoomed */}
                                <View style={styles.bottomArea}>
                                    {lastResult !== null && !isZoomed && (
                                        <BottomArea
                                            side={lastResult}
                                            coinName={coin?.name ?? ""}
                                            predicted={resultSource === "flip" ? pendingPrediction : null}
                                            isFlipping={isFlipping}
                                            resultSource={resultSource}
                                            justAddedToWallet={justAddedToWallet}
                                        />
                                    )}
                                </View>

                                <PredictionDialog
                                    visible={isDialogVisible}
                                    dragY={dragY}
                                    panHandlers={sheetPanResponder.panHandlers}
                                    onChoosePrediction={handleChoosePrediction}
                                    onFlipWithoutPrediction={handleFlipWithoutPrediction}
                                    onClose={() => {
                                        setPendingPrediction(null);
                                        pendingPredictionRef.current = null;
                                        setIsDialogVisible(false);
                                    }}
                                />
                                <PredictionDialog
                                    visible={isDialogVisible}
                                    dragY={dragY}
                                    panHandlers={sheetPanResponder.panHandlers}
                                    onChoosePrediction={handleChoosePrediction}
                                    onFlipWithoutPrediction={handleFlipWithoutPrediction}
                                    onClose={() => {
                                        setPendingPrediction(null);
                                        pendingPredictionRef.current = null;
                                        setIsDialogVisible(false);
                                    }}
                                />

                                {/* BOTTOM SHEET */}
                                {isInfoVisible && (
                                    <InfoBottomSheet
                                        coin={coins.find((c) => String(c.id) === String(coin?.id)) ?? coin}
                                        onClose={closeInfoSheet}
                                        bottomSheetAnim={bottomSheetAnim}
                                        dragY={dragY}
                                    />
                                )}
                                {/* BOTTOM SHEET */}
                                {isInfoVisible && (
                                    <InfoBottomSheet
                                        coin={coins.find((c) => String(c.id) === String(coin?.id)) ?? coin}
                                        onClose={closeInfoSheet}
                                        bottomSheetAnim={bottomSheetAnim}
                                        dragY={dragY}
                                    />
                                )}

                                {/* TUTORIAL OVERLAY */}
                                <FirstRunTutorial
                                    key={tutorialRunKey}
                                    progress={tutorial}
                                    onSkipStep={handleSkipStep}
                                    onSkipAll={handleSkipAll}
                                    allowedSteps={COIN_TUTORIAL_STEPS}
                                    onFinish={handleFinishTutorialHere}
                                />
                            </>
                        )}
                    </View>
                )
            }
        </>
    );
}




