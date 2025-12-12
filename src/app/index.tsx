import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { indexStyles, screenWidth } from "../components/common/stylesheet";

export default function HomeScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleExplore = async () => {
    router.replace("/coin-flipper");
  };

  const goToPage = (idx: number) => {
    setActiveIndex(idx);
    scrollRef.current?.scrollTo({ x: screenWidth * idx, animated: true });
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    if (slide !== activeIndex) {
      setActiveIndex(slide);
    }
  };

  return (
    <SafeAreaView style={indexStyles.safeArea}>
      <LinearGradient
        colors={["#000000", "#3c3d46"]}
        start={[0.5, 0]}
        end={[0.5, 1]}
        style={indexStyles.gradientBackground}
      >
        {/* Onboarding pages */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          snapToInterval={screenWidth}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={indexStyles.scrollView}
          contentContainerStyle={indexStyles.scrollContent}
        >
          {/* Page 1 */}
          <View style={[indexStyles.pageBase, indexStyles.page1]}>
            <Text style={[indexStyles.titleText, indexStyles.titleTextFirst]}>
              Iga münt jutustab loo
            </Text>
            <Text style={indexStyles.bodyText}>
              Numismaatika uurib raha ajalugu — peamiselt müntide, aga ka
              paberraha ja medalite kaudu. Mündid näitavad, kuidas võim, kunst
              ja majandus on ajas muutunud. Need väikesed esemed on väga
              mitmekesised ajalooallikad.
            </Text>
            <TouchableOpacity
              onPress={handleExplore}
              style={[indexStyles.exploreButton, { marginTop: 24 }]}
            >
              <Text style={indexStyles.exploreButtonText}>Jäta vahele</Text>
            </TouchableOpacity>
          </View>

          {/* Page 2 */}
          <View style={[indexStyles.pageBase, indexStyles.page2]}>
            <Text style={[indexStyles.titleText, indexStyles.titleTextSecond]}>
              Avers, revers ja serv
            </Text>
            <Text style={indexStyles.bodyText}>
              Mündi esikülg on avers — seal on tavaliselt valitseja portree ja
              sageli nimiväärtus. Tagakülg on revers — seal leidub vapp,
              sümbolid või dekoratiivne kujundus. Servale lisati sooned või tekst,
              et vältida mündi võltsimist.
            </Text>
          </View>

          {/* Page 3 */}
          <View style={[indexStyles.pageBase, indexStyles.page3]}>
            <Text style={[indexStyles.titleText, indexStyles.titleTextThird]}>
              Kull või kiri - juhuse võim
            </Text>
            <Text style={indexStyles.bodyText}>
              Mündiviske tava ulatub antiikaega. Roomlased otsustasid „laev või
              pea” abil, kes alustab mängu või saab eelise. Hiljem levis see
              tava üle maailma kui lihtne ja õiglane otsustamisviis.
            </Text>
          </View>

          {/* Page 4 */}
          <View style={[indexStyles.pageBase, indexStyles.page4]}>
            <Text style={[indexStyles.titleText, indexStyles.titleTextFourth]}>
              Miks just „kull ja kiri”?
            </Text>
            <Text style={[indexStyles.bodyText, indexStyles.bodyTextWithMargin]}>
              Nii hakati sellist liisuheitmise viisi nimetama tsaariajal: vene
              müntidel oli ühel pool kotkas („kull”) ja teisel pool kiri ehk
              mündi nominaalväärtus. Avasta vanu Tallinnaga seotud münte ja
              ennusta, kumb mündi külg seekord peale jääb.
            </Text>

            <TouchableOpacity
              onPress={handleExplore}
              style={indexStyles.exploreButton}
            >
              <Text style={indexStyles.exploreButtonText}>Mine avastama</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Bottom semi-circle */}
        <LinearGradient
          colors={["#000000ff", "#262729ff"]}
          start={[0, 0]}
          end={[1, 1]}
          style={indexStyles.bottomGradient}
        />

        {/* Pagination dots */}
        <View style={indexStyles.paginationContainer}>
          {[0, 1, 2, 3].map((idx) => {
            const isActive = idx === activeIndex;
            return (
              <TouchableOpacity
                key={idx}
                onPress={() => goToPage(idx)}
                style={[
                  indexStyles.paginationDotBase,
                  isActive
                    ? indexStyles.paginationDotActive
                    : indexStyles.paginationDotInactive,
                ]}
              />
            );
          })}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
