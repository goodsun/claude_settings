#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  CallToolResult,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// ホットペッパーグルメAPI エンドポイント（HTTPSで通信）
const HOTPEPPER_API_BASE = "https://webservice.recruit.co.jp/hotpepper";

// APIキーは環境変数から取得
const API_KEY = process.env.HOTPEPPER_API_KEY;

// ジャンルコードの定義
const GENRE_CODES: Record<string, string> = {
  G001: "居酒屋",
  G002: "ダイニングバー・バル",
  G003: "創作料理",
  G004: "和食",
  G005: "洋食",
  G006: "イタリアン・フレンチ",
  G007: "中華",
  G008: "焼肉・ホルモン",
  G009: "韓国料理",
  G010: "各国料理",
  G011: "カラオケ・パーティ",
  G012: "バー・カクテル",
  G013: "ラーメン",
  G014: "お好み焼き・もんじゃ",
  G015: "カフェ・スイーツ",
  G016: "その他グルメ",
  G017: "その他",
};

// 予算コードの定義
const BUDGET_CODES: Record<string, string> = {
  B009: "～500円",
  B010: "501～1000円",
  B011: "1001～1500円",
  B001: "1501～2000円",
  B002: "2001～3000円",
  B003: "3001～4000円",
  B008: "4001～5000円",
  B004: "5001～7000円",
  B005: "7001～10000円",
  B006: "10001～15000円",
  B012: "15001～20000円",
  B013: "20001～30000円",
  B014: "30001円～",
};

// 検索範囲の定義
const RANGE_OPTIONS: Record<number, string> = {
  1: "300m",
  2: "500m",
  3: "1000m（デフォルト）",
  4: "2000m",
  5: "3000m",
};

// スコアリング設定（マジックナンバーの定数化）
const SCORING_CONFIG = {
  CAPACITY: {
    BASE: 20,           // 収容可能な場合のベーススコア
    RATIO_DOUBLE: 10,   // 席数が2倍以上
    RATIO_1_5: 7,       // 席数が1.5倍以上
    RATIO_1_2: 5,       // 席数が1.2倍以上
  },
  FEATURES: {
    FREE_DRINK: 15,     // 飲み放題
    PRIVATE_ROOM: 12,   // 個室
    FREE_FOOD: 8,       // 食べ放題
    MIDNIGHT: 5,        // 深夜営業
    CARD: 3,            // カード利用可
    WIFI: 2,            // Wi-Fi
    LUNCH: 1,           // ランチ
  },
} as const;

// 入力値の制約
const INPUT_CONSTRAINTS = {
  COUNT: { MIN: 1, MAX: 100, DEFAULT: 10 },
  LAT: { MIN: -90, MAX: 90 },
  LNG: { MIN: -180, MAX: 180 },
  RANGE: { MIN: 1, MAX: 5, DEFAULT: 3 },
} as const;

// 店舗情報の型定義
interface Shop {
  name: string;
  address: string;
  access: string;
  genre: { name: string };
  budget?: { name?: string; average?: string };
  open?: string;
  catch?: string;
  private_room?: string;
  wifi?: string;
  free_drink?: string;
  free_food?: string;
  lunch?: string;
  midnight?: string;
  parking?: string;
  card?: string;
  capacity?: number;
  urls: { pc: string };
  photo?: { pc?: { l?: string } };
}

// スコア付き店舗の型
interface ScoredShop extends Shop {
  score: number;
}

// API レスポンスの型定義
interface HotPepperApiResponse {
  results: {
    shop?: Shop[];
    genre?: Array<{ code: string; name: string }>;
    budget?: Array<{ code: string; name: string }>;
    large_area?: Array<{ code: string; name: string }>;
    special?: Array<{ code: string; name: string }>;
    results_available?: number;
  };
}

// ツール実行結果の型（SDKの型を使用）
type ToolResult = CallToolResult;

// 入力値バリデーション関数
function validateCount(value: unknown): number {
  const count = typeof value === "number" ? value : INPUT_CONSTRAINTS.COUNT.DEFAULT;
  if (count < INPUT_CONSTRAINTS.COUNT.MIN || count > INPUT_CONSTRAINTS.COUNT.MAX) {
    throw new Error(`countは${INPUT_CONSTRAINTS.COUNT.MIN}〜${INPUT_CONSTRAINTS.COUNT.MAX}の範囲で指定してください`);
  }
  return count;
}

