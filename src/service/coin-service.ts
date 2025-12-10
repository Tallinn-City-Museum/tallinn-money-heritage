import { getDataConnect } from "firebase/data-connect"
import { Coin } from "../data/entity/coin"
import {
    connectorConfig,
    coinMeta2count,
    coinMeta2byId,
    materialStats,
    regionStats,
    nominalStats,
    nameStats,
    coinFilterData
} from '@dataconnect/generated'
import { app  } from "../config"
import { getStorage, ref, getDownloadURL } from "firebase/storage"
import { Image } from "react-native"
import { CoinFilterRow, CountryStat, MaterialStat, NameStat, NominalStat } from "../data/entity/aggregated-meta"

const dataConnect = getDataConnect(app, connectorConfig)
const storage = getStorage(app)

/**
 * Coin service provides coin-related operations
 */
export class CoinService {
    coinCount?: number

    /**
     * Generates new coin for the coin flipper game
     * and returns its value
     */
    public async generateNewCoin(): Promise<Coin> {
        if (this.coinCount === undefined) {
            this.coinCount = (await coinMeta2count()).data.coinMetas2?.id_count
        }

        const idx = Math.floor(Math.random() * (this.coinCount === undefined ? 1 : this.coinCount) + 1)

        const coin = (await coinMeta2byId({id: `${idx}`})).data.coinMetas2s[0]

        const headsURL = await getDownloadURL(ref(storage, `images/museaal-${coin.muisId}-head.webp`))
        const tailsURL = await getDownloadURL(ref(storage, `images/museaal-${coin.muisId}-tails.webp`))

        // Pre-fetch images so the UI can show them instantly
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
        if (!material) {
            return randomCoin
        }

        return {
            ...randomCoin,
            material,
        }
    }
}

/**
 * This service provides access for aggregated metadata
 * i.e. how many coins with certain attributes are available
 */
export class CoinStatsService {
    materials?: MaterialStat[];
    countries?: CountryStat[];
    nominals?: NominalStat[];
    names?: NominalStat[];
    filterRows?: CoinFilterRow[]

    public async getCoinFilterData(): Promise<CoinFilterRow[]> {
        if (this.filterRows !== undefined)
            return this.filterRows;

        this.filterRows = (await coinFilterData()).data.coinMetas2s.map((v) => {
            return {
                country: v.region,
                material: v.material ? v.material.charAt(0).toUpperCase() + v.material.substring(1) : undefined,
                nominal: v.nomValue,
                name: v.lemmaName ? v.lemmaName.charAt(0).toUpperCase() + v.lemmaName.substring(1) : undefined
            } as CoinFilterRow
        });

        return this.filterRows;
    }

    public async getMaterialStats(): Promise<MaterialStat[]> {
        if (this.materials !== undefined) {
            return this.materials;
        }

        this.materials = [];
        const res = (await materialStats()).data.coinMetas2s;

        for (let i = 0; i < res.length; i++) {
            if (res[i].material != undefined) {
                this.materials.push({ key: res[i].material ?? "", label: res[i].material ?? "", count: res[i]._count });
            }
        }

        this.materials.push({key: "Kõik", label: "Kõik", count: this.materials.reduce((a, b) => a + b.count, 0)})

        return this.materials;
    }

    public async getCountryStats(): Promise<CountryStat[]> {
        if (this.countries !== undefined) {
            return this.countries;
        }

        this.countries = [];
        const res = (await regionStats()).data.coinMetas2s;

        for (let i = 0; i < res.length; i++) {
            if (res[i].region != undefined) {
                this.countries.push({ key: res[i].region ?? "", label: res[i].region ?? "", count: res[i]._count });
            }
        }

        this.countries.push({key: "Kõik", label: "Kõik", count: this.countries.reduce((a, b) => a + b.count, 0)})

        return this.countries;
    }

    public async getNominalStats(): Promise<NominalStat[]> {
        if (this.nominals !== undefined) {
            return this.nominals;
        }

        this.nominals = [];
        const res = (await nominalStats()).data.coinMetas2s;

        for (let i = 0; i < res.length; i++) {
            if (res[i].nomValue != undefined) {
                this.nominals.push({ key: res[i].nomValue ?? "", label: res[i].nomValue ?? "", count: res[i]._count });
            }
        }

        this.nominals.push({key: "Kõik", label: "Kõik", count: this.nominals.reduce((a, b) => a + b.count, 0)})

        return this.nominals;
    }

    public async getNameStats(): Promise<NameStat[]> {
        if (this.names !== undefined) {
            return this.names;
        }

        this.names = [];
        const res = (await nameStats()).data.coinMetas2s;

        for (let i = 0; i < res.length; i++) {
            if (res[i].lemmaName != undefined) {
                this.names.push({
                    key: res[i].lemmaName ?? "",
                    label: res[i].lemmaName ?? "",
                    count: res[i]._count,
                });
            }
        }

        this.names.push({key: "Kõik", label: "Kõik", count: this.names.reduce((a, b) => a + b.count, 0)})

        return this.names;
    }
}

export const coinService = new CoinService()
export const coinStatsService = new CoinStatsService()
