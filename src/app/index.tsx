import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Image,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";


const { width, height } = Dimensions.get("window");



export default function HomeScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFirstRun, setIsFirstRun] = useState<boolean | null>(null);


 useEffect(() => {
  const checkFirstRun = async () => {
    const value = await AsyncStorage.getItem("hasRunBefore");
    if (value === "true") {
      // Kui see on juba käivitatud, suuna otse coinflipperisse
      router.replace("/coin-flipper");
      return;
    }
    // Esimene kord – leht avaneb
    setIsFirstRun(true);
  };
  checkFirstRun();
}, []);

const handleExplore = async () => {
  await AsyncStorage.setItem("hasRunBefore", "true");
  router.replace("/coin-flipper");
};

if (isFirstRun === null) {
    return null;
  }


  const goToPage = (idx: number) => {
    setActiveIndex(idx);
    scrollRef.current?.scrollTo({ x: width * idx, animated: true });
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / width);
    if (slide !== activeIndex) setActiveIndex(slide);
  };

  // Proportsionaalsed pildid ja padding
  const imageWidth = width * 1;
  const imageHeight = width * 1;
  const horizontalPadding = width * 0.05;
  const verticalPadding = height * 0.05;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#22223b" }}>
      <LinearGradient
        colors={["#000000", "#3c3d46"]}
        start={[0.5, 0]}
        end={[0.5, 1]}
        style={{ flex: 1, position: "relative" }}
      >
        {/* Scrollitavad lehed */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          snapToInterval={width}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: height * 0.2 }}
        >
          {/* 1. leht */}
          <View
            style={{
              width,
              flex: 1,
              justifyContent: "flex-start",
              alignItems: "flex-start",
              paddingHorizontal: width*0.10,
              paddingTop: verticalPadding * 8,
            }}
          >
            <Text
              style={{
                fontSize: 25,
                color: "#a5cfccff",
                fontWeight: "bold",
                textAlign: "left",
                paddingBottom: 8,
                marginBottom: 15,
              }}
            >
              Iga münt jutustab loo
            </Text>
            <Text
              style={{
                fontSize: 18,
                color: "#fff",
                textAlign: "left",
                lineHeight: 24,
              }}
            >
              Numismaatika uurib raha ajalugu – peamiselt müntide, aga ka
              paberraha ja medalite kaudu. Mündid näitavad, kuidas võim, kunst
              ja majandus on ajas muutunud. Need väikesed esemed on väga
              mitmekesised ajalooallikad.
            </Text>

            
          </View>

          {/* 2. leht */}
          <View
            style={{
              width,
              flex: 1,
              justifyContent: "flex-start",
              alignItems: "flex-start",
              paddingHorizontal: width*0.10,
              paddingTop: verticalPadding *6,
            }}
          >
            
            <Text
              style={{
                fontSize: 25,
                color: "#a5cfccff",
                fontWeight: "bold",
                textAlign: "left",
                paddingBottom: 5,
                marginTop: width/2,
              }}
            >
              Kull või kiri – juhuse võim
            </Text>
            <Text
              style={{
                fontSize: 18,
                color: "#fff",
                textAlign: "left",
                lineHeight: 24,
              }}
            >
              Mündiviske tava ulatub antiikaega. Roomlased otsustasid „laev või
              pea“ abil, kes alustab mängu või saab eelise. Hiljem levis see
              tava üle maailma kui lihtne ja õiglane otsustamisviis.
            </Text>
          </View>

          {/* 3. leht */}
          <View
            style={{
              width,
              flex: 1,
              justifyContent: "flex-start",
              alignItems: "flex-start",
              paddingHorizontal: width*0.10,
              paddingTop: verticalPadding*7,
            }}
          >
           
            <Text
              style={{
                fontSize: 25,
                color: "#a5cfccff",
                fontWeight: "bold",
                textAlign: "left",
                paddingBottom: 8,
                marginTop: -15,
              }}
            >
              Miks just “kull ja kiri”?
            </Text>
            <Text
              style={{
                fontSize: 18,
                color: "#fff",
                textAlign: "left",
                lineHeight: 24,
              }}
            >
              Nii hakati sellist liisuheitmise viisi nimetama tsaariajal: vene
              müntidel oli ühel pool kotkas („kull“) ja teisel pool kiri ehk
              mündi nominaalväärtus. Avasta vanu Tallinnaga seotud münte ja
              ennusta, kumb mündi külg seekord peale jääb.
            </Text>
          </View>

          {/* 4. leht */}
          <View
            style={{
              width,
              flex: 1,
              justifyContent: "flex-start",
              alignItems: "flex-start",
              paddingHorizontal: width*0.10,
              paddingTop: verticalPadding * 9,
            }}
          >
            <Text
              style={{
                fontSize: 25,
                color: "#a5cfccff",
                fontWeight: "bold",
                textAlign: "left",
                paddingBottom: 8,
                marginBottom: 24,
              }}
            >
              Avers, revers ja serv
            </Text>
            <Text
              style={{
                fontSize: 18,
                color: "#fff",
                textAlign: "left",
                lineHeight: 24,
                marginBottom: 30,
              }}
            >
              Mündi esikülg on avers – seal on tavaliselt valitseja portree ja
              sageli nimiväärtus. Tagakülg on revers – seal leidub vapp,
              sümbolid või dekoratiivne kujundus. Servale lisati sooned või tekst,
              et vältida mündi võltsimist.
            </Text>
            {/* Oranž nupp */}
            <TouchableOpacity
            onPress={handleExplore}
              style={{
                backgroundColor: "#B4CECC",
                paddingVertical: 12,
                paddingHorizontal: 40,
                borderRadius: 25,
                marginBottom: -15,
                
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#22223b",
                  textAlign: "left",
                }}
              >
                Mine avastama
              </Text>
            </TouchableOpacity>
            
          </View>
        </ScrollView>

        {/* Poolring all */}
        <LinearGradient
          colors={["#000000ff", "#262729ff"]}
          start={[0, 0]}
          end={[1, 1]}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: width,
            height: height * 0.08,
            borderTopLeftRadius: width / 2,
            borderTopRightRadius: width / 2,
          }}
        />

        {/* Pagination Dots */}
        <View
          style={{
            position: "absolute",
            bottom: height * 0.03,
            width: "100%",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {[0, 1, 2, 3].map((idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => goToPage(idx)}
              style={{
                width: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: idx === activeIndex ? "#96c9c4ff" : "#d1eeecff",
                margin: 7,
                borderWidth: idx === activeIndex ? 2 : 0,
                borderColor: "#B4CECC",
              }}
            />
          ))}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