function validateLatitude(value: unknown): number | undefined {
  if (value === undefined || value === null) return undefined;
  const lat = Number(value);
  if (isNaN(lat) || lat < INPUT_CONSTRAINTS.LAT.MIN || lat > INPUT_CONSTRAINTS.LAT.MAX) {
    throw new Error(`緯度は${INPUT_CONSTRAINTS.LAT.MIN}〜${INPUT_CONSTRAINTS.LAT.MAX}の範囲で指定してください`);
  }
  return lat;
}

function validateLongitude(value: unknown): number | undefined {
  if (value === undefined || value === null) return undefined;
  const lng = Number(value);
  if (isNaN(lng) || lng < INPUT_CONSTRAINTS.LNG.MIN || lng > INPUT_CONSTRAINTS.LNG.MAX) {
    throw new Error(`経度は${INPUT_CONSTRAINTS.LNG.MIN}〜${INPUT_CONSTRAINTS.LNG.MAX}の範囲で指定してください`);
  }
  return lng;
}

function validateRange(value: unknown): number | undefined {
  if (value === undefined || value === null) return undefined;
  const range = Number(value);
  if (isNaN(range) || range < INPUT_CONSTRAINTS.RANGE.MIN || range > INPUT_CONSTRAINTS.RANGE.MAX) {
    throw new Error(`rangeは${INPUT_CONSTRAINTS.RANGE.MIN}〜${INPUT_CONSTRAINTS.RANGE.MAX}の範囲で指定してください`);
  }
  return range;
}

