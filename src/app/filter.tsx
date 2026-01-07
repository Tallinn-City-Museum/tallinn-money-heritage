import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { AggregatedCoinMeta, CoinFilterRow } from "../data/entity/aggregated-meta";
import { useEffect, useMemo, useState } from "react";
import { coinStatsService } from "../service/coin-service";
import HorizontalFilterSheet from "../components/common/treemap/horizontal-filter-sheet";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { Text } from "@react-navigation/elements";
import { styles } from "../components/common/stylesheet";

/**
 * Mainly specifies the callback function to when filtering is applied
 */
export interface FilterViewProps {
    onFilterApply: (row: CoinFilterRow) => void;
    onFilterCancel: () => void;
}

const FILTER_HEIGHT_RATIO = 0.18;

/**
 * Utility function for converting provided string values
 * into AggregatedCoinMeta array
 *
 * @param values specifies the array of string values to aggregate together
 * @returns an array of AggregatedCoinMeta values
 */
function buildStats(filteredValues: string[], originalValues: string[]): AggregatedCoinMeta[] {
    const counts = new Map<string, { count: number, filteredCount: number }>();
    originalValues.forEach(v => {
        let count = counts.get(v);
        if (count != null)
            count.count++;
        else
            count = { count: 1, filteredCount: 0 }
        counts.set(v, count)
    });

    filteredValues.forEach(v => {
        let count = counts.get(v);
        if (count != null)
            count.filteredCount++;
        else
            count = { count: 0, filteredCount: 1 }
        counts.set(v, count)
    })

    return Array.from(counts.entries()).map(([key, { count, filteredCount }]): AggregatedCoinMeta => {
        return {
            key: key,
            label: key,
            count: count,
            available: filteredCount != 0,
            availableCount: filteredCount
        }
    })
}

/**
 * Specific view component for filtering coins
 *
 * It will request CoinFilterRows from coinStatsService,
 * which can potentially make network requests
 */
