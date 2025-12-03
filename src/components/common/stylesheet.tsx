/**
 * This file contains the common stylesheet used throughout the application
 */
import { Dimensions, StyleSheet } from "react-native";
const { width, height } = Dimensions.get("window");
const verticalPadding = height * 0.05;
export const screenWidth = width;

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgb(29, 31, 31)",
    },
    coinLayer: {
        // default layer for coin
        zIndex: 20, // above bottomSheet
        elevation: 20,
    },
    coinLayerRaised: {
        // used while the sheet is open; keeps coin above the sheet even if Android re-sorts
        zIndex: 22,
        elevation: 22,
    },
    bottomArea: {
        flex: 1,
        alignItems: "center",
        paddingTop: 12,
    },
    resultText: {
        fontWeight: "700",
        color: "#e7e3e3ff",
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: "#00000096",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
    },
    modalCard: {
        width: "100%",
        maxWidth: 540,
        backgroundColor: "#ccd9d5ff",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#ffffff0f",
    },
    modalTitle: {
        color: "rgba(0, 0, 0, 1)",
        fontSize: 18,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 12,
    },
    choicesRow: {
        width: "100%",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        rowGap: 12,
        columnGap: 12,
        marginBottom: 12,
    },
    choiceCard: {
        flexBasis: "48%",
        maxWidth: "48%",
        minWidth: 120, // safety for very small phones
        alignItems: "center",
        backgroundColor: "rgb(23, 24, 35)",
        padding: 12,
        borderWidth: 1,
        borderColor: "#ffffff14",
        borderRadius: 999,
    },
    choiceLabel: {
        color: "#ccd9d5ff",
        fontWeight: "600"
    },
    separator: {
        height: 1,
        backgroundColor: "#ffffff14",
        marginVertical: 10
    },
    skipBtn: {
        alignSelf: "center",
        backgroundColor: "#B4CECC",
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 999,
    },
    skipBtnText: {
        color: "#2b2b2bff",
        fontWeight: "700"
    },
    closeBtn: {
        alignSelf: "center",
        marginTop: 10,
        padding: 8
    },
    closeBtnText: {
        color: "#5c5c5cff",
        fontWeight: "600"
    },

    // Bottom Sheet Styles    
    bottomSheet: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(29, 31, 31, 0.85)", // ← semi-transparent white
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingTop: 10,
        paddingBottom: 40,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: -3 },
        shadowRadius: 6,
        elevation: 10,
        zIndex: 10,
    },

    sheetHeader: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },

    sheetHandle: {
        width: 60,
        height: 5,
        backgroundColor: "#ccc",
        borderRadius: 3,
        marginVertical: 10,
    },

    sheetCloseBtn: {
        position: "absolute",
        right: 20,
        top: 0,
        padding: 10,
    },

    sheetCloseIcon: {
        fontSize: 18,
        color: "#ccc",
    },

    infoCard: {
        backgroundColor: "rgba(254, 237, 186, 0.7)",
        borderRadius: 20,
        padding: 15,
        marginTop: 20,
    },

    infoTitle: {
        fontWeight: "700",
        fontSize: 16,
        marginBottom: 6,
        marginTop: 12,
    },

    infoValue: {
        fontSize: 15,
        lineHeight: 22,
        color: "#000",
    },

    // Wallet Styles
    walletTitle: {
        fontSize: 28,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 8,
        color: "#B4CECC",
    },
    walletSubtitle: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 16,
        color: "#caccceff",
        fontWeight: "500",
    },
    walletArea: {
        flex: 1,
        backgroundColor: "rgb(29, 31, 31)",
        margin: 16,
        borderRadius: 16,
        position: "relative",
        overflow: "hidden",
    },
    walletCoinContainer: {
        position: "absolute",
        width: 80,
        height: 80,
        zIndex: 10,
    },
    walletEmptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    walletEmptyText: {
        fontSize: 20,
        fontWeight: "600",
        color: "#B4CECC",
        marginBottom: 8,
    },
    walletEmptySubtext: {
        fontSize: 14,
        color: "#ffffffff",
    },
    walletCoinCenterArea: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Tutorial overlay (first run)
    tutorialOverlay: {
        position: "absolute",
        top: 0, left: 0, right: 0,
        // don't cover bottom so user can swipe from bottom edge comfortably
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: 40,
        paddingHorizontal: 12,
        zIndex: 30, // sits above coin
        elevation: 30,
    },
    tutorialCard: {
        width: "100%",
        maxWidth: 560,
        backgroundColor: "#B4CECC",
        borderRadius: 16,
        padding: 16,
        paddingTop: 20,
        borderWidth: 1,
        borderColor: "",
        // subtle elevation
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    tutorialTitle: {
        color: "#2b2b2bff",
        fontSize: 16,
        fontWeight: "800",
        textAlign: "left",
        marginBottom: 6,
        paddingRight: 44,
        paddingLeft: 44,
    },
    tutorialText: {
        fontSize: 14,
        color: "#2b2b2bff",
        textAlign: "left",
        lineHeight: 20,
        paddingRight: 44,
        paddingLeft: 44,
    },
    tutorialActions: {
        marginTop: 10,
        width: "100%",
        alignItems: "flex-end",
    },
    tutorialSkipStepBtn: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 999,
        backgroundColor: "transparent",
    },
    tutorialSkipStepText: {
        color: "#91603A",
        fontWeight: "700",
    },
    tutorialClose: {
        position: "absolute",
        right: 8,
        top: 8,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#B4CECC",
        alignItems: "center",
        justifyContent: "center",
    },
    tutorialCloseText: {
        color: "#2b2b2bff",
        fontSize: 20,
        fontWeight: "800",
        lineHeight: 20,
    },

    
});