// APIリクエスト関数
async function fetchAPI(
  endpoint: string,
  params: Record<string, string | number | undefined>
): Promise<HotPepperApiResponse> {
  if (!API_KEY) {
    throw new Error(
      "HOTPEPPER_API_KEY環境変数が設定されていません。リクルートWEBサービスでAPIキーを取得してください。"
    );
  }

  const url = new URL(`${HOTPEPPER_API_BASE}/${endpoint}/`);
  url.searchParams.set("key", API_KEY);
  url.searchParams.set("format", "json");

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

// 店舗の優先度スコアを計算する関数
function calculateShopScore(shop: Shop, partyCapacity?: number): number {
  let score = 0;
  const { CAPACITY, FEATURES } = SCORING_CONFIG;

  // 席数が指定人数以上なら高スコア
  if (partyCapacity && shop.capacity) {
    if (shop.capacity >= partyCapacity) {
      score += CAPACITY.BASE;
      // 席数に余裕があるほど高評価
      const ratio = shop.capacity / partyCapacity;
      if (ratio >= 2) score += CAPACITY.RATIO_DOUBLE;
      else if (ratio >= 1.5) score += CAPACITY.RATIO_1_5;
      else if (ratio >= 1.2) score += CAPACITY.RATIO_1_2;
    }
  }

  // 設備・サービスによるスコア加算
  if (shop.free_drink === "あり") score += FEATURES.FREE_DRINK;
  if (shop.private_room === "あり") score += FEATURES.PRIVATE_ROOM;
  if (shop.free_food === "あり") score += FEATURES.FREE_FOOD;
  if (shop.midnight === "営業している") score += FEATURES.MIDNIGHT;
  if (shop.card === "利用可") score += FEATURES.CARD;
  if (shop.wifi === "あり") score += FEATURES.WIFI;
  if (shop.lunch === "あり") score += FEATURES.LUNCH;

  return score;
}

// 店舗の特徴リストを取得
function getShopFeatures(shop: Shop): string[] {
  const features: string[] = [];
  if (shop.private_room === "あり") features.push("個室あり");
  if (shop.wifi === "あり") features.push("Wi-Fiあり");
  if (shop.free_drink === "あり") features.push("飲み放題あり");
  if (shop.free_food === "あり") features.push("食べ放題あり");
  if (shop.lunch === "あり") features.push("ランチあり");
  if (shop.midnight === "営業している") features.push("23時以降営業");
  if (shop.parking === "あり") features.push("駐車場あり");
  if (shop.card === "利用可") features.push("カード可");
  return features;
}

// 店舗情報をフォーマットする関数
function formatShop(shop: ScoredShop, rank?: number): string {
  const lines: string[] = [];

  // ランキング表示
  lines.push(rank !== undefined ? `## ${rank}. ${shop.name}` : `## ${shop.name}`);
  lines.push("");
  lines.push(`**ジャンル**: ${shop.genre.name}`);
  lines.push(`**住所**: ${shop.address}`);
  lines.push(`**アクセス**: ${shop.access}`);

  if (shop.budget?.name) {
    const average = shop.budget.average ? ` (平均: ${shop.budget.average})` : "";
    lines.push(`**予算**: ${shop.budget.name}${average}`);
  }

  if (shop.open) lines.push(`**営業時間**: ${shop.open}`);
  if (shop.catch) lines.push(`**キャッチ**: ${shop.catch}`);

  const features = getShopFeatures(shop);
  if (features.length > 0) {
    lines.push(`**特徴**: ${features.join(", ")}`);
  }

  if (shop.capacity) lines.push(`**席数**: ${shop.capacity}席`);
  lines.push(`**URL**: ${shop.urls.pc}`);
  if (shop.photo?.pc?.l) lines.push(`**写真**: ${shop.photo.pc.l}`);

  return lines.join("\n");
}

// 店舗リストをスコアリングしてフォーマット
function processAndFormatShops(
  shops: Shop[],
  requestedCount: number,
  partyCapacity?: number,
  title: string = "おすすめ店舗"
): string {
  const scoredShops: ScoredShop[] = shops.map((shop) => ({
    ...shop,
    score: calculateShopScore(shop, partyCapacity),
  }));

  scoredShops.sort((a, b) => b.score - a.score);
  const topShops = scoredShops.slice(0, requestedCount);

  const lines: string[] = [
    `# ${title} TOP${topShops.length}`,
    "",
    `**${shops.length}件中、おすすめ順に${topShops.length}件を表示**`,
    "",
  ];

  if (partyCapacity) {
    lines.push("※ 席数・飲み放題・個室などの条件を考慮して優先順位付けしています");
    lines.push("");
  }

  lines.push("---");
  lines.push("");
  lines.push(topShops.map((shop, index) => formatShop(shop, index + 1)).join("\n\n---\n\n"));

  return lines.join("\n");
}

// マスターデータ取得の共通関数
interface MasterDataConfig {
  endpoint: string;
  dataKey: "genre" | "budget" | "large_area" | "special";
  title: string;
  description: string;
  codeHeader: string;
  nameHeader: string;
}

async function fetchMasterData(config: MasterDataConfig): Promise<ToolResult> {
  const data = await fetchAPI(`${config.endpoint}/v1`, {});
  const items = data.results[config.dataKey] || [];

  const lines: string[] = [
    `# ${config.title}`,
    "",
    config.description,
    "",
    `| ${config.codeHeader} | ${config.nameHeader} |`,
    `|--------|----------|`,
    ...items.map((item: { code: string; name: string }) => `| ${item.code} | ${item.name} |`),
  ];

  return { content: [{ type: "text", text: lines.join("\n") }] };
}

// エラーメッセージのサニタイズ（内部情報を隠す）
function sanitizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // APIキー関連のエラーはそのまま表示
    if (error.message.includes("HOTPEPPER_API_KEY")) {
      return error.message;
    }
    // バリデーションエラーはそのまま表示
    if (error.message.includes("〜") || error.message.includes("範囲")) {
      return error.message;
    }
    // その他のエラーは一般的なメッセージに変換
    return "リクエストの処理中にエラーが発生しました。しばらく経ってから再度お試しください。";
  }
  return "予期しないエラーが発生しました。";
}

