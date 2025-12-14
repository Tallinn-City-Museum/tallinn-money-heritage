import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Pressable,
    PanResponder,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { styles as commonStyles } from "../components/common/stylesheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FirstRunTutorial, TutorialProgress, TutorialStepKey } from "../components/tutorial/first-run-tutorial";
import {
    AggregatedCoinMeta,
    MaterialStat,
    CountryStat,
    NominalStat,
    NameStat,
    CoinFilterRow
} from "../data/entity/aggregated-meta";
import { coinStatsService } from "../service/coin-service";
import HorizontalFilterSheet from "../components/common/treemap/horizontal-filter-sheet";
import VerticalFilterSheet from "../components/common/treemap/vertical-filter-sheet";

const PROGRESS_KEY = "tutorial.progress";
const STORAGE_DONE_KEY = "tutorial.done";
const RESET_KEY = "tutorial.resetToken";

// Weighted pattern gives the 1500-1550 slice a bit more presence to match the supplied clusters
const PERIOD_PATTERN = [0, 1, 1, 2, 3, 4, 5, 6];

const buildStats = (values: string[], labelOverrides: Record<string, string> = {}) => {
    const counts = new Map<string, number>();
    values.forEach((val) => {
        counts.set(val, (counts.get(val) ?? 0) + 1);
    });
    return Array.from(counts.entries())
        .map(([key, count]) => ({ key, label: labelOverrides[key] ?? key, count }))
        .sort((a, b) => {
            if ((b.count || 0) !== (a.count || 0)) {
                return (b.count || 0) - (a.count || 0);
            }
            return a.label.localeCompare(b.label);
        });
};

const buildAvailabilityMap = (stats: { key: string; count: number }[]) =>
    new Map(stats.map((stat) => [stat.key, Math.max(stat.count || 0, 0)]));

const mergeStatsWithAvailability = <T extends AggregatedCoinMeta>(
    baseStats: T[],
    availableStats: { key: string; count: number }[]
) => {
    const availabilityMap = buildAvailabilityMap(availableStats);
    return baseStats.map((stat) => {
        const availableCount = availabilityMap.get(stat.key) ?? 0;
        return { ...stat, available: availableCount > 0, availableCount };
    });
};

const FILTER_TUTORIAL_STEPS: TutorialStepKey[] = ["filterCoins", "filteringChoice", "filterNavigation"];

