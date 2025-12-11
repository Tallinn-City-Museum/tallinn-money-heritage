import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Pressable,
    PanResponder,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { styles as commonStyles } from "../components/common/stylesheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FirstRunTutorial, TutorialProgress, TutorialStepKey } from "../components/tutorial/first-run-tutorial";
import { MaterialFilterSheet } from "./MaterialFilterSheet";
import { CountryFilterSheet } from "./CountryFilterSheet";
import { AggregatedCoinMeta, MaterialStat, CountryStat, NominalStat, NameStat } from "../data/entity/aggregated-meta";
import { buildLayeredBuckets } from "../utils/filterBuckets";

type CoinFilterRow = {
    country: string;
    material: string;
    nominal: string;
    name: string;
    period: string;
};

const PERIOD_CLUSTERS = [
    { key: "1400-1500", label: "1400-1500" },
    { key: "1500-1550", label: "1500-1550" },
    { key: "1550-1700", label: "1550-1700" },
    { key: "1700-1800", label: "1700-1800" },
    { key: "1800-1900", label: "1800-1900" },
    { key: "1900-1950", label: "1900-1950" },
    { key: "other", label: "Muud" },
];

const PERIOD_LABELS = PERIOD_CLUSTERS.reduce<Record<string, string>>((acc, item) => {
    acc[item.key] = item.label;
    return acc;
}, {});
const PROGRESS_KEY = "tutorial.progress";
const STORAGE_DONE_KEY = "tutorial.done";

// Weighted pattern gives the 1500-1550 slice a bit more presence to match the supplied clusters
const PERIOD_PATTERN = [0, 1, 1, 2, 3, 4, 5, 6];
type BaseFilterRow = Omit<CoinFilterRow, "period">;

const RAW_FILTER_DATA: BaseFilterRow[] = [
    { country: "Saksamaa", material: "Vask", nominal: "2", name: "Mark" },
    { country: "Saksamaa", material: "Hõbe", nominal: "1", name: "Mark" },
    { country: "Saksamaa", material: "Vask", nominal: "5", name: "Fennig" },
    { country: "Saksamaa", material: "Hõbe", nominal: "10", name: "Fennig" },
    { country: "Saksamaa", material: "Nikkel", nominal: "20", name: "Mark" },
    { country: "Saksamaa", material: "Messing", nominal: "50", name: "Fennig" },
    { country: "Venemaa", material: "Vask", nominal: "2", name: "Kopikat" },
    { country: "Venemaa", material: "Hõbe", nominal: "1", name: "Rubla" },
    { country: "Venemaa", material: "Hõbe", nominal: "10", name: "Rubla" },
    { country: "Venemaa", material: "Vask", nominal: "5", name: "Kopikat" },
    { country: "Venemaa", material: "Pronks", nominal: "1/2", name: "Denaar" },
    { country: "Venemaa", material: "Nikkel", nominal: "100", name: "Rubla" },
    { country: "Rootsi", material: "Hõbe", nominal: "1", name: "Taaler" },
    { country: "Rootsi", material: "Vask", nominal: "2", name: "Taaler" },
    { country: "Rootsi", material: "Pronks", nominal: "5", name: "Penn" },
    { country: "Rootsi", material: "Messing", nominal: "10", name: "Penn" },
    { country: "Eesti", material: "Vask", nominal: "2", name: "Kroon" },
    { country: "Eesti", material: "Vask", nominal: "1", name: "Kroon" },
    { country: "Eesti", material: "Nikkel", nominal: "20", name: "Kroon" },
    { country: "Eesti", material: "Hõbe", nominal: "50", name: "Kroon" },
    { country: "Poola", material: "Vask", nominal: "5", name: "Zloty" },
    { country: "Poola", material: "Hõbe", nominal: "10", name: "Zloty" },
    { country: "Läti", material: "Vask", nominal: "2", name: "Lats" },
    { country: "Läti", material: "Hõbe", nominal: "1", name: "Lats" },
    { country: "Norra", material: "Messing", nominal: "10", name: "Kroon" },
    { country: "Norra", material: "Pronks", nominal: "20", name: "Kroon" },
    { country: "Itaalia", material: "Alumiinium", nominal: "1", name: "Lira" },
    { country: "Itaalia", material: "Plii", nominal: "2", name: "Lira" },
    { country: "Hispaania", material: "Raud", nominal: "5", name: "Peseta" },
    { country: "Hispaania", material: "Tsingi sulam", nominal: "10", name: "Peseta" },
    { country: "Taani", material: "Terassulam", nominal: "50", name: "Kroon" },
    { country: "Taani", material: "Hõbe", nominal: "100", name: "Kroon" },
    { country: "Ukraina", material: "Vask", nominal: "2", name: "Hryvnia" },
    { country: "Ukraina", material: "Hõbe", nominal: "5", name: "Hryvnia" },
    { country: "Leedu", material: "Nikkel", nominal: "1", name: "Litt" },
    { country: "Leedu", material: "Messing", nominal: "2", name: "Litt" },
    { country: "USA", material: "Kuld", nominal: "20", name: "Dollar" },
    { country: "USA", material: "Vask", nominal: "1", name: "Penny" },
    { country: "USA", material: "Hõbe", nominal: "50", name: "Dollar" },
    { country: "Inglismaa", material: "Hõbe", nominal: "1", name: "Sikkel" },
    { country: "Inglismaa", material: "Vask", nominal: "2", name: "Florin" },
    { country: "Inglismaa", material: "Pronks", nominal: "5", name: "Penn" },
];

