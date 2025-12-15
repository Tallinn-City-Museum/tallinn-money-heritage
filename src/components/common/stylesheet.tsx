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

    bottomCoinInfoContainer: {
        alignItems: "center",
        paddingTop: 36,
    },

    coinInfoRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
        paddingHorizontal: 16,
    },

    coinInfoName: {
        fontFamily: "ProzaDisplay-Bold",
        fontSize: 22,
        color: "#e7e3e3ff",
        marginRight: 8,
        textAlign: "center",
    },

    coinInfoSide: {
        fontFamily: "ProzaDisplay-SemiBoldItalic",
        fontSize: 22,
        color: "#e7e3e3ff",
        fontStyle: "italic",
        textAlign: "center",
    },

    predictionResultBox: {
        marginTop: 4,
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 8,
        backgroundColor: "#ccd9d5ff",
    },

    predictionResultText: {
        fontSize: 20,
        color: "#2b2b2bff",
        textAlign: "center",
        fontFamily: "ProzaDisplay-SemiBold",
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
        borderRadius: 8,
    },
    choiceLabel: {
        color: "#ccd9d5ff",
        fontWeight: "600"
    },
    skipBtn: {
        alignSelf: "center",
        backgroundColor: "#B4CECC",
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 8,
    },
    skipBtnText: {
        color: "#2b2b2bff",
        fontWeight: "700"
    },
    predictionSheet: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#ccd9d5ff", 
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 32,
        zIndex: 50,
        elevation: 10,
    },
    predictionTitle: {
        fontSize: 20,
        fontFamily: "ProzaDisplay-Bold",
        color: "#2b2b2bff",
        textAlign: "center",
        marginBottom: 16,
    },

    coinTopSpacer: {
        flex: 1,
    },

    predictionCloseButton: {
        position: "absolute",
        right: 12,
        top: 12,
        zIndex: 20,
        padding: 8,
    },

    predictionCloseIcon: {
        fontSize: 20,
        color: "#444",
        fontWeight: "700",
    },

    // Bottom Sheet Styles    
    bottomSheet: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(29, 31, 31, 0.90)",
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        paddingTop: 10,
        paddingBottom: 40,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: -3 },
        shadowRadius: 6,
        elevation: 10,
        zIndex: 10,
        overflow: "hidden",
    },

    sheetHeader: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        zIndex: 20,
        backgroundColor: "rgba(29, 31, 31, 0.95)",
        paddingTop: 4,
        paddingBottom: 14,
    },

    sheetHandle: {
        width: 60,
        height: 5,
        backgroundColor: "#ccc",
        borderRadius: 2,
        marginVertical: 10,
    },

    sheetCloseBtn: {
        position: "absolute",
        right: 20,
        top: 0,
        paddingHorizontal: 8,
        paddingVertical: 8,
        zIndex: 21,
        backgroundColor: "transparent",
        borderRadius: 6,
    },

    sheetCloseIcon: {
        fontSize: 20,
        color: "#f5f5f5",
        fontWeight: "800",
    },

    infoCard: {
        backgroundColor: "rgba(254, 237, 186, 0.7)",
        borderRadius: 8,
        padding: 15,
        marginTop: 12,
    },

    infoRow: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 4,
    },

    infoTitle: {
        fontSize: 17,
        marginBottom: 6,
        marginTop: 12,
        fontFamily: "ProzaDisplay-SemiBold",
        textAlign: "left",
        flexShrink: 1,
    },

    infoValue: {
        fontSize: 22,
        lineHeight: 22,
        fontFamily: "ProzaDisplay-Bold",
        textAlign: "right",
        flexShrink: 1,
        marginLeft: 16,
    },

    infoScroll: {
        flex: 1,
        width: "100%",
    },

    infoScrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },

    // Wallet Styles
    walletTitle: {
        fontSize: 28,
        fontFamily: "ProzaDisplay-Bold",
        textAlign: "center",
        marginBottom: 8,
        color: "#B4CECC",
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
        fontSize: 24,
        fontFamily: "ProzaDisplay-Bold",
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
        textAlign: "left",
        marginBottom: 6,
        paddingRight: 44,
        paddingLeft: 44,
        fontFamily: "ProzaDisplay-Bold",
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
        fontFamily: "ProzaDisplay-SemiBold",
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

// index page styles
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
        height,
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "flex-start",
        paddingHorizontal: width * 0.1,
        position: "relative",
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
        fontFamily: "ProzaDisplay-Regular",
    },

    bodyTextWithMargin: {
        marginBottom: 30,
    },

    exploreButton: {
        backgroundColor: "#B4CECC",
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 8,
        marginTop: 32,
        marginBottom: 30,
    },

    exploreButtonText: {
        fontSize: 20,
        color: "#22223b",
        textAlign: "left",
        fontFamily: "ProzaDisplay-SemiBold",
    },

    skipButton: {
        position: "absolute",
        right: width * 0.08,
        bottom: height * 0.001,
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

// network error
export const networkStyles = StyleSheet.create({
    offlineBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    offlineContainer: {
        width: "80%",
        maxWidth: 480,
        backgroundColor: "#B4CECC",
        borderRadius: 16,
        paddingVertical: 20,
        paddingHorizontal: 20,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5,
    },
    offlineTitle: {
        fontFamily: "ProzaDisplay-Bold",
        fontSize: 20,
        color: "#2b2b2bff",
        textAlign: "center",
        marginBottom: 10,
    },
    offlineMessage: {
        fontSize: 14,
        color: "#2b2b2bff",
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 18,
    },
    offlineButton: {
        alignSelf: "center",
        backgroundColor: "#2b2b2bff",
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    offlineButtonText: {
        fontSize: 16,
        color: "#ffffff",
        fontFamily: "ProzaDisplay-SemiBold",
        textAlign: "center",
    },
});
