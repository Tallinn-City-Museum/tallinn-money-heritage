import { getDataConnect } from "firebase/data-connect"
import { Coin } from "../data/entity/coin"
import { connectorConfig, coinCount, coinById, coinMeta2count, coinMeta2byId } from '@dataconnect/generated'
import { app  } from "../config"
import { getStorage, ref, getDownloadURL } from "firebase/storage"
import { Image } from "react-native"
import { CountryStat, MaterialStat, NameStat, NominalStat } from "../data/entity/aggregated-meta"

const dataConnect = getDataConnect(app, connectorConfig)
const storage = getStorage(app)

/**
 * Coin service provides
 */
export class CoinService {
    coinCount?: number

    /**
     * Generates new coin for the coin flipper game
     * and returns its value
     */
    public async generateNewCoin() : Promise<Coin> {
        if (this.coinCount === undefined)
            this.coinCount = (await coinMeta2count()).data.coinMetas2?.id_count

        const idx = Math.floor(Math.random() * (this.coinCount === undefined ? 1 : this.coinCount) + 1)

        const coin = (await coinMeta2byId({id: `${idx}`})).data.coinMetas2s[0]

        const headsURL = await getDownloadURL(ref(storage, `images/museaal-${coin.muisId}-head.webp`))
        const tailsURL = await getDownloadURL(ref(storage, `images/museaal-${coin.muisId}-tails.webp`))

        // Pre-fetch images
        await Image.prefetch(headsURL)
        await Image.prefetch(tailsURL)

        return {
            id: +coin.id,
            muisId: +coin.muisId,
            ref: coin.ref,
            name: coin.name,
            date: coin.date,
            material: coin.material,
            diameter: coin.diameter,
            region: coin.region,
            nomValue: coin.nomValue,
            lemmaName: coin.lemmaName,
            headImageResource: headsURL,
            tailsImageResource: tailsURL,
        }
    }

    /**
     * Generate a coin by material. Backend does not yet expose material-based queries,
     * so we fall back to a random coin while tagging it with the selected material.
     */
    public async generateCoinByMaterial(material: string): Promise<Coin> {
        const randomCoin = await this.generateNewCoin()
        if (!material || material.toLowerCase() === "kõik") {
            return randomCoin
        }

        return {
            ...randomCoin,
            material,
        }
    }

};

/**
 * This service provides access for aggregated metadata
 * i.e. how many coins with certain attributes are available
 */
export class CoinStatsService {
    materials?: MaterialStat[];
    countries?: CountryStat[];
    nominals?: NominalStat[];
    names?: NominalStat[];

    public async getMaterialStats() : Promise<MaterialStat[]> {
        if (this.materials !== undefined)
            return this.materials;

        // TODO: Perform an actual dataconnect query
        return [
            { key: "Kõik", label: "Kõik", count: 24 },
            { key: "Hõbe", label: "Hõbe", count: 12 },
            { key: "Kuld", label: "Kuld", count: 8 },
            { key: "Vask", label: "Vask", count: 10 },
            { key: "Pronks", label: "Pronks", count: 7 },
            { key: "Nikkel", label: "Nikkel", count: 6 },
            { key: "Messing", label: "Messing", count: 5 },
            { key: "Tina", label: "Tina", count: 4 },
            { key: "Raud", label: "Raud", count: 4 },
            { key: "Alumiinium", label: "Alumiinium", count: 3 },
            { key: "Plii", label: "Plii", count: 3 },
            { key: "Tsingi sulam", label: "Tsingi sulam", count: 2 },
            { key: "Terassulam", label: "Terassulam", count: 2 },
        ];
    }

    public async getCountryStats() : Promise<CountryStat[]> {
        if (this.countries !== undefined)
            return this.countries;

        // TODO: Perform an actual dataconnect query
        return [
            { key: "Eesti", label: "Eesti", count: 6 },
            { key: "Venemaa", label: "Venemaa", count: 8 },
            { key: "Saksamaa", label: "Saksamaa", count: 4 },
            { key: "Rootsi", label: "Rootsi", count: 5 },
            { key: "Soome", label: "Soome", count: 4 },
            { key: "Läti", label: "Läti", count: 3 },
            { key: "Leedu", label: "Leedu", count: 3 },
            { key: "Poola", label: "Poola", count: 4 },
            { key: "Ukraina", label: "Ukraina", count: 3 },
            { key: "Taani", label: "Taani", count: 2 },
            { key: "Norra", label: "Norra", count: 2 },
            { key: "Hispaania", label: "Hispaania", count: 2 },
            { key: "Itaalia", label: "Itaalia", count: 2 },
        ];
    }

    public async getNominalStats() : Promise<NominalStat[]> {
        if (this.nominals !== undefined)
            return this.nominals;

        // TODO: Perform an actual dataconnect query
        return [
            { key: "Kõik", label: "Kõik", count: 20 },
            { key: "1", label: "1", count: 8 },
            { key: "1/2", label: "1/2", count: 5 },
            { key: "2", label: "2", count: 3 },
            { key: "5", label: "5", count: 1 },
        ];
    }

    public async getNameStats() : Promise<NameStat[]> {
        if (this.names !== undefined)
            return this.names;

        // TODO: Perform an actual dataconnect query
        return [
            { key: "Kõik", label: "Kõik", count: 24 },
            { key: "Kopikat", label: "Kopikat", count: 9 },
            { key: "Kroon", label: "Kroon", count: 6 },
            { key: "Rubla", label: "Rubla", count: 5 },
            { key: "Penn", label: "Penn", count: 4 },
            { key: "Denaar", label: "Denaar", count: 3 },
            { key: "Fennig", label: "Fennig", count: 2 },
        ];
    }
}

export const coinService = new CoinService()
export const coinStatsService = new CoinStatsService()