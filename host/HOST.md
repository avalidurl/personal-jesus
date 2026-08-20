# THE HOST — pin, deploy, OpenSea 5%

333 unique VGA-16 looping GIFs. Collection **THE HOST** / `HOST`. Mint **0.0005 ETH**. Royalty **5%** (EIP-2981). Chain **Robinhood 4663**.

## 1. Generate media (already runnable)

```bash
cd host
node --test traits.test.mjs
node generate.mjs
```

Writes `out/host/gifs/001.gif`–`333.gif`, `out/host/meta/1.json`–`333.json`, `out/host/manifest.json`, `out/host/collection.json`.

Edit `collection.json` `fee_recipient` to your royalty address before pinning.

## 2. Pin to IPFS (you)

Pin the **`out/host`** directory so that:

- `meta/1.json` is reachable as `ipfs://<BASE>1.json` or pin `meta/` as base `ipfs://<CID>/`
- GIFs match the `image` field

Simplest layout after pin of `out/host/meta` + `out/host/gifs`:

Rewrite image URLs if needed. Default metadata uses `ipfs://REPLACE_GIF_DIR/001.gif`. After you have the GIF folder CID, run:

```bash
# example: replace the placeholder in every json
GIF=bafy...   # CID of the gifs folder
perl -pi -e "s#ipfs://REPLACE_GIF_DIR#ipfs://$GIF#g" ../out/host/meta/*.json ../out/host/collection.json
```

Then pin `out/host/meta` and set

```
HOST_BASE_URI=ipfs://<META_CID>/
```

(must include trailing slash; token 1 → `ipfs://<META_CID>/1.json`)

## 3. Deploy (you broadcast)

```bash
cd contracts
forge install foundry-rs/forge-std OpenZeppelin/openzeppelin-contracts --no-commit
forge test

export PRIVATE_KEY=0x...
export HOST_TREASURY=0x...          # mint ETH
export HOST_ROYALTY=0x...           # 5% receiver (can equal treasury)
export HOST_BASE_URI=ipfs://<META_CID>/

forge script script/Deploy.s.sol --rpc-url rh_testnet --broadcast
# then
forge script script/Deploy.s.sol --rpc-url rh_mainnet --broadcast
```

Verify on [Blockscout](https://robinhoodchain.blockscout.com).

## 4. OpenSea 5% (you)

1. OpenSea → import contract on **Robinhood Chain**.
2. Studio → **Creator Earnings** → **5%** → same `HOST_ROYALTY` address.
3. EIP-2981 already returns 500 bps onchain. OpenSea may still treat earnings as optional depending on collection policy — set the Studio field anyway.

Wallet-to-wallet transfers do not pay royalties. That is how ERC-721 works.

## 5. Freeze URI

After metadata is final:

```
cast send <HOST> "freezeURI()" --rpc-url rh_mainnet --private-key $PRIVATE_KEY
```

(from the treasury address)

## Choirs

| Choir | Count |
|---|---|
| Stars of heaven | 111 |
| Vessels | 89 |
| Living creatures | 67 |
| Thrones | 44 |
| Unutterable | 22 |