const MOCK_FILTER_DATA: CoinFilterRow[] = RAW_FILTER_DATA.map((row, idx) => {
    const bucketIdx = PERIOD_PATTERN[idx % PERIOD_PATTERN.length];
    const cluster = PERIOD_CLUSTERS[bucketIdx] ?? PERIOD_CLUSTERS[0];
    return { ...row, period: cluster.key };
});

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

const BASE_COUNTRY_STATS: CountryStat[] = buildStats(MOCK_FILTER_DATA.map((row) => row.country));
const BASE_MATERIAL_STATS: MaterialStat[] = buildStats(MOCK_FILTER_DATA.map((row) => row.material));
const BASE_NOMINAL_STATS: { key: string; label: string; count: number }[] = buildStats(
    MOCK_FILTER_DATA.map((row) => row.nominal)
);
const BASE_NAME_STATS: { key: string; label: string; count: number }[] = buildStats(
    MOCK_FILTER_DATA.map((row) => row.name)
);
const BASE_PERIOD_STATS: AggregatedCoinMeta[] = buildStats(
    MOCK_FILTER_DATA.map((row) => row.period),
    PERIOD_LABELS
) as AggregatedCoinMeta[];
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
    const [showPrompt, setShowPrompt] = useState(false);
    const [materialSheetOpen, setMaterialSheetOpen] = useState(true);
    const [countrySheetOpen, setCountrySheetOpen] = useState(true);
    const [materialStats, setMaterialStats] = useState<MaterialStat[]>(BASE_MATERIAL_STATS);
    const [pendingMaterial, setPendingMaterial] = useState<string>("");
    const [countryStats, setCountryStats] = useState<CountryStat[]>(BASE_COUNTRY_STATS);
    const [pendingCountry, setPendingCountry] = useState<string>("");
    const [nominalStats, setNominalStats] = useState<NominalStat[]>(BASE_NOMINAL_STATS);
    const [pendingNominal, setPendingNominal] = useState<string>("");
    const [nameStats, setNameStats] = useState<NameStat[]>(BASE_NAME_STATS);
    const [pendingName, setPendingName] = useState<string>("");
    const [periodStats, setPeriodStats] = useState<AggregatedCoinMeta[]>(BASE_PERIOD_STATS);
    const [pendingPeriod, setPendingPeriod] = useState<string>("");
    const [topOtherPage, setTopOtherPage] = useState(-1);
    const [bottomOtherPage, setBottomOtherPage] = useState(-1);
    const [tutorial, setTutorial] = useState<TutorialProgress>(buildInitialTutorial);
    const [tutorialHydrated, setTutorialHydrated] = useState(false);
    const [tutorialRunKey, setTutorialRunKey] = useState(0);
    const [tutorialDone, setTutorialDone] = useState(false);
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

    // If global tutorial is cleared (e.g., via icon), remount filter steps once
    useEffect(() => {
        if (!tutorialHydrated) return;
        if (lastDoneRef.current === false && tutorialDone === false) return;
        if (tutorialDone === false) {
            // wipe filter tutorial progress so steps show again
            AsyncStorage.removeItem(PROGRESS_KEY).catch(() => {});
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
            MOCK_FILTER_DATA.filter((row) => {
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

        const source = matched.length > 0 ? matched : MOCK_FILTER_DATA;
        const availableCountries = buildStats(source.map((row) => row.country));
        const availableMaterials = buildStats(source.map((row) => row.material));
        const availableNominals = buildStats(source.map((row) => row.nominal));
        const availableNames = buildStats(source.map((row) => row.name));
        const availablePeriods = buildStats(source.map((row) => row.period), PERIOD_LABELS);

        setCountryStats(mergeStatsWithAvailability(BASE_COUNTRY_STATS, availableCountries));
        setMaterialStats(mergeStatsWithAvailability(BASE_MATERIAL_STATS, availableMaterials));
        setNominalStats(mergeStatsWithAvailability(BASE_NOMINAL_STATS, availableNominals));
        setNameStats(mergeStatsWithAvailability(BASE_NAME_STATS, availableNames));
        setPeriodStats(mergeStatsWithAvailability(BASE_PERIOD_STATS, availablePeriods));

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
            <CountryFilterSheet
                isOpen={countrySheetOpen}
                countries={countryStats}
                activeCountry={pendingCountry}
                onRequestClose={() => setCountrySheetOpen(false)}
                onSelectCountry={handleSelectCountry}
                onLayout={(e) => setCountryFilterHeight(e.nativeEvent.layout.height)}
            />

            {(materialSheetOpen || countrySheetOpen) && (
                <PeriodFilterRail
                    items={periodStats}
                    activePeriod={pendingPeriod}
                    onSelectPeriod={handleSelectPeriod}
                    topOffset={countryFilterHeight}
                    bottomOffset={materialFilterHeight}
                />
            )}

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
                    onRequestClose={() => setMaterialSheetOpen(false)}
                    onSelectMaterial={handleSelectMaterial}
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
                        ignorePersistedDone
                    />
                </View>
            )}
        </View>
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

type PeriodFilterRailProps = {
    items: AggregatedCoinMeta[];
    activePeriod: string;
    onSelectPeriod: (key: string) => void;
    topOffset?: number;
    bottomOffset?: number;
};

const PeriodFilterRail = ({
    items,
    activePeriod,
    onSelectPeriod,
    topOffset = 0,
    bottomOffset = 0,
}: PeriodFilterRailProps) => {
    const insets = useSafeAreaInsets();
    const screenHeight = Dimensions.get("window").height;

    const fallbackMaterial = Math.max(screenHeight * 0.135, 128) + insets.bottom + 12;

const sidebarTop =
    topOffset > 0 ? topOffset + insets.top + 12 : fallbackMaterial;

const sidebarBottom =
    bottomOffset > 0 ? Math.max(60, bottomOffset - insets.top + 8) : fallbackMaterial;
    const sidebarHeight = Math.max(80, screenHeight - sidebarTop - sidebarBottom);

    const palette = ["#31544f", "#365c55", "#406a63", "#2b4c46", "#548a80", "#3a5f5b", "#456d67"];

    const [layout, setLayout] = useState({ w: 0, h: 0 });

    // ----- Treemap builder (same style as RightSideFilters) -----
    const renderTreemap = () => {
        if (layout.w <= 0 || layout.h <= 0) return null;

        const sorted = [...items].sort((a, b) => (b.count || 1) - (a.count || 1));

        const left: typeof sorted = [];
        const right: typeof sorted = [];
        let sumLeft = 0;
        let sumRight = 0;

        sorted.forEach((item) => {
            if (sumLeft <= sumRight) {
                left.push(item);
                sumLeft += item.count || 1;
            } else {
                right.push(item);
                sumRight += item.count || 1;
            }
        });

        const colWidth = layout.w / 2;

        const placeCol = (colItems: typeof sorted, sum: number, x: number) => {
            const factor = layout.h / sum;
            let y = 0;

            return colItems.map((item, idx) => {
                let h = (item.count || 1) * factor;
                if (idx === colItems.length - 1) {
                    h = layout.h - y; // fill last block
                }

                const active = activePeriod === item.key;

        
                const isAvailable = item.available ?? true;
                const backgroundColor = active
                    ? "#7bd7cc"
                    : isAvailable
                        ? palette[idx % palette.length]
                        : "#1f2a29";
                const blockOpacity = active ? 0.94 : isAvailable ? 1 : 0.35;
                const labelColor = isAvailable ? "#e7f2ef" : "#7a8c88";
                const handlePress = () => {
                    if (!isAvailable) return;
                    onSelectPeriod(active ? "" : item.key);
                };
                const block = (
                    <TouchableOpacity
                        key={`${item.key}-${idx}`}
                        onPress={handlePress}
                        style={{
                            position: "absolute",
                            left: x,
                            top: y,
                            width: colWidth,
                            height: h,
                            borderRadius: 6,
                            borderWidth: 1,
                            borderColor: "#1f2a29",
                            paddingHorizontal: 8,
                            paddingVertical: 8,
                            backgroundColor,
                            opacity: blockOpacity,
                        }}
                        accessibilityRole="button"
                        accessibilityState={{ disabled: !isAvailable }}
                    >
                        <Text
                            numberOfLines={2}
                            style={{
                                color: labelColor,
                                fontWeight: "700",
                                fontSize: 12,
                            }}
                        >
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                );

                y += h;
                return block;
            });
        };

        return (
            <>
                {placeCol(left, sumLeft, 0)}
                {placeCol(right, sumRight, colWidth)}
            </>
        );
    };

    return (
        <View
            pointerEvents="auto"
            style={[
                {
                    position: "absolute",
                    left: 0,
                    width: "26%",
                    top: sidebarTop,
                    bottom: sidebarBottom,
                    padding: 0,
                    zIndex: 130,
                },
            ]}
        >
            <View
                style={{ flex: 1 }}
                onLayout={(e) => {
                    const { width, height } = e.nativeEvent.layout;
                    setLayout({ w: width, h: height });
                }}
            >
                {renderTreemap()}
            </View>
        </View>
    );
};


type SideFiltersProps = {
    topItems: AggregatedCoinMeta[];
    bottomItems: AggregatedCoinMeta[];
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
    const [topPage, setTopPage] = useState(-1);
    const [bottomPage, setBottomPage] = useState(-1);
    const insets = useSafeAreaInsets();
    const screenHeight = Dimensions.get("window").height;
    const fallbackMaterial = Math.max(screenHeight * 0.135, 128) + insets.bottom + 12;
    const topMargin = topOffset > 0 ? topOffset + insets.top + 12 : fallbackMaterial;
    const bottomMargin = bottomOffset > 0 ? Math.max(60, bottomOffset - insets.top + 8) : fallbackMaterial;
    const sidebarHeight = Math.max(60, screenHeight - (topMargin + bottomMargin));
    const sectionGap = Math.max(12, sidebarHeight * 0.04);
    const usableHeight = Math.max(40, sidebarHeight - sectionGap);
    const nominalHeight = Math.max(30, usableHeight * 0.5);
    const namesHeight = Math.max(30, usableHeight - nominalHeight);

    const renderTreemapGrid = (
        items: AggregatedCoinMeta[],
        activeKey: string,
        width: number,
        height: number,
        onSelect: (key: string) => void,
        paletteOffset: number
    ) => {
        if (items.length === 0) return null;

        const left: AggregatedCoinMeta[] = [];
        const right: AggregatedCoinMeta[] = [];
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
        const placeCol = (col: AggregatedCoinMeta[], colSum: number, x: number, offset: number) => {
            const factor = colSum > 0 ? height / colSum : 0;
            let y = 0;
            return col.map((m, idx) => {
                const isLast = idx === col.length - 1;
                let h = Math.max(20, (m.count || 1) * factor);
                if (isLast) {
                    h = height - y;
                }
                const isAvailable = m.available ?? true;
                const isActive = activeKey === m.key;
                const blockColor = isActive
                    ? "#7bd7cc"
                    : isAvailable
                        ? palette[(offset + idx) % palette.length]
                        : "#1f2a29";
                const blockOpacity = isActive ? 0.94 : isAvailable ? 0.9 : 0.35;
                const labelColor = isAvailable ? "#e7f2ef" : "#7a8c88";
                const handlePress = () => {
                    if (!isAvailable) return;
                    onSelect(m.key);
                };
                const block = (
                    <TouchableOpacity
                        key={`${m.key}-${x}-${idx}`}
                        onPress={handlePress}
                        style={[
                            sideStyles.block,
                            {
                                left: x,
                                top: y,
                                width: colWidth,
                                height: h,
                                backgroundColor: blockColor,
                                opacity: blockOpacity,
                            },
                        ]}
                        accessibilityRole="button"
                        accessibilityState={{ disabled: !isAvailable }}
                    >
                        <Text
                            style={[sideStyles.label, { color: labelColor }]}
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

    const topBuckets = buildLayeredBuckets(topItems, activeTop);
    const bottomBuckets = buildLayeredBuckets(bottomItems, activeBottom);
    const showTopOthers = topPage >= 0 && topBuckets.pages.length > 0;
    const showBottomOthers = bottomPage >= 0 && bottomBuckets.pages.length > 0;
    const topChunk = showTopOthers ? topBuckets.pages[topPage] ?? [] : [];
    const topMoreTile = showTopOthers ? topBuckets.moreIndicators[topPage] : null;
    const bottomChunk = showBottomOthers ? bottomBuckets.pages[bottomPage] ?? [] : [];
    const bottomMoreTile = showBottomOthers ? bottomBuckets.moreIndicators[bottomPage] : null;
    const returnTile = {
        key: "__return__",
        label: "Tagasi",
        count: 1,
        available: true,
        availableCount: 1,
    };
    const topDisplayItems = showTopOthers
        ? [...topChunk, ...(topMoreTile ? [topMoreTile] : []), returnTile]
        : topBuckets.primary;
    const bottomDisplayItems = showBottomOthers
        ? [...bottomChunk, ...(bottomMoreTile ? [bottomMoreTile] : []), returnTile]
        : bottomBuckets.primary;
    const topActiveKey = showTopOthers ? activeTop : topBuckets.normalizedActive;
    const bottomActiveKey = showBottomOthers ? activeBottom : bottomBuckets.normalizedActive;

    const handleTopSelect = (key: string) => {
        if (showTopOthers) {
            if (key === "__more__") {
                setTopPage((prev) => Math.min(prev + 1, topBuckets.pages.length - 1));
                return;
            }
            if (key === "__return__") {
                setTopPage(-1);
                return;
            }
            const next = key === activeTop ? "" : key;
            onSelectTop(next);
            setTopPage(-1);
            return;
        }
        if (key === "__other__" && topBuckets.pages.length > 0) {
            setTopPage(0);
            return;
        }
        const next = key === activeTop ? "" : key;
        onSelectTop(next);
    };
    const handleBottomSelect = (key: string) => {
        if (showBottomOthers) {
            if (key === "__more__") {
                setBottomPage((prev) => Math.min(prev + 1, bottomBuckets.pages.length - 1));
                return;
            }
            if (key === "__return__") {
                setBottomPage(-1);
                return;
            }
            const next = key === activeBottom ? "" : key;
            onSelectBottom(next);
            setBottomPage(-1);
            return;
        }
        if (key === "__other__" && bottomBuckets.pages.length > 0) {
            setBottomPage(0);
            return;
        }
        const next = key === activeBottom ? "" : key;
        onSelectBottom(next);
    };

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
                        {renderTreemapGrid(topDisplayItems, topActiveKey, layout.w, nominalHeight, handleTopSelect, 0)}
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
                        {renderTreemapGrid(bottomDisplayItems, bottomActiveKey, layout.w, namesHeight, handleBottomSelect, 3)}
                    </View>
                </>
            )}


        </View>
    );
};

const periodStyles = StyleSheet.create({
    wrap: {
        position: "absolute",
        left: 0,
        width: "26%",
        paddingTop: 6,
        paddingHorizontal: 6,
        zIndex: 130,
    },
    header: {
        color: "#dfe8e4",
        fontWeight: "800",
        fontSize: 12,
        marginBottom: 6,
        paddingLeft: 4,
    },
    blocksWrap: {
        position: "absolute",
        top: 24,
        left: 0,
        right: 0,
        bottom: 0,
    },
    block: {
        position: "absolute",
        left: 0,
        right: 0,
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: "#1f2a29",
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
    },
    label: {
        color: "#e7f2ef",
        fontWeight: "700",
        fontSize: 12,
        lineHeight: 16,
    },
});

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
});

