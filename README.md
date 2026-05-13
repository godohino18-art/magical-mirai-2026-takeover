# TAKEOVER - CYBER VOID

**マジカルミライ 2026 プログラミング・コンテスト 応募作品**

3Dサイバー空間でボカロ楽曲のビート・歌詞・サビをリアルタイムに可視化するインタラクティブ体験。

---

## 概要

| 項目 | 内容 |
|------|------|
| 楽曲 | TAKEOVER（ピアプロ掲載楽曲） |
| テーマ | CYBER VOID — デジタル空間への侵略 |
| 技術 | Next.js + React Three Fiber + TextAlive App API |

楽曲と同期した演出：

- **ビート** — パーティクルの爆発・浮遊構造体のスケール脈動
- **ボーカル振幅** — Bloom強度・ライト輝度がリアルタイム変化
- **サビ検出** — カラースキームがシアン系→マゼンタ系に全体変換 + グリッチオーバーレイ
- **歌詞フレーズ** — 3D空間に fly-in アニメーションで表示

---

## 技術スタック

- **Next.js 16** (App Router, Turbopack)
- **React Three Fiber 9 / Drei 10** — 3D シーン管理
- **postprocessing 6 / @react-three/postprocessing 3** — Bloom・ChromaticAberration・Vignette
- **TextAlive App API 0.4** — 楽曲・ビート・歌詞・サビ同期
- **Framer Motion 12** — ローディング/スタート UI トランジション
- **Custom GLSL Shaders** — `uChorusFactor` uniform による色変換

---

## 見どころ（アピールポイント）

### 1. 全シェーダー統一の `uChorusFactor`
全ての GLSL シェーダー（InfiniteGrid・FloatingStructures・ParticleField）に `uChorusFactor` uniform（0.0→1.0）を実装。サビ検出と同時に `1 - exp(-speed × delta)` でフレームレート非依存のスムーズなカラートランジションを実現。

### 2. シネマティックイントロカメラ
ロード完了→スタートボタン押下で、半径22のオービット軌道から `[0, 2, 14]` 視点へ ease-out-cubic（2.8秒）で遷移。マウス追従のパララックスも重ね合わせ。

### 3. サビ演出の多層化
サビ突入時に Canvas 2D グリッチオーバーレイ・Bloom 3.5倍・ChromaticAberration 4倍・全シェーダーカラー変換が同時発動。各エフェクトが独立してスムーズ補間するため、タイミングのズレが視覚的豊かさを生む。

### 4. GPU 粒子システム（4000パーティクル）
BufferGeometry で 4000 粒子を管理し、頂点シェーダーでビート・振幅・時間に応じた動きを計算。CPU→GPU は uniform 値のみ毎フレーム転送。

### 5. EffectComposer の直接制御
`<Bloom>` コンポーネントではなく、モジュールスコープのエフェクトインスタンスを `<primitive object={...}>` で渡し、`useFrame` から直接 `.intensity` / `.offset` を更新。React の re-render なしに毎フレーム可変エフェクトを実現。

---

## セットアップ

### 必要環境
- Node.js 20+
- TextAlive App API トークン（[TextAlive Developer Portal](https://developer.textalive.jp/) で取得）

### インストール・起動

```bash
# 依存インストール
npm install

# 環境変数設定
echo "NEXT_PUBLIC_TEXTALIVE_TOKEN=your_token_here" > .env.local

# 開発サーバー
npm run dev
# → http://localhost:3000

# 本番ビルド
npm run build && npm start
```

### 操作方法
1. ブラウザで `http://localhost:3000` を開く
2. ローディング完了後、`[ INITIALIZE TAKEOVER ]` ボタンをクリック
3. AudioContext のアンロックと同時に楽曲再生開始・演出スタート
4. 画面下部 HUD で再生・一時停止・停止が可能

---

## ファイル構成

```
src/
├── app/                    # Next.js App Router
├── components/
│   ├── HomeClient.tsx      # メインオーケストレーター
│   ├── Scene3D.tsx         # R3F Canvas ラッパー
│   ├── PlayerUI.tsx        # ローディング/スタート/HUD UI
│   ├── scene/
│   │   ├── CyberVoid.tsx       # シーン全体 + ポストプロセッシング
│   │   ├── InfiniteGrid.tsx    # 収束グリッド床
│   │   ├── FloatingStructures.tsx  # 浮遊幾何学構造体
│   │   ├── ParticleField.tsx   # GPU パーティクルシステム
│   │   ├── LyricVisualizer.tsx # 3D 歌詞表示
│   │   └── CameraRig.tsx       # シネマティックカメラ制御
│   └── effects/
│       ├── ElectronicMaterial.tsx  # GLSL シェーダーマテリアル
│       └── GlitchOverlay.tsx       # Canvas 2D グリッチ
├── hooks/
│   └── useTextAlive.ts     # TextAlive Player ライフサイクル
└── lib/
    └── constants.ts        # マジックナンバー一元管理
```

---

## ライセンス

本作品は TextAlive App API を使用しています。  
TextAlive: https://textalive.jp/  
TextAlive Developer: https://developer.textalive.jp/

使用楽曲の著作権は各権利者に帰属します。
