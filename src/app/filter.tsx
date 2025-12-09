import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Modal,
    Pressable,
    PanResponder,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { styles as commonStyles } from "../components/common/stylesheet";
import { MaterialFilterSheet } from "./MaterialFilterSheet";
import { MaterialStat } from "../data/entity/aggregated-meta";
import { CountryFilterSheet} from "./CountryFilterSheet";
import { CountryStat } from "./CountryFilterSheet";

type CoinFilterRow = {
    country: string;
    material: string;
    nominal: string;
    name: string;
};

const MOCK_FILTER_DATA: CoinFilterRow[] = [
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

const buildStats = (values: string[]) => {
    const counts = new Map<string, number>();
    values.forEach((val) => {
        counts.set(val, (counts.get(val) ?? 0) + 1);
    });
    return Array.from(counts.entries())
        .map(([key, count]) => ({ key, label: key, count }))
        .sort((a, b) => {
            if ((b.count || 0) !== (a.count || 0)) {
                return (b.count || 0) - (a.count || 0);
            }
            return a.label.localeCompare(b.label);
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

export default function FilterView() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const screenHeight = Dimensions.get("window").height;
    const [countryFilterHeight, setCountryFilterHeight] = useState(0);
    const [materialFilterHeight, setMaterialFilterHeight] = useState(0);
    const [showPrompt, setShowPrompt] = useState(true);
    const [materialSheetOpen, setMaterialSheetOpen] = useState(false);
    const [countrySheetOpen, setCountrySheetOpen] = useState(false);
    const [materialStats, setMaterialStats] = useState<MaterialStat[]>(BASE_MATERIAL_STATS);
    const [pendingMaterial, setPendingMaterial] = useState<string>("");
    const [countryStats, setCountryStats] = useState<CountryStat[]>(BASE_COUNTRY_STATS);
    const [pendingCountry, setPendingCountry] = useState<string>("");
    const [nominalStats, setNominalStats] = useState<{ key: string; label: string; count: number; }[]>(BASE_NOMINAL_STATS);
    const [pendingNominal, setPendingNominal] = useState<string>("");
    const [nameStats, setNameStats] = useState<{ key: string; label: string; count: number; }[]>(BASE_NAME_STATS);
    const [pendingName, setPendingName] = useState<string>("");

    const skipAutoPickRef = useRef(false);
    const autoPickEnabledRef = useRef(true);
    const lastChangedRef = useRef<"country" | "material" | "nominal" | "name" | null>(null);

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
    };

    const syncFilterOptions = useCallback(() => {
        const hasFilters = Boolean(pendingCountry || pendingMaterial || pendingNominal || pendingName);
        const currentFilters = {
            country: pendingCountry,
            material: pendingMaterial,
            nominal: pendingNominal,
            name: pendingName,
        };

        const computeMatches = (filters: typeof currentFilters) =>
            MOCK_FILTER_DATA.filter((row) => {
                if (filters.country && row.country !== filters.country) return false;
                if (filters.material && row.material !== filters.material) return false;
                if (filters.nominal && row.nominal !== filters.nominal) return false;
                if (filters.name && row.name !== filters.name) return false;
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
        const nextCountries = buildStats(source.map((row) => row.country));
        const nextMaterials = buildStats(source.map((row) => row.material));
        const nextNominals = buildStats(source.map((row) => row.nominal));
        const nextNames = buildStats(source.map((row) => row.name));

        setCountryStats(nextCountries);
        setMaterialStats(nextMaterials);
        setNominalStats(nextNominals);
        setNameStats(nextNames);

        const skipAutoPick = skipAutoPickRef.current;
        skipAutoPickRef.current = false;

        if (
            currentFilters.country !== effectiveFilters.country ||
            currentFilters.material !== effectiveFilters.material ||
            currentFilters.nominal !== effectiveFilters.nominal ||
            currentFilters.name !== effectiveFilters.name
        ) {
            skipAutoPickRef.current = true;
            if (currentFilters.country !== effectiveFilters.country) setPendingCountry(effectiveFilters.country);
            if (currentFilters.material !== effectiveFilters.material) setPendingMaterial(effectiveFilters.material);
            if (currentFilters.nominal !== effectiveFilters.nominal) setPendingNominal(effectiveFilters.nominal);
            if (currentFilters.name !== effectiveFilters.name) setPendingName(effectiveFilters.name);
        }

        const shouldAutoPick =
            autoPickEnabledRef.current &&
            !skipAutoPick &&
            (pendingCountry || pendingMaterial || pendingNominal || pendingName);

        if (shouldAutoPick) {
            const autoPick = <T extends { key: string }>(current: string, list: T[], setter: (v: string) => void) => {
                if (list.length === 1) {
                    const only = list[0].key;
                    if (current !== only) {
                        setter(only);
                    }
                }
            };

            autoPick(pendingCountry, nextCountries, setPendingCountry);
            autoPick(pendingMaterial, nextMaterials, setPendingMaterial);
            autoPick(pendingNominal, nextNominals, setPendingNominal);
            autoPick(pendingName, nextNames, setPendingName);
        }
    }, [pendingCountry, pendingMaterial, pendingName, pendingNominal]);

    useEffect(() => {
        syncFilterOptions();
    }, [pendingCountry, pendingMaterial, pendingNominal, pendingName, syncFilterOptions]);

    const handleFilterRandomCoin = () => {
        setShowPrompt(false);
        router.replace({
            pathname: "/coin-flipper",
            params: { filterReq: String(Date.now()), filterAction: "random" },
        });
    };

    const handleFilterRefine = () => {
        setShowPrompt(false);
        setPendingCountry("");
        setPendingMaterial("");
        setPendingNominal("");
        setPendingName("");
        setCountrySheetOpen(true);
        setMaterialSheetOpen(true);
    };

    const handleResetAllFilters = () => {
        skipAutoPickRef.current = true;
        autoPickEnabledRef.current = false;
        setPendingCountry("");
        setPendingMaterial("");
        setPendingNominal("");
        setPendingName("");
    };

    const handleApplyFilters = () => {
        // ensure the next visit starts with the prompt again
        setShowPrompt(true);
        router.replace({
            pathname: "/coin-flipper",
            params: {
                filterMaterial: pendingMaterial,
                filterCountry: pendingCountry,
                filterNominal: pendingNominal,
                filterName: pendingName,
                filterReq: String(Date.now()),
            },
        });
    };

    const anyFilterSelected = Boolean(pendingMaterial || pendingCountry || pendingNominal || pendingName);
    const allFiltersActive = Boolean(pendingCountry && pendingMaterial && pendingNominal && pendingName);
    const coinSize = 200;
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
            {showPrompt ? (
                <View style={filterStyles.pageWrap}>
                    <FilterLanding showPrompt onRandom={handleFilterRandomCoin} onRefine={handleFilterRefine} />
                </View>
            ) : (
                <>
                    <CountryFilterSheet
                        isOpen={countrySheetOpen}
                        countries={countryStats}
                        activeCountry={pendingCountry}
                        onRequestClose={() => setCountrySheetOpen(false)}
                        onSelectCountry={handleSelectCountry}
                        onLayout={(e) => setCountryFilterHeight(e.nativeEvent.layout.height)}
                    />

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
                </>
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
    const fallbackMaterial = Math.max(screenHeight * 0.135, 128) + insets.bottom + 12;
    const topMargin = topOffset > 0 ? topOffset + insets.top + 12 : fallbackMaterial;
    const bottomMargin = bottomOffset > 0 ? Math.max(60, bottomOffset - insets.top + 8) : fallbackMaterial;
    const sidebarHeight = Math.max(60, screenHeight - (topMargin + bottomMargin));
    const sectionGap = Math.max(12, sidebarHeight * 0.04);
    const usableHeight = Math.max(40, sidebarHeight - sectionGap);
    const nominalHeight = Math.max(30, usableHeight * 0.5);
    const namesHeight = Math.max(30, usableHeight - nominalHeight);

    const prepareBuckets = (items: { key: string; label: string; count: number }[], activeKey: string) => {
        const filtered = [...items].sort((a, b) => (b.count || 0) - (a.count || 0));
        const primary = filtered.slice(0, 6);
        const others = filtered.slice(6);
        const otherCount = Math.max(1, others.reduce((sum, item) => sum + (item.count || 1), 0));
        const primaryWithOther = others.length > 0 ? [...primary, { key: "__other__", label: "Muud", count: otherCount }] : primary;
        const normalizedActive = primaryWithOther.some((i) => i.key === activeKey)
            ? activeKey
            : others.some((i) => i.key === activeKey)
            ? "__other__"
            : activeKey;
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
                            const next = key === activeTop ? "" : key;
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
                            const next = key === activeBottom ? "" : key;
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
                                activeTop,
                                modalSizeTop.w > 0 ? modalSizeTop.w : layout.w,
                                modalSizeTop.h > 0 ? modalSizeTop.h : Math.max(160, nominalHeight * 2),
                                (key) => {
                                    const next = key === activeTop ? "" : key;
                                    onSelectTop(next);
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
                                activeBottom,
                                modalSizeBottom.w > 0 ? modalSizeBottom.w : layout.w,
                                modalSizeBottom.h > 0 ? modalSizeBottom.h : Math.max(160, namesHeight * 2),
                                (key) => {
                                    const next = key === activeBottom ? "" : key;
                                    onSelectBottom(next);
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
