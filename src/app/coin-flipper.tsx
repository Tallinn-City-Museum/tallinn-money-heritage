    import { useState, useRef, useEffect, useCallback } from "react";
    import {
    View,
    Text,
    TouchableOpacity,
    Animated,
    Modal,
    Pressable,
    Easing,
    PanResponder,
    ActivityIndicator,
    Button,
    } from "react-native";
    import {
    TapGestureHandler,
    PinchGestureHandler,
    PanGestureHandler,
    RotationGestureHandler,
    State,
    } from "react-native-gesture-handler";
    import { coinService, CoinService } from "../service/coin-service";
    import { Coin, CoinSide } from "../data/entity/coin";
    import { styles } from "../components/common/stylesheet";
    import { BottomArea } from "../components/specific/coin-flipper/bottom-area";
    import Toast from "react-native-toast-message";
    import { useWallet } from "../context/wallet-context";
    import { WalletCoin } from "../service/wallet-service";
    // TUTORIAL: imports
    import AsyncStorage from "@react-native-async-storage/async-storage";
    import {
    FirstRunTutorial,
    TutorialProgress,
    TutorialStepKey,
    } from "../components/tutorial/first-run-tutorial";
    import { useSafeAreaInsets } from "react-native-safe-area-context";


    // Bottom sheet component import
    import { InfoBottomSheet } from "../components/common/InfoBottomSheet";
    import { useLocalSearchParams, useRouter } from "expo-router";
    import { useFocusEffect } from "@react-navigation/native";


    const MIN_SCALE = 1;
    const MAX_SCALE = 8;


    export default function Flipper() {
    const insets = useSafeAreaInsets();
    const { addCoin, coins } = useWallet();
    const router = useRouter();
    const routeParams = useLocalSearchParams<{
        coinId?: string;
        openInfo?: string;
        fromWallet?: string;
        tutorialDone?: string;
        infoReq?: string;
    }>();
    // initial side
    let initialSide = Math.random() < 0.5 ? CoinSide.HEADS : CoinSide.TAILS;
    const [coinSide, setCoinSide] = useState(initialSide);
    const [flipped, setFlipped] = useState(1);
    const [isFlipping, setIsFlipping] = useState(false);


    const flipAnimation = useRef(new Animated.Value(0)).current;

    const [coin, setCoin] = useState<WalletCoin | null>(null);
    const [coinSize, setCoinSize] = useState<number>(200);
    
    const fetchData = async () => {
        // If it came from Wallet with a specific coinId, do not generate a new coin
        if (routeParams?.coinId) return;
            setCoin(null);
            setLastResult(null);
            setPendingPrediction(null);
            const generatedCoin = await coinService.generateNewCoin();

            const initialCoin: WalletCoin = {
            ...generatedCoin,
            flippedAt: '', // Empty string for date
            prediction: null, // Default null for prediction
            x: 0, // Default position
            y: 0,
            side: initialSide // Ensure side is set for type compliance
            };
    
        setCoin(initialCoin);
        setCoinSize(160 * generatedCoin.diameterMm / 25.4)
    };


    // Load a specific coin from Wallet when coinId is provided via route params
    useEffect(() => {
        const coinIdParam = routeParams?.coinId;
        if (!coinIdParam) return;


        // Compare as strings to avoid number vs string mismatch
        const fromWallet = coins.find((c) => String(c.id) === String(coinIdParam));
        if (fromWallet) {
            setCoin(fromWallet);


            // diameterMm can be string/number or absent; coerce safely to number
            const diameterMm =
                fromWallet.diameterMm !== undefined
                    ? Number(fromWallet.diameterMm)
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
        fetchData();
    }, [routeParams?.coinId]);


    // prediction dialog
    const [isDialogVisible, setIsDialogVisible] = useState(false);
    const [pendingPrediction, setPendingPrediction] = useState<CoinSide | null>(null);
    const pendingPredictionRef = useRef<CoinSide | null>(null);



    // last flip result (null until the first flip finishes)
    const [lastResult, setLastResult] = useState<CoinSide | null>(null);
    const [resultSource, setResultSource] = useState<"flip" | "manual">("manual");


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
    const [tutorial, setTutorial] = useState<TutorialProgress>({
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
    const tapCounterRef = useRef(0);


    const handleSkipStep = (step: TutorialStepKey) => {
        setTutorial((prev) => ({ ...prev, [step]: true }));
    };
    const handleSkipAll = () => {
        setTutorial({
            tapTwice: true,
            zoomedIn: true,
            rotated: true,
            zoomedOut: true,
            doubleTapped: true,
            openedInfo: true,
            swipeWallet: true,
            dragCoin: true,
            walletInfo: true,
            last: true
        });
        AsyncStorage.setItem("tutorial.done", "1").catch(() => {});
    };
    useEffect(() => {
        // touch AsyncStorage once (defensive; FirstRunTutorial persists itself)
        AsyncStorage.getItem("tutorial.done").then(() => { });
    }, []);


    // If returning from Wallet, normalize wallet steps and show "last" here (unless caller says done)
    useEffect(() => {
        if (routeParams?.fromWallet) {
            setTutorial((prev) => {
                const merged = { ...prev, swipeWallet: true, dragCoin: true, walletInfo: true };
                if (routeParams.tutorialDone === "1") {
                    // parent already finished; mark last as done too
                    return { ...merged, last: true };
                }
                // leave "last" false so it shows here
                return { ...merged, last: false };
            });
        }
    }, [routeParams?.fromWallet, routeParams?.tutorialDone]);


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


    // If Wallet told us tutorial is done, suppress overlay here immediately
    useEffect(() => {
        if (routeParams?.tutorialDone === "1") {
            setTutorial((prev) => ({
                ...prev,
                // normalize wallet steps too to avoid bouncing back
                swipeWallet: true,
                dragCoin: true,
                walletInfo: true,
                last: true,
            }));
            // also persist global done to keep it sticky on next mounts
            AsyncStorage.setItem("tutorial.done", "1").catch(() => {});
        }
    }, [routeParams?.tutorialDone]);


    // Pinch handlers
    // Pinch: live clamp to [1, MAX_SCALE]
    const onPinchEvent = ({ nativeEvent }: any) => {
        const nextUnclamped = lastScaleRef.current * nativeEvent.scale;
        const next = Math.max(MIN_SCALE, Math.min(nextUnclamped, MAX_SCALE));
        renderScale.setValue(next); // mark zoomed flag immediately for UI (labels hidden while zoomed)
        setIsZoomed(next > 1.001);


        // TUTORIAL: mark zoom completed when scale > 1×
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
        const x = panOffset.current.x + nativeEvent.translationX;
        const y = panOffset.current.y + nativeEvent.translationY;
        translate.setValue({ x, y });
    };
    const onPanStateChange = ({ nativeEvent }: any) => {
        if (
            nativeEvent.state === State.END ||
            nativeEvent.state === State.CANCELLED ||
            nativeEvent.state === State.FAILED
        ) {
            if (lastScaleRef.current <= 1.001) {
                translate.setValue({ x: 0, y: 0 });
                panOffset.current = { x: 0, y: 0 };
            } else {
                panOffset.current = {
                    x: panOffset.current.x + nativeEvent.translationX,
                    y: panOffset.current.y + nativeEvent.translationY,
                };
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
    const bottomSheetAnim = useRef(new Animated.Value(0)).current;
    const coinShiftAnim = useRef(new Animated.Value(0)).current; // 0 = normal, 1 = shifted up, for info sheet
    const dragY = useRef(new Animated.Value(0)).current;


    // --- Drag-down gesture on the sheet ---
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


            // popup only if coin is added to the wallet
            let currentCoin = coinSide;
            const alreadyInWallet = coins.some((c) => c.id === coin?.id);
            if (!alreadyInWallet && coin !== null) {
                // Use the immediate ref value for prediction so we don't race with React state
                const chosenPrediction = pendingPredictionRef.current ?? null;
                const updatedCoin = {
                    ...coin,
                    prediction: chosenPrediction,
                    flippedAt: new Date().toISOString(),
                };
                setCoin(updatedCoin);

                // Show notification that the coin has been added to the wallet
                addCoin(coin, currentCoin, chosenPrediction);
                Toast.show({
                    type: "success",
                    text1: "Münt on lisatud rahakotti",
                    text2: `Münt '${coin?.title}' on lisatud teie rahakotti 🪙`,
                });
            }
        });


        let step = duration / (rotations + 1);
        let currentCoin = coinSide;
        let currentFlip = flipped;


        for (let t = step; duration - t > 0.001; t += step) {
            const id = setTimeout(() => {
                if (currentCoin === CoinSide.HEADS) {
                    setCoinSide(CoinSide.TAILS);
                    currentCoin = CoinSide.TAILS;
                } else {
                    setCoinSide(CoinSide.HEADS);
                    currentCoin = CoinSide.HEADS;
                }
                currentFlip = currentFlip === 1 ? -1 : 1;
                setFlipped(currentFlip);


                if (duration - t - step <= 0.001) {
                    setLastResult(currentCoin);
                    setResultSource("flip");
                }
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
        });
    };


    // Coin must be at its initial state to allow info swipe
    const isCoinAtStart = () =>
        lastScaleRef.current <= 1.001 &&
        Math.abs(lastRotationRef.current) < 0.01 &&
        Math.abs(panOffset.current.x) < 0.5 &&
        Math.abs(panOffset.current.y) < 0.5;


    // --- Full-screen gesture detector:
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
                const absX = Math.abs(g.dx);
                const absY = Math.abs(g.dy);


                // vertical priority (info sheet)
                if (isCoinAtStart() && g.dy < -80 && absY > absX) {
                    // normalize pose before sheet animation to avoid “drop & flip”
                    forceCoinUpright();
                    openInfoSheet();
                    return;
                }


                // horizontal: right-to-left => go to wallet
                if (g.dx < -80 && absX > absY) {
                    setTutorial((prev) => ({ ...prev, swipeWallet: true }));
                    // hand off to wallet tutorial
                    router.push({ pathname: "./wallet", params: { teach: "1" } });
                    return;
                }
            },
        })
    ).current;


    // "Mine mängima" action from the last tutorial step on Coin-Flipper
    const handleFinishTutorialHere = async () => {
        // If info is open, close it; otherwise just hide tutorial
        if (isInfoVisible) {
            closeInfoSheet();
        }
        setTutorial((prev) => ({ ...prev, last: true }));
        await AsyncStorage.setItem("tutorial.done", "1").catch(() => {});
    };

    

    // --- Render ---
    return (   
        <View style={styles.container} {...swipeResponder.panHandlers}>
            {coin === null && <ActivityIndicator size={64} />}
            {coin !== null && (
                <>
                    <View
                        pointerEvents="box-none"
                        style={{
                            position: "absolute",
                            top: insets.top + 20,
                            left: 0,
                            right: 0,
                            zIndex: 50,
                            alignItems: "center",
                            justifyContent: "flex-start",
                        }}
                    >
                        <Text
                            style={{
                                fontWeight: "600",
                                fontSize: 18,
                                color: "#e7e3e3ff",
                                textAlign: "center",
                            }}
                        >
                            {coin?.title ? coin.title.charAt(0).toUpperCase() + coin.title.slice(1) : ""}
                        </Text>

                        {/* väike vahe pealkirja ja nupu vahel */}
                        <View style={{ height: 12 }} />

                        <TouchableOpacity
                            onPress={fetchData}
                            accessibilityRole="button"
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            style={{
                                backgroundColor: "#B4CECC",
                                paddingHorizontal: 16,
                                paddingVertical: 10,
                                borderRadius: 999,
                                alignSelf: "center",
                            }}
                        >
                            <Text style={{ color: "#2b2b2bff", fontWeight: "700" }}>Uus münt</Text>
                        </TouchableOpacity>
                    </View>


                    {/* top spacer keeps coin centered even when result appears */}
                    <View style={{ flex: 1 }} />


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
                                                styles.coinLayer, isInfoVisible && styles.coinLayerRaised,
                                                {zIndex: isInfoVisible ? 1 : 2}
                                            ]}
                                        >
                                            <Animated.Image
                                                source={{ uri: coinSide === CoinSide.HEADS ? coin.headImageResource : coin.tailsImageResource }}
                                                style={[
                                                    {
                                                        width: coinSize,
                                                        height: coinSize
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
                                                                    outputRange: [0, -230], // coin shifts 230px
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
                                predicted={resultSource === "flip" ? pendingPrediction : null}
                            />
                        )}
                    </View>


                    {/* Prediction dialog */}
                    <Modal
                        visible={isDialogVisible}
                        animationType="fade"
                        transparent
                        onRequestClose={() => setIsDialogVisible(false)}
                    >
                        <View style={styles.modalBackdrop}>
                            <View style={styles.modalCard}>
                                <Text style={styles.modalTitle}>Vali oma ennustus</Text>


                                <View style={styles.choicesRow}>
                                    {/* Heads choice */}
                                    <Pressable
                                        style={styles.choiceCard}
                                        onPress={() => handleChoosePrediction(CoinSide.TAILS)}
                                        accessibilityRole="button"
                                    >
                                        <Text style={styles.choiceLabel}>Avers</Text>
                                    </Pressable>


                                    <Pressable
                                        style={styles.choiceCard}
                                        onPress={() => handleChoosePrediction(CoinSide.HEADS)}
                                        accessibilityRole="button"
                                    >
                                        <Text style={styles.choiceLabel}>Revers</Text>
                                    </Pressable>
                                </View>


                                <View style={styles.separator} />


                                <TouchableOpacity onPress={handleFlipWithoutPrediction} style={styles.skipBtn}>
                                    <Text style={styles.skipBtnText}>Viska ilma ennustuseta</Text>
                                </TouchableOpacity>


                                <TouchableOpacity onPress={() => setIsDialogVisible(false)} style={styles.closeBtn}>
                                    <Text style={styles.closeBtnText}>Sulge</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>


                    {/* BOTTOM SHEET */}
                    {isInfoVisible && (
                        <InfoBottomSheet
                            coin={coins.find(c => String(c.id) === String(coin?.id)) ?? coin}
                            onClose={closeInfoSheet}
                            bottomSheetAnim={bottomSheetAnim}
                            dragY={dragY}
                            sheetPanResponder={sheetPanResponder}
                        />
                    )}
                    
                    {/* TUTORIAL OVERLAY */}
                    <FirstRunTutorial
                        progress={tutorial}
                        onSkipStep={handleSkipStep}
                        onSkipAll={handleSkipAll}
                        onFinish={handleFinishTutorialHere}
                    />
                </>
            )}
        </View >
    );
    }

