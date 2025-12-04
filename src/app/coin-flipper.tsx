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
    StyleSheet,
    Dimensions,
    PixelRatio,
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
import {
    MaterialFilterSheet,
    DEFAULT_MATERIALS,
    MaterialStat,
} from "./MaterialFilterSheet";
import {
    CountryFilterSheet,
    DEFAULT_COUNTRIES,
    CountryStat,
} from "./CountryFilterSheet";


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
    const [countryFilterHeight, setCountryFilterHeight] = useState(0);
    const [materialFilterHeight, setMaterialFilterHeight] = useState(0);
    


    const flipAnimation = useRef(new Animated.Value(0)).current;

    const [coin, setCoin] = useState<WalletCoin | null>(null);
    const [coinSize, setCoinSize] = useState<number>(200);
    const [isFilterPage, setIsFilterPage] = useState(false);
    const [showFilterPrompt, setShowFilterPrompt] = useState(false);
    const filterPageAnim = useRef(new Animated.Value(0)).current;
    const [materialSheetOpen, setMaterialSheetOpen] = useState(false);
    const [materialStats, setMaterialStats] = useState<MaterialStat[]>(DEFAULT_MATERIALS);
    const [pendingMaterial, setPendingMaterial] = useState<string>("Kõik");
    const [countrySheetOpen, setCountrySheetOpen] = useState(false);
    const [countryStats, setCountryStats] = useState<CountryStat[]>(DEFAULT_COUNTRIES);
    const [pendingCountry, setPendingCountry] = useState<string>("Kõik");
    const [nominalStats] = useState<{ key: string; label: string; count: number; }[]>([
        { key: "Kõik", label: "Kõik", count: 20 },
        { key: "1", label: "1", count: 8 },
        { key: "1/2", label: "1/2", count: 5 },
        { key: "2", label: "2", count: 3 },
        { key: "5", label: "5", count: 1 },
    ]);
    const [pendingNominal, setPendingNominal] = useState<string>("Kõik");
    const [nameStats] = useState<{ key: string; label: string; count: number; }[]>([
        { key: "Kõik", label: "Kõik", count: 24 },
        { key: "Kopikat", label: "Kopikat", count: 9 },
        { key: "Kroon", label: "Kroon", count: 6 },
        { key: "Rubla", label: "Rubla", count: 5 },
        { key: "Penn", label: "Penn", count: 4 },
        { key: "Denaar", label: "Denaar", count: 3 },
        { key: "Fennig", label: "Fennig", count: 2 },
    ]);
    const [pendingName, setPendingName] = useState<string>("Kõik");

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
    
    const fetchData = async (forceNew: boolean = false) => {
        // If it came from Wallet with a specific coinId, do not generate a new coin unless forced
        if (routeParams?.coinId && !forceNew) return;
        setCoin(null);
        setLastResult(null);
        setPendingPrediction(null);
        const generatedCoin = await coinService.generateNewCoin();
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
        fetchData();
    }, [routeParams?.coinId]);

    // Keep filter selection in sync with the currently visible coin
    useEffect(() => {
        const material = coin?.material ?? "K€ćik";
        setPendingMaterial(material);
    }, [coin?.material]);

    useEffect(() => {
        const country = coin?.region ?? "KĆµik";
        setPendingCountry(country);
    }, [coin?.region]);


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
    const resetCoinPose = () => {
        renderScale.setValue(1);
        lastScaleRef.current = 1;
        translate.setValue({ x: 0, y: 0 });
        panOffset.current = { x: 0, y: 0 };
        renderRotation.setValue(0);
        lastRotationRef.current = 0;
        setIsZoomed(false);
    };


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
        AsyncStorage.setItem("tutorial.done", "1").catch(() => { });
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

        useFocusEffect(
        useCallback(() => {
            // Whenever we return from Wallet with a back-swipe, always generate a fresh coin
            if (routeParams?.fromWallet === "back" && !routeParams?.coinId) {
                fetchData();
            }
        }, [routeParams?.fromWallet, routeParams?.coinId])
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


        // TUTORIAL: mark zoom completed when scale > 1Ć—
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
    const lastInfoCloseRef = useRef(0);
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
            setLastResult(currentCoin);    
             setResultSource("flip");
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
                    text1: "MĆ¼nt on lisatud rahakotti",
                    text2: `MĆ¼nt '${coin?.name}' on lisatud teie rahakotti šŖ™`,
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

    const handleSelectMaterial = (material: string) => {
        setPendingMaterial(material);
    };

    const handleSelectCountry = (country: string) => {
        setPendingCountry(country);
    };
    const handleSelectNominal = (nominal: string) => {
        setPendingNominal(nominal);
    };
    const handleSelectName = (name: string) => {
        setPendingName(name);
    };

    const startFilterPage = () => {
        if (isFilterPage) return;
        setIsFilterPage(true);
        setShowFilterPrompt(true);
        Animated.timing(filterPageAnim, {
            toValue: 1,
            duration: 260,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
        }).start();
        setLastResult(null);
        setResultSource("manual");
        setPendingPrediction(null);
        pendingPredictionRef.current = null;
        resetCoinPose();
        closeMaterialSheet();
        closeCountrySheet();
        if (isInfoVisible) {
            closeInfoSheet();
        }
    };

    const exitFilterPage = () => {
        setShowFilterPrompt(false);
        Animated.timing(filterPageAnim, {
            toValue: 0,
            duration: 230,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
        }).start(() => {
            setIsFilterPage(false);
            closeMaterialSheet();
            closeCountrySheet();
        });
    };

    const handleFilterRandomCoin = async () => {
        setShowFilterPrompt(false);
        await fetchData(true);
        exitFilterPage();
    };

    const handleFilterRefine = () => {
        setShowFilterPrompt(false);
        openCountrySheet();
        openMaterialSheet();
    };

    const handleApplyMaterialFilter = async () => {
        if (!pendingMaterial && !pendingCountry) return;
        setLastResult(null);
        setResultSource("manual");
        setPendingPrediction(null);
        pendingPredictionRef.current = null;
        clearFlipTimers();

        const generatedCoin = await coinService.generateCoinByMaterial(pendingMaterial);
        const hydrated = hydrateCoin(
            generatedCoin,
            pendingMaterial === "Kõik" ? generatedCoin.material ?? "Kõik" : pendingMaterial
        );
        setCoin({
            ...hydrated,
            region: pendingCountry === "Kõik" ? hydrated.region ?? "Kõik" : pendingCountry,
            nomValue: pendingNominal === "Kõik" ? (hydrated as any).nomValue : pendingNominal,
            name: pendingName === "Kõik" ? (hydrated as any).name : pendingName,
        });
        setCoinSize((160 * hydrated.diameter) / 25.4);
    };

    const closeMaterialSheet = () => {
        setMaterialSheetOpen(false);
        setCountrySheetOpen(false);
    };
    const openMaterialSheet = () => {
        // close info sheet if open
        if (isInfoVisible) closeInfoSheet();
        resetCoinPose();
        setMaterialSheetOpen(true);
    };
    const closeCountrySheet = () => {
        setCountrySheetOpen(false);
        setMaterialSheetOpen(false);
    };
    const openCountrySheet = () => {
        if (isInfoVisible) closeInfoSheet();
        resetCoinPose();
        setCountrySheetOpen(true);
    };

    // Keep info sheet closed whenever material filter is active
    useEffect(() => {
        if (materialSheetOpen && isInfoVisible) {
            closeInfoSheet();
        }
        if (countrySheetOpen && isInfoVisible) {
            closeInfoSheet();
        }
    }, [materialSheetOpen, countrySheetOpen, isInfoVisible]);


    // --- Bottom sheet animations ---
    const openInfoSheet = () => {
        if (materialSheetOpen || countrySheetOpen || isFilterPage) return;
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
    // Right -> open filter page
    // Up -> open info sheet
    // Left -> go to wallet
    const screenWidth = Dimensions.get("window").width;
    const screenHeight = Dimensions.get("window").height;
    const cmToDp = (cm: number) => (cm / 2.54) * 160; // use 160dpi baseline for dp
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

                if (!materialSheetOpen && !countrySheetOpen && !isInfoVisible && swipedRight) {
                    startFilterPage();
                    return;
                }

                if (isFilterPage) {
                    if (swipedLeft) {
                        exitFilterPage();
                    }
                    return;
                }

                if (materialSheetOpen || countrySheetOpen) {
                    if (swipedLeft) {
                        closeMaterialSheet();
                        closeCountrySheet();
                    }
                    return;
                }

                // vertical priority (info sheet)
                if (isCoinAtStart() && swipedUp) {
                    // normalize pose before sheet animation to avoid ā€drop & flipā€¯
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


    // "Mine mĆ¤ngima" action from the last tutorial step on Coin-Flipper
    const handleFinishTutorialHere = async () => {
        // If info is open, close it; otherwise just hide tutorial
        if (isInfoVisible) {
            closeInfoSheet();
        }
        setTutorial((prev) => ({ ...prev, last: true }));
        await AsyncStorage.setItem("tutorial.done", "1").catch(() => { });
    };

    const filterTranslateX = filterPageAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [screenWidth, 0],
        extrapolate: "clamp",
    });

    // --- Render ---
    return (
        <View style={styles.container} {...swipeResponder.panHandlers}>
            <Animated.View
                pointerEvents={isFilterPage ? "auto" : "none"}
                style={[
                    filterStyles.pageWrap,
                    { transform: [{ translateX: filterTranslateX }] },
                ]}
            >
                <FilterLanding
                    showPrompt={showFilterPrompt}
            onRandom={handleFilterRandomCoin}
            onRefine={handleFilterRefine}
        />
    </Animated.View>

    <CountryFilterSheet
        isOpen={countrySheetOpen}
        countries={countryStats}
        activeCountry={pendingCountry}
        onRequestClose={isFilterPage ? () => {} : closeCountrySheet}
        onSelectCountry={handleSelectCountry}
        onLayout={(e) => setCountryFilterHeight(e.nativeEvent.layout.height)}
        dragDisabled={isFilterPage}
    />
    {/* Parema serva vertikaalne riba nominaalide ja nimetuste jaoks */}
    {(materialSheetOpen || countrySheetOpen) && (
        <RightSideFilters
            topItems={nominalStats}
                    bottomItems={nameStats}
                    activeTop={pendingNominal}
                    activeBottom={pendingName}
                    onSelectTop={handleSelectNominal}
                    onSelectBottom={handleSelectName}
                    topOffset={countryFilterHeight}
                    bottomOffset={materialFilterHeight}
                />
            )}
    <MaterialFilterSheet
        isOpen={materialSheetOpen}
        materials={materialStats}
        activeMaterial={pendingMaterial}
        onRequestClose={isFilterPage ? () => {} : closeMaterialSheet}
        onSelectMaterial={handleSelectMaterial}
        onLayout={(e) => setMaterialFilterHeight(e.nativeEvent.layout.height)}
        dragDisabled={isFilterPage}
    />

            {(materialSheetOpen || countrySheetOpen) && (coin !== null || isFilterPage) && (
                <TouchableOpacity
                    style={[
                        materialStyles.applyBtn,
                        {
                            top: Math.min(
                                screenHeight - insets.bottom - 80,
                                screenHeight / 2 + (coinSize / 2) + cmToDp(1)
                            ),
                        },
                    ]}
                    disabled={!pendingMaterial && !pendingCountry}
                    onPress={handleApplyMaterialFilter}
                    accessibilityRole="button"
                >
                    <Text style={materialStyles.applyText}>Rakenda</Text>
                </TouchableOpacity>
            )}

            {!isFilterPage && coin === null && <ActivityIndicator size={64} />}
            {!isFilterPage && coin !== null && (
                <>
                    {lastResult !== null && !isFilterPage && (
            <Animated.View
              pointerEvents="box-none"
              style={{
                position: "absolute",
                top: insets.top + 20,
                left: 0,
                right: 0,
                zIndex: 10,
                alignItems: "center",
                justifyContent: "flex-start",

              }}
            >
              <Text style={styles.coinTitle}>
                {coin?.name
                  ? coin.name.charAt(0).toUpperCase() + coin.name.slice(1)
                  : ""}
              </Text>

              <TouchableOpacity
                onPress={() => fetchData(true)}
                accessibilityRole="button"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.skipBtn}
              >
                <Text style={styles.skipBtnText}>Uus mĆ¼nt</Text>
              </TouchableOpacity>
            </Animated.View>
          )}


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
                                                { zIndex: isInfoVisible ? 1 : 2 }
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
                        {lastResult !== null && !isZoomed && !isFilterPage && (
                            <BottomArea
                                side={lastResult}
                                predicted={resultSource === "flip" ? pendingPrediction : null}
                            />
                        )}
                    </View>


                   {!isFilterPage && isDialogVisible && (
  <>
    {/* Bottom sheet with drag */}
    <Animated.View
      style={[styles.predictionSheet, { transform: [{ translateY: dragY }] }]}
      {...sheetPanResponder.panHandlers}
    >
      <Text style={styles.predictionTitle}>Vali oma ennustus</Text>

      <View style={styles.choicesRow}>
        <Pressable
          style={styles.choiceCard}
          onPress={() => handleChoosePrediction(CoinSide.HEADS)}
        >
          <Text style={styles.choiceLabel}>Kiri</Text>
        </Pressable>

        <Pressable
          style={styles.choiceCard}
          onPress={() => handleChoosePrediction(CoinSide.TAILS)}
        >
          <Text style={styles.choiceLabel}>Kull</Text>
        </Pressable>
      </View>

      <TouchableOpacity
        onPress={handleFlipWithoutPrediction}
        style={styles.skipBtn}
      >
        <Text style={styles.skipBtnText}>Viska ilma ennustuseta</Text>
      </TouchableOpacity>
      <TouchableOpacity
      style={{
        position: "absolute",
        right: 12,
        top: 12,
        zIndex: 20,
        padding: 8,
      }}
      onPress={() => {
        setPendingPrediction(null);
        pendingPredictionRef.current = null;
        setIsDialogVisible(false);
      }}
      accessibilityRole="button"
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Text style={{ fontSize: 20, color: "#444", fontWeight: "700" }}>x</Text>
    </TouchableOpacity>

    </Animated.View>

    
  </>
)}

                    {/* BOTTOM SHEET */}
            {isInfoVisible && !materialSheetOpen && !countrySheetOpen && (
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

type FilterLandingProps = {
    showPrompt: boolean;
    onRandom: () => void;
    onRefine: () => void;
};

const FilterLanding = ({ showPrompt, onRandom, onRefine }: FilterLandingProps) => (
    <View style={filterStyles.wrap}>
        {showPrompt && (
            <View style={filterStyles.card}>
                <Text style={filterStyles.title}>Vali, kuidas mĆ¼nti otsida</Text>
                <Text style={filterStyles.subtitle}>
                    Kas soovid kohe juhuslikku mĆ¼nti vā‚¬Ć¦i kitsendada valikut filtritega?
                </Text>
                <TouchableOpacity style={filterStyles.primaryBtn} onPress={onRandom} accessibilityRole="button">
                    <Text style={filterStyles.primaryLabel}>Juhuslik mā‚¬Ā¬nt</Text>
                </TouchableOpacity>
                <TouchableOpacity style={filterStyles.secondaryBtn} onPress={onRefine} accessibilityRole="button">
                    <Text style={filterStyles.secondaryLabel}>Kitsenda valikut</Text>
                </TouchableOpacity>
            </View>
        )}
    </View>
);

const filterStyles = StyleSheet.create({
    wrap: {
        flex: 1,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    pageWrap: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 90,
        backgroundColor: "rgba(12, 20, 22, 0.9)",
    },
    card: {
        width: "94%",
        backgroundColor: "#162023",
        borderRadius: 18,
        paddingVertical: 28,
        paddingHorizontal: 22,
        borderWidth: 1,
        borderColor: "rgba(180, 206, 204, 0.35)",
        shadowColor: "#000",
        shadowOpacity: 0.16,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 18,
        elevation: 12,
    },
    title: {
        color: "#e6f2ef",
        fontSize: 20,
        fontWeight: "800",
        marginBottom: 10,
        textAlign: "center",
    },
    subtitle: {
        color: "#d1e4e0",
        fontSize: 15,
        lineHeight: 21,
        textAlign: "center",
        marginBottom: 20,
    },
    primaryBtn: {
        backgroundColor: "#B4CECC",
        paddingVertical: 14,
        borderRadius: 10,
        marginBottom: 12,
    },
    primaryLabel: {
        color: "#102020",
        fontWeight: "800",
        fontSize: 16,
        textAlign: "center",
    },
    secondaryBtn: {
        borderWidth: 1.5,
        borderColor: "#B4CECC",
        paddingVertical: 12,
        borderRadius: 10,
    },
    secondaryLabel: {
        color: "#B4CECC",
        fontWeight: "800",
        fontSize: 15,
        textAlign: "center",
    },
});

const materialStyles = StyleSheet.create({
    applyBtn: {
        position: "absolute",
        alignSelf: "center",
        backgroundColor: "#B4CECC",
        paddingHorizontal: 22,
        paddingVertical: 12,
        borderRadius: 8,
        zIndex: 30,
        elevation: 12,
    },
    applyText: {
        color: "#1b1f1f",
        fontWeight: "800",
        fontSize: 16,
        textAlign: "center",
    },
    applyHint: {
        color: "#273230",
        fontWeight: "700",
        fontSize: 12,
        textAlign: "center",
        marginTop: 2,
        opacity: 0.8,
    },
});

type SideFiltersProps = {
    topItems: { key: string; label: string; count: number }[];
    bottomItems: { key: string; label: string; count: number }[];
    activeTop: string;
    activeBottom: string;
    onSelectTop: (key: string) => void;
    onSelectBottom: (key: string) => void;
    topOffset?: number;
    bottomOffset?: number;
};

const RightSideFilters = ({
    topItems,
    bottomItems,
    activeTop,
    activeBottom,
    onSelectTop,
    onSelectBottom,
    topOffset = 0,
    bottomOffset = 0,
}: SideFiltersProps) => {
    const palette = ["#3a5f5b", "#2c4b47", "#456d67", "#365752", "#5a8c84"];
    const [layout, setLayout] = useState({ w: 0, h: 0 });
    const [modalSizeTop, setModalSizeTop] = useState({ w: 0, h: 0 });
    const [modalSizeBottom, setModalSizeBottom] = useState({ w: 0, h: 0 });
    const [showOtherTop, setShowOtherTop] = useState(false);
    const [showOtherBottom, setShowOtherBottom] = useState(false);
    const insets = useSafeAreaInsets();
    const screenHeight = Dimensions.get("window").height;
    const isAll = (val: string | undefined) => {
        const v = (val || "").toLowerCase();
        const norm = typeof v.normalize === "function" ? v.normalize("NFD").replace(/[^a-z]/g, "") : v;
        return norm === "koik";
    };
    const fallbackMaterial = Math.max(screenHeight * 0.135, 128) + insets.bottom + 12;
    const topMargin = topOffset > 0 ? topOffset + insets.top + 12 : fallbackMaterial;
    const bottomMargin = bottomOffset > 0 ? Math.max(60, bottomOffset - insets.top + 8) : fallbackMaterial;
    const sidebarHeight = Math.max(60, screenHeight - (topMargin + bottomMargin));
    const sectionGap = Math.max(12, sidebarHeight * 0.04);
    const usableHeight = Math.max(40, sidebarHeight - sectionGap);
    const nominalHeight = Math.max(30, usableHeight * 0.5);
    const namesHeight = Math.max(30, usableHeight - nominalHeight);

    const prepareBuckets = (items: { key: string; label: string; count: number }[], activeKey: string) => {
        const filtered = items
            .filter((i) => !isAll(i.key))
            .sort((a, b) => (b.count || 0) - (a.count || 0));
        const primary = filtered.slice(0, 6);
        const others = filtered.slice(6);
        const otherCount = Math.max(1, others.reduce((sum, item) => sum + (item.count || 1), 0));
        const primaryWithOther = others.length > 0 ? [...primary, { key: "__other__", label: "Muud", count: otherCount }] : primary;
        const normalizedActive = isAll(activeKey) ? "" : activeKey;
        return { primary: primaryWithOther, others, normalizedActive };
    };

    const renderTreemapGrid = (
        items: { key: string; label: string; count: number }[],
        activeKey: string,
        width: number,
        height: number,
        onSelect: (key: string) => void,
        paletteOffset: number
    ) => {
        if (items.length === 0) return null;

        const left: typeof items = [];
        const right: typeof items = [];
        let sumLeft = 0;
        let sumRight = 0;
        items.forEach((m) => {
            if (sumLeft <= sumRight) {
                left.push(m);
                sumLeft += m.count || 1;
            } else {
                right.push(m);
                sumRight += m.count || 1;
            }
        });

        const colWidth = width / 2;
        const placeCol = (col: typeof items, colSum: number, x: number, offset: number) => {
            const factor = colSum > 0 ? height / colSum : 0;
            let y = 0;
            return col.map((m, idx) => {
                const isLast = idx === col.length - 1;
                let h = Math.max(20, (m.count || 1) * factor);
                if (isLast) {
                    h = height - y;
                }
                const block = (
                    <TouchableOpacity
                        key={`${m.key}-${x}-${idx}`}
                        onPress={() => onSelect(m.key)}
                        style={[
                            sideStyles.block,
                            {
                                left: x,
                                top: y,
                                width: colWidth,
                                height: h,
                                backgroundColor: activeKey === m.key ? "#7bd7cc" : palette[(offset + idx) % palette.length],
                            },
                        ]}
                        accessibilityRole="button"
                    >
                        <Text
                            style={sideStyles.label}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            minimumFontScale={0.7}
                            ellipsizeMode="clip"
                            maxFontSizeMultiplier={1.1}
                        >
                            {m.label}
                        </Text>
                    </TouchableOpacity>
                );
                y += h;
                return block;
            });
        };

        const sumLeftCount = left.reduce((s, m) => s + (m.count || 1), 0);
        const sumRightCount = right.reduce((s, m) => s + (m.count || 1), 0);

        return (
            <>
                {placeCol(left, sumLeftCount, 0, paletteOffset)}
                {placeCol(right, sumRightCount, colWidth, paletteOffset + left.length)}
            </>
        );
    };

    const topBuckets = prepareBuckets(topItems, activeTop);
    const bottomBuckets = prepareBuckets(bottomItems, activeBottom);

    return (
        <View
            pointerEvents="auto"
            style={[
                sideStyles.wrap,
                { top: topMargin, bottom: bottomMargin },
            ]}
            onLayout={(e) => {
                const { width, height } = e.nativeEvent.layout;
                setLayout({ w: width, h: height });
            }}
        >
            {layout.w > 0 && sidebarHeight > 0 && (
                <>
                    <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: nominalHeight }}>
                        {renderTreemapGrid(topBuckets.primary, topBuckets.normalizedActive, layout.w, nominalHeight, (key) => {
                            if (key === "__other__") {
                                setShowOtherTop(true);
                                return;
                            }
                            const next = key === activeTop ? "Kõik" : key;
                            onSelectTop(next);
                        }, 0)}
                    </View>
                    <View
                        style={{
                            position: "absolute",
                            left: 0,
                            right: 0,
                            top: nominalHeight + sectionGap,
                            height: namesHeight,
                        }}
                    >
                        {renderTreemapGrid(bottomBuckets.primary, bottomBuckets.normalizedActive, layout.w, namesHeight, (key) => {
                            if (key === "__other__") {
                                setShowOtherBottom(true);
                                return;
                            }
                            const next = key === activeBottom ? "Kõik" : key;
                            onSelectBottom(next);
                        }, 3)}
                    </View>
                </>
            )}

            <Modal
                transparent
                visible={showOtherTop}
                animationType="fade"
                onRequestClose={() => setShowOtherTop(false)}
            >
                <Pressable style={sideStyles.modalBackdrop} onPress={() => setShowOtherTop(false)}>
                    <View style={sideStyles.modalCard} onStartShouldSetResponder={() => true} onTouchEnd={(e) => e.stopPropagation()}>
                        <Text style={sideStyles.modalTitle}>Muud nominaalid</Text>
                        <View style={sideStyles.modalTreemapWrap}>
                            <View
                                style={StyleSheet.absoluteFillObject}
                                pointerEvents="none"
                                onLayout={(e) => {
                                    const { width, height } = e.nativeEvent.layout;
                                    setModalSizeTop({ w: width, h: height });
                                }}
                            />
                            {renderTreemapGrid(
                                topBuckets.others,
                                topBuckets.normalizedActive,
                                modalSizeTop.w > 0 ? modalSizeTop.w : layout.w,
                                modalSizeTop.h > 0 ? modalSizeTop.h : Math.max(160, nominalHeight * 2),
                                (key) => {
                                    const next = key === activeTop ? "Kõik" : key;
                                    onSelectTop(next);
                                    setShowOtherTop(false);
                                },
                                0
                            )}
                        </View>
                    </View>
                </Pressable>
            </Modal>

            <Modal
                transparent
                visible={showOtherBottom}
                animationType="fade"
                onRequestClose={() => setShowOtherBottom(false)}
            >
                <Pressable style={sideStyles.modalBackdrop} onPress={() => setShowOtherBottom(false)}>
                    <View style={sideStyles.modalCard} onStartShouldSetResponder={() => true} onTouchEnd={(e) => e.stopPropagation()}>
                        <Text style={sideStyles.modalTitle}>Muud nimetused</Text>
                        <View style={sideStyles.modalTreemapWrap}>
                            <View
                                style={StyleSheet.absoluteFillObject}
                                pointerEvents="none"
                                onLayout={(e) => {
                                    const { width, height } = e.nativeEvent.layout;
                                    setModalSizeBottom({ w: width, h: height });
                                }}
                            />
                            {renderTreemapGrid(
                                bottomBuckets.others,
                                bottomBuckets.normalizedActive,
                                modalSizeBottom.w > 0 ? modalSizeBottom.w : layout.w,
                                modalSizeBottom.h > 0 ? modalSizeBottom.h : Math.max(160, namesHeight * 2),
                                (key) => {
                                    const next = key === activeBottom ? "Kõik" : key;
                                    onSelectBottom(next);
                                    setShowOtherBottom(false);
                                },
                                2
                            )}
                        </View>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
};
const sideStyles = StyleSheet.create({
    wrap: {
        position: "absolute",
        right: 0,
        width: "26%",
        paddingTop: 12,
        paddingBottom: 12,
        paddingHorizontal: 4,
        zIndex: 140,
    },
    block: {
        position: "absolute",
        left: 0,
        right: 0,
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: "#1f2a29",
    },
    label: {
        color: "#e7f2ef",
        fontWeight: "700",
        fontSize: 11,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 18,
    },
    modalCard: {
        width: "100%",
        maxWidth: 420,
        backgroundColor: "rgba(22, 32, 35, 0.96)",
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 12,
        elevation: 16,
    },
    modalTitle: {
        color: "#e7f2ef",
        fontWeight: "800",
        fontSize: 16,
        marginBottom: 10,
        textAlign: "center",
    },
    modalTreemapWrap: {
        width: "100%",
        aspectRatio: 1,
        maxHeight: 360,
        overflow: "hidden",
    },
});