export default function FilterView({
    onFilterApply,
    onFilterCancel
}: FilterViewProps) {
    /************************************
     *** Layout calculation variables ***
     ************************************/
    const insets = useSafeAreaInsets();

    /**********************
     *** Data variables ***
     **********************/
    const [originalFilterRows, setOriginalFilterRows] = useState<CoinFilterRow[]>([]);
    const [pendingFilter, setPendingFilter] = useState<CoinFilterRow>({});
    const filteredRows = useMemo(() => {
        return originalFilterRows.filter(row =>
            (pendingFilter.country == null || row.country === pendingFilter.country) &&
            (pendingFilter.material == null || row.material === pendingFilter.material) &&
            (pendingFilter.name == null || row.name === pendingFilter.name) &&
            (pendingFilter.nominal == null || row.nominal === pendingFilter.nominal) &&
            (pendingFilter.period == null || row.period === pendingFilter.period)
        );
    }, [originalFilterRows, pendingFilter]);
    const materialStats = useMemo(() => buildStats(
        filteredRows.map(row => row.material).filter(v => v != null),
        originalFilterRows.map(row => row.material).filter(v => v != null)
    ), [originalFilterRows, filteredRows]);

    const countryStats = useMemo(() => buildStats(
        filteredRows.map(row => row.country).filter(v => v != null),
        originalFilterRows.map(row => row.country).filter(v => v != null)
    ), [originalFilterRows, filteredRows]);

    const nominalStats = useMemo(() => buildStats(
        filteredRows.map(row => row.nominal).filter(v => v != null),
        originalFilterRows.map(row => row.nominal).filter(v => v != null)
    ), [originalFilterRows, filteredRows]);

    const nameStats = useMemo(() => buildStats(
        filteredRows.map(row => row.name).filter(v => v != null),
        originalFilterRows.map(row => row.name).filter(v => v != null),
    ), [originalFilterRows, filteredRows]);

    const periodStats = useMemo(() => buildStats(
        filteredRows.map(row => row.period).filter(v => v != null),
        originalFilterRows.map(row => row.period).filter(v => v != null),
    ), [originalFilterRows, filteredRows]);

    // Fetch data from coinStatsService
    const fetchData = async () => {
        let rawFilterRows = (await coinStatsService.getCoinFilterData());
        setOriginalFilterRows(rawFilterRows);
    };
    useEffect(() => { fetchData() }, []);

    /**************************
     *** Callback functions ***
     **************************/
    const onSelectMaterial = (material: string) => {
        setPendingFilter({
            country: pendingFilter.country,
            material: pendingFilter.material === material ? undefined : material,
            nominal: pendingFilter.nominal,
            name: pendingFilter.name,
            period: pendingFilter.period
        });
    };

    const onSelectCountry = (country: string) => {
        setPendingFilter({
            country: pendingFilter.country === country ? undefined : country,
            material: pendingFilter.material,
            nominal: pendingFilter.nominal,
            name: pendingFilter.name,
            period: pendingFilter.period
        });
    };

    const onSelectNominal = (nominal: string) => {
        setPendingFilter({
            country: pendingFilter.country,
            material: pendingFilter.material,
            nominal: pendingFilter.nominal === nominal ? undefined : nominal,
            name: pendingFilter.name,
            period: pendingFilter.period
        });
    };

    const onSelectName = (name: string) => {
        setPendingFilter({
            country: pendingFilter.country,
            material: pendingFilter.material,
            nominal: pendingFilter.nominal,
            name: pendingFilter.name === name ? undefined : name,
            period: pendingFilter.period
        });
    };

    const onSelectPeriod = (period: string) => {
        setPendingFilter({
            country: pendingFilter.country,
            material: pendingFilter.material,
            nominal: pendingFilter.nominal,
            name: pendingFilter.name,
            period: pendingFilter.period === period ? undefined : period
        });
    };

    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: "rgba(12, 20, 22, 0.9)",
                justifyContent: "space-between",
                width: "100%",
                height: "100%"
            }}
        >
            {(countryStats.length == 0 || periodStats.length == 0 || nominalStats.length == 0 || nameStats.length == 0 || materialStats.length == 0) &&
                <View style={styles.container}>
                    <ActivityIndicator size={64} />
                </View>
            }
            {(countryStats.length != 0 && periodStats.length != 0 && nominalStats.length != 0 && nameStats.length != 0 && materialStats.length != 0) &&
                <>
                    <HorizontalFilterSheet
                        enabled={countryStats.length > 0}
                        metas={countryStats}
                        activeKey={pendingFilter.country ?? ""}
                        onSelect={onSelectCountry}
                        displayHeightRatio={FILTER_HEIGHT_RATIO}
                    />
                    <HorizontalFilterSheet
                        enabled={periodStats.length > 0}
                        metas={periodStats}
                        activeKey={pendingFilter.period ?? ""}
                        onSelect={onSelectPeriod}
                        displayHeightRatio={FILTER_HEIGHT_RATIO}
                    />
                    <HorizontalFilterSheet
                        enabled={nominalStats.length > 0}
                        metas={nominalStats}
                        activeKey={pendingFilter.nominal ?? ""}
                        onSelect={onSelectNominal}
                        displayHeightRatio={FILTER_HEIGHT_RATIO}
                    />
                    <HorizontalFilterSheet
                        enabled={nameStats.length > 0}
                        metas={nameStats}
                        activeKey={pendingFilter.name ?? ""}
                        onSelect={onSelectName}
                        displayHeightRatio={FILTER_HEIGHT_RATIO}
                    />
                    <HorizontalFilterSheet
                        enabled={materialStats.length > 0}
                        metas={materialStats}
                        activeKey={pendingFilter.material ?? ""}
                        onSelect={onSelectMaterial}
                        displayHeightRatio={FILTER_HEIGHT_RATIO}
                    />

                    <View
                        style={{
                            width: "100%",
                            flexDirection: "row"
                        }}
                    >
                        <TouchableOpacity
                            style={{
                                backgroundColor: "#b4cecc",
                                width: "50%",
                                borderColor: "#b4cecc",
                                borderWidth: 0,
                                paddingHorizontal: 22,
                                paddingVertical: 10,
                                borderRadius: 10,
                                shadowOpacity: 0.18
                            }}
                            onPress={() => onFilterApply(pendingFilter)}
                        >
                            <Text
                                style={{
                                    color: "#1b1f1f",
                                    fontWeight: "800",
                                    fontSize: 16,
                                    textAlign: "center"
                                }}
                            >
                                Rakenda
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{
                                backgroundColor: "#102020",
                                width: "50%",
                                borderColor: "#b4cecc",
                                borderWidth: 2,
                                paddingHorizontal: 18,
                                paddingVertical: 10,
                                borderRadius: 10,
                                shadowOpacity: 0.18
                            }}
                            onPress={() => onFilterCancel()}
                        >
                            <Text
                                style={{
                                    color: "#b4cecc",
                                    fontWeight: "800",
                                    fontSize: 15,
                                    textAlign: "center"
                                }}
                            >
                                Tühjenda valikud
                            </Text>
                        </TouchableOpacity>
                    </View>
                </>
            }
        </SafeAreaView>
    )
}