const buildInitialTutorial = (): TutorialProgress => ({
    filterCoins: false,
    filteringChoice: false,
    filterNavigation: false,
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

export default function FilterView() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const screenHeight = Dimensions.get("window").height;
    const [countryFilterHeight, setCountryFilterHeight] = useState(0);
    const [materialFilterHeight, setMaterialFilterHeight] = useState(0);
    const [sideFilterHeight, setSideFilterHeight] = useState(0);
    const [showPrompt, setShowPrompt] = useState(false);
    const [materialSheetOpen, setMaterialSheetOpen] = useState(true);
    const [countrySheetOpen, setCountrySheetOpen] = useState(true);
    const [pendingMaterial, setPendingMaterial] = useState<string>("");
    const [pendingCountry, setPendingCountry] = useState<string>("");
    const [pendingNominal, setPendingNominal] = useState<string>("");
    const [pendingName, setPendingName] = useState<string>("");
    const [pendingPeriod, setPendingPeriod] = useState<string>("");

    /**
     * Coin filtering data retrieval
     */
    const [filterRows, setFilterRows] = useState<CoinFilterRow[] | null>(null);
    const [materialStats, setMaterialStats] = useState<MaterialStat[] | null>(null);
    const [countryStats, setCountryStats] = useState<CountryStat[] | null>(null);
    const [nominalStats, setNominalStats] = useState<NominalStat[] | null>(null);
    const [nameStats, setNameStats] = useState<NameStat[] | null>(null);
    const [periodStats, setPeriodStats] = useState<AggregatedCoinMeta[] | null>(null);

    // fetch the data to use for filtering
    const fetchData = async () => {
        let rawFilterRows = (await coinStatsService.getCoinFilterData());

        // set period clusters to data
        setFilterRows(rawFilterRows);

        setMaterialStats(buildStats((rawFilterRows ?? []).map(row => row.material).filter(row => row != null)));
        setCountryStats(buildStats((rawFilterRows ?? []).map(row => row.country).filter(row => row != null)));
        setNominalStats(buildStats((rawFilterRows ?? []).map(row => row.nominal).filter(row => row != null)));
        setNameStats(buildStats((rawFilterRows ?? []).map(row => row.name).filter(row => row != null)));
        setPeriodStats(buildStats(
            (rawFilterRows ?? []).map(row => row.period).filter(row => row != null),
        ));
    }

    useEffect(() => {
        fetchData()
    }, []);

    const [tutorial, setTutorial] = useState<TutorialProgress>(buildInitialTutorial);
    const [tutorialHydrated, setTutorialHydrated] = useState(false);
    const [tutorialRunKey, setTutorialRunKey] = useState(0);
    const [tutorialDone, setTutorialDone] = useState(false);
    const [resetToken, setResetToken] = useState<string | null>(null);
    const lastDoneRef = useRef<boolean | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const [rawProgress, rawDone] = await Promise.all([
                    AsyncStorage.getItem(PROGRESS_KEY),
                    AsyncStorage.getItem(STORAGE_DONE_KEY),
                ]);
                if (rawProgress) {
                    const parsed = JSON.parse(rawProgress);
                    setTutorial((prev) => ({ ...prev, ...parsed, filterCoins: true }));
                } else {
                    setTutorial((prev) => ({ ...prev, filterCoins: true }));
                }
                setTutorialDone(rawDone === "1");
            } catch {
                // ignore
            } finally {
                setTutorialHydrated(true);
            }
        })();
    }, []);

    useEffect(() => {
        if (!tutorialHydrated) return;
        AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(tutorial)).catch(() => { });
    }, [tutorial, tutorialHydrated]);

    // If tutorial is globally done, force local filter tutorial to completed to prevent overlay
    useEffect(() => {
        if (!tutorialHydrated) return;
        if (tutorialDone) {
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
            setTutorialRunKey((k) => k + 1);
        }
    }, [tutorialDone, tutorialHydrated]);

    // Auto-complete the "filterCoins" step when user is already on the Filter screen
    useEffect(() => {
        if (!tutorialHydrated) return;
        if (!tutorial.filterCoins) {
            setTutorial((prev) => ({ ...prev, filterCoins: true }));
        }
    }, [tutorialHydrated, tutorial.filterCoins]);

    // Refresh tutorial.done flag when screen gains focus so restart via icon works
    useFocusEffect(
        useCallback(() => {
            let mounted = true;
            (async () => {
                try {
                    const rawDone = await AsyncStorage.getItem(STORAGE_DONE_KEY);
                    if (mounted) setTutorialDone(rawDone === "1");
                } catch {
                    // ignore
                }
            })();
            return () => {
                mounted = false;
            };
        }, [])
    );

    // If a global reset token appears (set by the restart icon in coin-flipper), wipe filter tutorial progress
    useFocusEffect(
        useCallback(() => {
            if (!tutorialHydrated) return;

            let cancelled = false;
            const checkReset = async () => {
                try {
                    const token = await AsyncStorage.getItem(RESET_KEY);
                    if (cancelled) return;
                    if (token && token !== resetToken) {
                        await AsyncStorage.removeItem(PROGRESS_KEY).catch(() => { });
                        setTutorial(buildInitialTutorial());
                        setTutorialRunKey((k) => k + 1);
                        setTutorialDone(false);
                        lastDoneRef.current = null;
                        setResetToken(token);
                    }
                } catch {
                    // ignore
                }
            };

            checkReset();
            return () => {
                cancelled = true;
            };
        }, [tutorialHydrated, resetToken])
    );

    // If global tutorial is cleared (e.g., via icon), remount filter steps once
    useEffect(() => {
        if (!tutorialHydrated) return;
        if (lastDoneRef.current === false && tutorialDone === false) return;
        if (tutorialDone === false) {
            // wipe filter tutorial progress so steps show again
            AsyncStorage.removeItem(PROGRESS_KEY).catch(() => { });
            setTutorial({ ...buildInitialTutorial(), filterCoins: true });
            setTutorialRunKey((k) => k + 1);
        }
        lastDoneRef.current = tutorialDone;
    }, [tutorialDone, tutorialHydrated]);

    const skipAutoPickRef = useRef(false);
    const autoPickEnabledRef = useRef(true);
    const lastChangedRef = useRef<"country" | "material" | "nominal" | "name" | "period" | null>(null);
    const markTutorial = useCallback((update: Partial<TutorialProgress>) => {
        setTutorial((prev) => ({ ...prev, ...update }));
    }, []);

    const handleSelectMaterial = (material: string) => {
        lastChangedRef.current = "material";
        if (pendingMaterial === material) {
            skipAutoPickRef.current = true;
            autoPickEnabledRef.current = false;
            setPendingMaterial("");
            return;
        }
        autoPickEnabledRef.current = true;
        setPendingMaterial(material);
        if (material) markTutorial({ filteringChoice: true });
    };

    const handleSelectCountry = (country: string) => {
        lastChangedRef.current = "country";
        if (pendingCountry === country) {
            skipAutoPickRef.current = true;
            autoPickEnabledRef.current = false;
            setPendingCountry("");
            return;
        }
        autoPickEnabledRef.current = true;
        setPendingCountry(country);
        if (country) markTutorial({ filteringChoice: true });
    };
    const handleSelectNominal = (nominal: string) => {
        lastChangedRef.current = "nominal";
        if (pendingNominal === nominal) {
            skipAutoPickRef.current = true;
            autoPickEnabledRef.current = false;
            setPendingNominal("");
            return;
        }
        autoPickEnabledRef.current = true;
        setPendingNominal(nominal);
        if (nominal) markTutorial({ filteringChoice: true });
    };
    const handleSelectName = (name: string) => {
        lastChangedRef.current = "name";
        if (pendingName === name) {
            skipAutoPickRef.current = true;
            autoPickEnabledRef.current = false;
            setPendingName("");
            return;
        }
        autoPickEnabledRef.current = true;
        setPendingName(name);
        if (name) markTutorial({ filteringChoice: true });
    };
    const handleSelectPeriod = (period: string) => {
        lastChangedRef.current = "period";
        if (pendingPeriod === period) {
            skipAutoPickRef.current = true;
            autoPickEnabledRef.current = false;
            setPendingPeriod("");
            return;
        }
        autoPickEnabledRef.current = true;
        setPendingPeriod(period);
        if (period) markTutorial({ filteringChoice: true });
    };

    const syncFilterOptions = useCallback(() => {
        const hasFilters = Boolean(pendingCountry || pendingMaterial || pendingNominal || pendingName || pendingPeriod);
        const currentFilters = {
            country: pendingCountry,
            material: pendingMaterial,
            nominal: pendingNominal,
            name: pendingName,
            period: pendingPeriod,
        };

        const computeMatches = (filters: typeof currentFilters) =>
            (filterRows ?? []).filter((row) => {
                if (filters.country && row.country !== filters.country) return false;
                if (filters.material && row.material !== filters.material) return false;
                if (filters.nominal && row.nominal !== filters.nominal) return false;
                if (filters.name && row.name !== filters.name) return false;
                if (filters.period && row.period !== filters.period) return false;
                return true;
            });

        let effectiveFilters = { ...currentFilters };
        let matched = computeMatches(effectiveFilters);

        if (matched.length === 0 && hasFilters) {
            const last = lastChangedRef.current;
            const dropOrder = (["nominal", "name", "material", "country", "period"] as const)
                .filter((k) => k !== last) as (keyof typeof currentFilters)[];


            for (const key of dropOrder) {
                if (!matched.length && effectiveFilters[key]) {
                    effectiveFilters = { ...effectiveFilters, [key]: "" };
                    matched = computeMatches(effectiveFilters);
                }
            }

            if (!matched.length && last && effectiveFilters[last]) {
                effectiveFilters = { ...effectiveFilters, [last]: "" };
                matched = computeMatches(effectiveFilters);
            }
        }

        const source = matched.length > 0 ? matched : (filterRows ?? []);
        const availableCountries = buildStats(source.map((row) => row.country ?? ""));
        const availableMaterials = buildStats(source.map((row) => row.material ?? ""));
        const availableNominals = buildStats(source.map((row) => row.nominal ?? ""));
        const availableNames = buildStats(source.map((row) => row.name ?? ""));
        const availablePeriods = buildStats(source.map((row) => row.period ?? ""));

        setCountryStats(mergeStatsWithAvailability(countryStats ?? [], availableCountries));
        setMaterialStats(mergeStatsWithAvailability(materialStats ?? [], availableMaterials));
        setNominalStats(mergeStatsWithAvailability(nominalStats ?? [], availableNominals));
        setNameStats(mergeStatsWithAvailability(nameStats ?? [], availableNames));
        setPeriodStats(mergeStatsWithAvailability(periodStats ?? [], availablePeriods));

        const skipAutoPick = skipAutoPickRef.current;
        skipAutoPickRef.current = false;

        if (
            currentFilters.country !== effectiveFilters.country ||
            currentFilters.material !== effectiveFilters.material ||
            currentFilters.nominal !== effectiveFilters.nominal ||
            currentFilters.name !== effectiveFilters.name ||
            currentFilters.period !== effectiveFilters.period
        ) {
            skipAutoPickRef.current = true;
            if (currentFilters.country !== effectiveFilters.country) setPendingCountry(effectiveFilters.country);
            if (currentFilters.material !== effectiveFilters.material) setPendingMaterial(effectiveFilters.material);
            if (currentFilters.nominal !== effectiveFilters.nominal) setPendingNominal(effectiveFilters.nominal);
            if (currentFilters.name !== effectiveFilters.name) setPendingName(effectiveFilters.name);
            if (currentFilters.period !== effectiveFilters.period) setPendingPeriod(effectiveFilters.period);
        }

        const shouldAutoPick =
            autoPickEnabledRef.current &&
            !skipAutoPick &&
            (pendingCountry || pendingMaterial || pendingNominal || pendingName || pendingPeriod);

        if (shouldAutoPick) {
            const autoPick = <T extends { key: string }>(current: string, list: T[], setter: (v: string) => void) => {
                if (list.length === 1) {
                    const only = list[0].key;
                    if (current !== only) {
                        setter(only);
                    }
                }
            };

            autoPick(pendingCountry, availableCountries, setPendingCountry);
            autoPick(pendingMaterial, availableMaterials, setPendingMaterial);
            autoPick(pendingNominal, availableNominals, setPendingNominal);
            autoPick(pendingName, availableNames, setPendingName);
            autoPick(pendingPeriod, availablePeriods, setPendingPeriod);
        }
    }, [pendingCountry, pendingMaterial, pendingName, pendingNominal, pendingPeriod]);

    useEffect(() => {
        syncFilterOptions();
    }, [pendingCountry, pendingMaterial, pendingNominal, pendingName, pendingPeriod, syncFilterOptions]);

    const handleFilterRandomCoin = () => {
        setShowPrompt(false);
        router.replace({
            pathname: "/coin-flipper",
            params: { filterReq: String(Date.now()), filterAction: "random" },
        });
    };

    const handleFilterRefine = () => {
        setShowPrompt(false);
        resetFiltersToInitial();
    };

    const handleResetAllFilters = () => {
        skipAutoPickRef.current = true;
        autoPickEnabledRef.current = false;
        setPendingCountry("");
        setPendingMaterial("");
        setPendingNominal("");
        setPendingName("");
        setPendingPeriod("");
    };

    const resetFiltersToInitial = useCallback(() => {
        skipAutoPickRef.current = true;
        autoPickEnabledRef.current = true;
        setPendingCountry("");
        setPendingMaterial("");
        setPendingNominal("");
        setPendingName("");
        setPendingPeriod("");
        setCountrySheetOpen(true);
        setMaterialSheetOpen(true);
    }, []);

    const handleApplyFilters = () => {
        setShowPrompt(false);
        markTutorial({ filterNavigation: true });
        router.replace({
            pathname: "/coin-flipper",
            params: {
                filterMaterial: pendingMaterial,
                filterCountry: pendingCountry,
                filterNominal: pendingNominal,
                filterName: pendingName,
                filterPeriod: pendingPeriod,
                filterReq: String(Date.now()),
            },
        });
        resetFiltersToInitial();
    };

    const anyFilterSelected = Boolean(pendingMaterial || pendingCountry || pendingNominal || pendingName || pendingPeriod);
    const allFiltersActive = Boolean(pendingCountry && pendingMaterial && pendingNominal && pendingName && pendingPeriod);
    const handleSkipStep = (step: TutorialStepKey) => {
        if (step === "filterCoins") {
            markTutorial({
                filterCoins: true,
                filteringChoice: true,
                filterNavigation: true,
            });
            return;
        }
        markTutorial({ [step]: true } as Partial<TutorialProgress>);
    };
    const handleSkipAll = () => {
        markTutorial({
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
    };
    const coinSize = 200;
    // Reset sheets when screen gains focus and ensure they are open by default
    useFocusEffect(
        useCallback(() => {
            setShowPrompt(false);
            setCountrySheetOpen(true);
            setMaterialSheetOpen(true);
            // keep filter helper visibility as-is
        }, [])
    );
    const swipeResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: (_, g) => {
                const single = (g.numberActiveTouches ?? 1) === 1;
                return single && Math.abs(g.dx) > 12;
            },
            onMoveShouldSetPanResponder: (_, g) => {
                const single = (g.numberActiveTouches ?? 1) === 1;
                return single && Math.abs(g.dx) > Math.abs(g.dy) && Math.abs(g.dx) > 12;
            },
            onPanResponderRelease: (_, g) => {
                if (g.dx < -80 && Math.abs(g.dx) > Math.abs(g.dy)) {
                    router.replace("/coin-flipper");
                }
            },
            onPanResponderTerminationRequest: () => true,
        })
    ).current;

    return (
        <View style={[commonStyles.container, filterStyles.screen]} {...swipeResponder.panHandlers}>
            {(!filterRows || !materialStats || !countryStats || !nominalStats || !nameStats || !periodStats) && <ActivityIndicator size={64} />}
            {(filterRows && materialStats && countryStats && nominalStats && nameStats && periodStats) && (<>
                {
                    showPrompt ? (
                        <View style={filterStyles.pageWrap} >
                            <FilterLanding showPrompt onRandom={handleFilterRandomCoin} onRefine={handleFilterRefine} />
                        </View>
                    ) : (
                        <SafeAreaView
                            style={{
                                flex: 1,
                                justifyContent: "space-between",
                                width: "100%",
                                height: "100%"
                            }}
                            onLayout={e => setSideFilterHeight(e.nativeEvent.layout.height)}
                        >
                            <HorizontalFilterSheet
                                enabled={countrySheetOpen}
                                metas={countryStats}
                                activeKey={pendingCountry}
                                onSelect={handleSelectCountry}
                                displayHeightRatio={0.15}
                                onLayout={(e) => setCountryFilterHeight(e.nativeEvent.layout.height)}
                            />

                            <View
                                style={{
                                    flex: 1,
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    width: "100%",
                                    height: sideFilterHeight - materialFilterHeight - countryFilterHeight - insets.top - insets.bottom
                                }}
                            >
                                <VerticalFilterSheet
                                    enabled={materialSheetOpen || countrySheetOpen}
                                    metas={periodStats}
                                    activeKey={pendingPeriod}
                                    onSelect={handleSelectPeriod}
                                    displayWidthRatio={0.2}
                                    height={sideFilterHeight - materialFilterHeight - countryFilterHeight - insets.top - insets.bottom}
                                />

                                <View
                                    style={{
                                        height: "auto"
                                    }}
                                >
                                    <VerticalFilterSheet
                                        enabled={materialSheetOpen || countrySheetOpen}
                                        metas={nominalStats}
                                        activeKey={pendingNominal}
                                        onSelect={handleSelectNominal}
                                        displayWidthRatio={0.2}
                                        height={(sideFilterHeight - materialFilterHeight - countryFilterHeight - insets.top - insets.bottom) / 2}
                                    />

                                    <VerticalFilterSheet
                                        enabled={materialSheetOpen || countrySheetOpen}
                                        metas={nameStats}
                                        activeKey={pendingName}
                                        onSelect={handleSelectName}
                                        displayWidthRatio={0.2}
                                        height={(sideFilterHeight - materialFilterHeight - countryFilterHeight - insets.top - insets.bottom) / 2}
                                    />
                                </View>
                            </View>

                            <HorizontalFilterSheet
                                enabled={materialSheetOpen}
                                metas={materialStats}
                                activeKey={pendingMaterial}
                                onSelect={handleSelectMaterial}
                                displayHeightRatio={0.15}
                                onLayout={(e) => setMaterialFilterHeight(e.nativeEvent.layout.height)}
                            />

                            {(materialSheetOpen || countrySheetOpen) && (
                                <View
                                    pointerEvents="box-none"
                                    style={{
                                        position: "absolute",
                                        left: 0,
                                        right: 0,
                                        top: 0,
                                        bottom: 0,
                                        zIndex: 500,
                                    }}
                                >
                                    <TouchableOpacity
                                        style={[
                                            materialStyles.applyBtn,
                                            {
                                                top: Math.min(
                                                    screenHeight - insets.bottom - 160,
                                                    Math.max(insets.top + 40, screenHeight / 2 + (coinSize / 2) - 60)
                                                ),
                                            },
                                            !anyFilterSelected ? materialStyles.applyBtnDisabled : null,
                                        ]}
                                        disabled={!anyFilterSelected}
                                        onPress={handleApplyFilters}
                                        accessibilityRole="button"
                                    >
                                        <Text style={materialStyles.applyText}>Rakenda</Text>
                                    </TouchableOpacity>

                                    {allFiltersActive && (
                                        <TouchableOpacity
                                            style={[
                                                materialStyles.resetBtn,
                                                {
                                                    top: Math.min(
                                                        screenHeight - insets.bottom - 100,
                                                        Math.max(insets.top + 90, screenHeight / 2 + (coinSize / 2))
                                                    ),
                                                },
                                            ]}
                                            onPress={handleResetAllFilters}
                                            accessibilityRole="button"
                                        >
                                            <Text style={materialStyles.resetText}>Tühjenda valikud</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}

                            {tutorialHydrated && !tutorialDone && (
                                <View
                                    pointerEvents="box-none"
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        zIndex: 999,
                                    }}
                                >
                                    <FirstRunTutorial
                                        key={tutorialRunKey}
                                        progress={tutorial}
                                        onSkipStep={handleSkipStep}
                                        onSkipAll={handleSkipAll}
                                        allowedSteps={FILTER_TUTORIAL_STEPS}
                                        persistDone={false}
                                    />
                                </View>
                            )}
                        </SafeAreaView>
                    )
                }
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
                <Text style={filterStyles.title}>Vali, kuidas münti otsida</Text>
                <Text style={filterStyles.subtitle}>
                    Kas soovid kohe juhuslikku münti või kitsendada valikut filtritega?
                </Text>
                <TouchableOpacity style={filterStyles.primaryBtn} onPress={onRandom} accessibilityRole="button">
                    <Text style={filterStyles.primaryLabel}>Juhuslik münt</Text>
                </TouchableOpacity>
                <TouchableOpacity style={filterStyles.secondaryBtn} onPress={onRefine} accessibilityRole="button">
                    <Text style={filterStyles.secondaryLabel}>Kitsenda valikut</Text>
                </TouchableOpacity>
            </View>
        )}
    </View>
);

const filterStyles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "rgba(12, 20, 22, 0.9)",
        width: "100%",
    },
    pageWrap: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 90,
    },
    wrap: {
        flex: 1,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
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
        borderColor: "#B4CECC",
        borderWidth: 0,
        paddingHorizontal: 22,
        paddingVertical: 10,
        borderRadius: 10,
        zIndex: 30,
        elevation: 8,
        shadowOpacity: 0.18,
    },
    applyBtnDisabled: {
        backgroundColor: "rgba(180, 206, 204, 0.5)",
        borderColor: "rgba(180, 206, 204, 0.5)",
        opacity: 0.75,
    },
    applyText: {
        color: "#1b1f1f",
        fontWeight: "800",
        fontSize: 16,
        textAlign: "center",
    },
    resetBtn: {
        position: "absolute",
        alignSelf: "center",
        backgroundColor: "#102020",
        borderColor: "#B4CECC",
        borderWidth: 2,
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 10,
        zIndex: 30,
        elevation: 8,
        shadowOpacity: 0.18,
    },
    resetText: {
        color: "#B4CECC",
        fontWeight: "800",
        fontSize: 15,
        textAlign: "center",
    },
});