// ツール定義
const tools = [
  {
    name: "search_restaurants",
    description:
      "ホットペッパーグルメAPIを使って飲食店を検索します。キーワード、位置情報、ジャンル、予算などで絞り込みが可能です。",
    inputSchema: {
      type: "object" as const,
      properties: {
        keyword: {
          type: "string",
          description: "検索キーワード（店名、住所、駅名など）",
        },
        lat: {
          type: "number",
          description: "検索中心の緯度（位置情報検索時に使用）",
        },
        lng: {
          type: "number",
          description: "検索中心の経度（位置情報検索時に使用）",
        },
        range: {
          type: "number",
          description:
            "検索範囲: 1=300m, 2=500m, 3=1000m(デフォルト), 4=2000m, 5=3000m",
          enum: [1, 2, 3, 4, 5],
        },
        genre: {
          type: "string",
          description: `ジャンルコード: ${Object.entries(GENRE_CODES)
            .map(([code, name]) => `${code}(${name})`)
            .join(", ")}`,
        },
        budget: {
          type: "string",
          description: `予算コード: ${Object.entries(BUDGET_CODES)
            .map(([code, name]) => `${code}(${name})`)
            .join(", ")}`,
        },
        party_capacity: {
          type: "number",
          description: "宴会収容人数（指定人数以上収容可能な店舗を検索）",
        },
        special: {
          type: "string",
          description:
            "特集コード（用途・シーン検索。例: 忘年会、新年会、歓送迎会など。get_specialsで一覧取得可能）",
        },
        private_room: {
          type: "boolean",
          description: "個室ありの店舗のみ検索",
        },
        wifi: {
          type: "boolean",
          description: "Wi-Fiありの店舗のみ検索",
        },
        free_drink: {
          type: "boolean",
          description: "飲み放題ありの店舗のみ検索",
        },
        free_food: {
          type: "boolean",
          description: "食べ放題ありの店舗のみ検索",
        },
        lunch: {
          type: "boolean",
          description: "ランチありの店舗のみ検索",
        },
        midnight: {
          type: "boolean",
          description: "23時以降も営業している店舗のみ検索",
        },
        parking: {
          type: "boolean",
          description: "駐車場ありの店舗のみ検索",
        },
        card: {
          type: "boolean",
          description: "カード利用可の店舗のみ検索",
        },
        pet: {
          type: "boolean",
          description: "ペット可の店舗のみ検索",
        },
        child: {
          type: "boolean",
          description: "お子様連れOKの店舗のみ検索",
        },
        count: {
          type: "number",
          description: "取得件数（1-100、デフォルト10）",
          default: 10,
        },
        start: {
          type: "number",
          description: "検索結果の開始位置（ページング用）",
          default: 1,
        },
      },
    },
  },
  {
    name: "get_genres",
    description:
      "ホットペッパーグルメで使用できるジャンル（料理カテゴリ）の一覧を取得します。検索時のgenreパラメータに使用できます。",
    inputSchema: {
      type: "object" as const,
      properties: {},
    },
  },
  {
    name: "get_budgets",
    description:
      "ホットペッパーグルメで使用できる予算コードの一覧を取得します。検索時のbudgetパラメータに使用できます。",
    inputSchema: {
      type: "object" as const,
      properties: {},
    },
  },
  {
    name: "get_large_areas",
    description:
      "大エリア（都道府県レベル）の一覧を取得します。地域を絞った検索に使用できます。",
    inputSchema: {
      type: "object" as const,
      properties: {},
    },
  },
  {
    name: "get_specials",
    description:
      "特集（用途・シーン）の一覧を取得します。忘年会、新年会、歓送迎会、女子会、デートなど様々なシーンで検索できます。検索時のspecialパラメータに使用できます。",
    inputSchema: {
      type: "object" as const,
      properties: {},
    },
  },
  {
    name: "search_by_area",
    description:
      "エリアコードを使って特定地域の飲食店を検索します。大エリア、中エリア、小エリアで絞り込みが可能です。",
    inputSchema: {
      type: "object" as const,
      properties: {
        large_area: {
          type: "string",
          description: "大エリアコード（例: Z011=東京）",
        },
        middle_area: {
          type: "string",
          description: "中エリアコード（例: Y005=新宿）",
        },
        small_area: {
          type: "string",
          description: "小エリアコード",
        },
        keyword: {
          type: "string",
          description: "追加の検索キーワード",
        },
        genre: {
          type: "string",
          description: "ジャンルコード",
        },
        budget: {
          type: "string",
          description: "予算コード",
        },
        count: {
          type: "number",
          description: "取得件数（1-100、デフォルト10）",
          default: 10,
        },
      },
    },
  },
];