export const indexStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#22223b",
    },

    gradientBackground: {
        flex: 1,
        position: "relative",
    },

    scrollView: {
        flex: 1,
    },

    scrollContent: {
        paddingBottom: height * 0.2,
    },

    pageBase: {
        width,
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "flex-start",
        paddingHorizontal: width * 0.1,
    },

    page1: {
        paddingTop: verticalPadding * 8,
    },

    page2: {
        paddingTop: verticalPadding * 6,
    },

    page3: {
        paddingTop: verticalPadding * 7,
    },

    page4: {
        paddingTop: verticalPadding * 9,
    },

    titleText: {
        fontSize: 25,
        color: "#a5cfccff",
        textAlign: "left",
        fontFamily: "ProzaDisplay-Bold",
    },

    titleTextFirst: {
        paddingBottom: 8,
        marginBottom: 15,
    },

    titleTextSecond: {
        paddingBottom: 5,
        marginTop: width / 2,
    },

    titleTextThird: {
        paddingBottom: 8,
        marginTop: -15,
    },

    titleTextFourth: {
        paddingBottom: 8,
        marginBottom: 24,
    },

    bodyText: {
        fontSize: 18,
        color: "#ffffff",
        textAlign: "left",
        lineHeight: 24,
    },

    bodyTextWithMargin: {
        marginBottom: 30,
    },

    exploreButton: {
        backgroundColor: "#B4CECC",
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 25,
        marginBottom: -15,
    },

    exploreButtonText: {
        fontSize: 20,
        color: "#22223b",
        textAlign: "left",
        fontFamily: "ProzaDisplay-SemiBold",
    },

    bottomGradient: {
        position: "absolute",
        bottom: 0,
        left: 0,
        width: width,
        height: height * 0.08,
        borderTopLeftRadius: width / 2,
        borderTopRightRadius: width / 2,
    },

    paginationContainer: {
        position: "absolute",
        bottom: height * 0.03,
        width: "100%",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },

    paginationDotBase: {
        width: 16,
        height: 16,
        borderRadius: 8,
        margin: 7,
    },

    paginationDotActive: {
        backgroundColor: "#96c9c4ff",
        borderWidth: 2,
        borderColor: "#B4CECC",
    },

    paginationDotInactive: {
        backgroundColor: "#d1eeecff",
        borderWidth: 0,
    },
});