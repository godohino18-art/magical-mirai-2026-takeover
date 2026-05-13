# PRISM RESONANCE

**マジカルミライ 2026 プログラミング・コンテスト 応募作品**

課題曲『こたえて』の壮大なサウンドに同期し、ブラウザ上に「ガラスの屈折と光の共鳴」を生み出す3Dリリック・ビジュアライザー。

---

## 概要

| 項目 | 内容 |
|------|------|
| 楽曲 | こたえて（imie feat. 初音ミク） |
| テーマ | Prism Resonance — ガラスと光の共鳴 |
| 技術 | Next.js + React Three Fiber + TextAlive App API |

楽曲と同期した演出：

- **ビート** — ガラス構造体のスケール脈動・パーティクルの拡散
- **ボーカル振幅** — Bloom強度・ライト輝度がリアルタイム変化
- **サビ検出** — 照明がクールブルーから暖かいアンバー・ゴールドへ遷移、ガラスの回転が加速して光を空間全体に散乱
- **歌詞フレーズ** — 3D空間に下からフロートアップしながらフェードイン表示

---

## 技術スタック

- **Next.js 16** (App Router, Turbopack)
- **React Three Fiber 9 / Drei 10** — 3D シーン管理
- **postprocessing 6 / @react-three/postprocessing 3** — Bloom・ChromaticAberration・Vignette
- **TextAlive App API 0.4** — 楽曲・ビート・歌詞・サビ同期
- **Framer Motion 12** — ローディング/スタート UI トランジション
- **MeshPhysicalMaterial** — transmission/IOR によるガラス屈折表現
- **Drei Environment** — HDR 環境マップによるリアルな反射

---

## 見どころ（アピールポイント）

### 1. フィジカルなガラス表現（MeshPhysicalMaterial）
全ての浮遊オブジェクトに `transmission: 1.0` / `ior: 1.5` / `thickness: 2.0` を設定したリアルな屈折ガラスを採用。Drei の `<Environment preset="city">` による HDR 環境マップが、ガラス越しに反射・散乱する光の複雑さを生み出す。

### 2. サビ演出の多層化（ブルー→アンバー照明遷移）
サビ突入時に3系統のライト（上部・下部・環境光）がすべて `1 - exp(-speed × delta)` でフレームレート非依存にスムーズ遷移。クールなブルーから暖かいゴールド・アンバーへの変化が、ガラスオブジェクトの回転加速と連動して光の散乱を劇的に増幅。

### 3. Kinetic Typography（Y軸フロートアップ + フェードイン）
歌詞フレーズが下方から浮かび上がりながら透明度0→1でフェードイン。スケール・位置・透明度の3軸アニメーションを全て `useFrame` 内で直接マテリアル操作し、React の再レンダリングゼロで実現。

### 4. GPU 粒子システム（4000パーティクル）
BufferGeometry で 4000 粒子を管理し、頂点シェーダーでビート・振幅・時間に応じた動きを計算。CPU→GPU は uniform 値のみ毎フレーム転送。

### 5. EffectComposer の直接制御
モジュールスコープのエフェクトインスタンスを `<primitive object={...}>` で渡し、`useFrame` から直接 `.intensity` / `.offset` を更新。React の re-render なしに毎フレーム可変エフェクトを実現。

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
2. ローディング完了後、`[ TOUCH TO ANSWER ]` ボタンをクリック
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
│   │   ├── FloatingStructures.tsx  # 浮遊ガラス構造体
│   │   ├── ParticleField.tsx   # GPU パーティクルシステム
│   │   ├── LyricVisualizer.tsx # 3D 歌詞表示
│   │   └── CameraRig.tsx       # シネマティックカメラ制御
│   └── effects/
│       └── ElectronicMaterial.tsx  # GLSL シェーダーマテリアル（予備）
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