// MCPサーバーの作成
const server = new Server(
  {
    name: "hotpepper-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ツール一覧のハンドラー
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// 各ツールハンドラの実装

// 店舗検索の共通処理
async function searchShops(
  args: Record<string, unknown> | undefined,
  options: {
    useLocationParams?: boolean;
    useAreaParams?: boolean;
    title?: string;
  } = {}
): Promise<ToolResult> {
  const requestedCount = validateCount(args?.count);
  const partyCapacity = args?.party_capacity as number | undefined;

  // 優先順位付けのために多めに取得（最大100件）
  const fetchCount = Math.min(requestedCount * 3, INPUT_CONSTRAINTS.COUNT.MAX);

  const params: Record<string, string | number | undefined> = {
    keyword: args?.keyword as string,
    genre: args?.genre as string,
    budget: args?.budget as string,
    count: fetchCount,
  };

  // 位置情報検索パラメータ
  if (options.useLocationParams) {
    params.lat = validateLatitude(args?.lat);
    params.lng = validateLongitude(args?.lng);
    params.range = validateRange(args?.range);
    params.party_capacity = partyCapacity;
    params.special = args?.special as string;
    params.start = (args?.start as number) || 1;

    // ブール値のフィルター
    const booleanFilters = [
      "private_room", "wifi", "free_drink", "free_food",
      "lunch", "midnight", "parking", "card", "pet", "child"
    ];
    for (const filter of booleanFilters) {
      if (args?.[filter]) params[filter] = 1;
    }
  }

  // エリア検索パラメータ
  if (options.useAreaParams) {
    params.large_area = args?.large_area as string;
    params.middle_area = args?.middle_area as string;
    params.small_area = args?.small_area as string;
  }

  const data = await fetchAPI("gourmet/v1", params);

  if (!data.results.shop || data.results.shop.length === 0) {
    return {
      content: [{
        type: "text",
        text: "検索条件に一致する店舗が見つかりませんでした。検索条件を変更してお試しください。",
      }],
    };
  }

  const result = processAndFormatShops(
    data.results.shop,
    requestedCount,
    partyCapacity,
    options.title || "おすすめ店舗"
  );

  return { content: [{ type: "text", text: result }] };
}

// マスターデータ設定
const MASTER_DATA_CONFIGS: Record<string, MasterDataConfig> = {
  get_genres: {
    endpoint: "genre",
    dataKey: "genre",
    title: "ジャンル一覧",
    description: "検索時に `genre` パラメータで使用できるコードです。",
    codeHeader: "コード",
    nameHeader: "ジャンル名",
  },
  get_budgets: {
    endpoint: "budget",
    dataKey: "budget",
    title: "予算一覧",
    description: "検索時に `budget` パラメータで使用できるコードです。",
    codeHeader: "コード",
    nameHeader: "予算範囲",
  },
  get_large_areas: {
    endpoint: "large_area",
    dataKey: "large_area",
    title: "大エリア一覧",
    description: "検索時に `large_area` パラメータで使用できるコードです。",
    codeHeader: "コード",
    nameHeader: "エリア名",
  },
  get_specials: {
    endpoint: "special",
    dataKey: "special",
    title: "特集（用途・シーン）一覧",
    description: "検索時に `special` パラメータで使用できるコードです。\n忘年会、新年会、歓送迎会、女子会、デートなど様々なシーンで検索できます。",
    codeHeader: "コード",
    nameHeader: "特集名",
  },
};

// ツール実行のハンドラー
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // 店舗検索
    if (name === "search_restaurants") {
      return await searchShops(args, { useLocationParams: true, title: "おすすめ店舗" });
    }

    // エリア検索
    if (name === "search_by_area") {
      return await searchShops(args, { useAreaParams: true, title: "エリア検索 おすすめ店舗" });
    }

    // マスターデータ取得
    const masterConfig = MASTER_DATA_CONFIGS[name];
    if (masterConfig) {
      return await fetchMasterData(masterConfig);
    }

    // 未知のツール
    return {
      content: [{ type: "text", text: `Unknown tool: ${name}` }],
      isError: true,
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `エラーが発生しました: ${sanitizeErrorMessage(error)}` }],
      isError: true,
    };
  }
});

// サーバー起動
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("HotPepper MCP Server started");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
