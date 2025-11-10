// app/api/start/route.js
import { NextResponse } from "next/server";
import { ethers } from "ethers";
import crypto from "node:crypto";
import contracts from "@/app/lib/hashdle-contracts.json";

export const runtime = "nodejs";

/** ---- ENV / CHAIN SELECTION ---- */
function getChainConfig(chain) {
  const rpcByChain = {
    mainnet:
      process.env.NEXT_PUBLIC_VITRUVEO_RPC_URL,
    bsc:
      process.env.NEXT_PUBLIC_BSC_RPC_URL,
    base:
      process.env.NEXT_PUBLIC_BASE_RPC_URL,
  };
  const rpcUrl = rpcByChain[chain];
  if (!rpcUrl) throw new Error(`Missing RPC for chain "${chain}"`);

  const addresses = contracts?.[chain];
  if (!addresses?.Hashdle)
    throw new Error(`Missing Hashdle address in contracts for "${chain}"`);

  const abi = contracts?.abi?.Hashdle;
  if (!abi) throw new Error("Missing Hashdle ABI in contracts.abi.Hashdle");

  const pkRaw = process.env.HASHDLE_PRIVATE_KEY;
  if (!pkRaw) throw new Error("Missing NEXT_PUBLIC_HASHDLE_PRIVATE_KEY");
  const privKey = pkRaw.startsWith("0x") ? pkRaw : `0x${pkRaw}`;

  return {
    rpcUrl,
    hashdleAddress: addresses.Hashdle,
    hashdleAbi: abi,
    privKey,
  };
}

/** ---- CRYPTO HELPERS ---- */

// AES-256-GCM with key derived from SERVICE privkey (keccak256)
// Returns base64("iv:ciphertext:authTag")
function encryptWithServiceKey(plain, privKey) {
  const keyHex = ethers.keccak256(privKey);
  const key = Buffer.from(keyHex.slice(2), "hex");

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const ct = Buffer.concat([cipher.update(Buffer.from(plain, "utf8")), cipher.final()]);
  const tag = cipher.getAuthTag();

  // Concatenate: iv(12) + ct(variable) + tag(16)
  return Buffer.concat([iv, ct, tag]).toString("base64");
}

function randInt(min, max) {
  return crypto.randomInt(min, max + 1);
}

/** ---- ETH HELPERS ---- */

async function findLatestGameCreated(contract, tokenKey, player, fromBlock) {
  // ethers v6 filter w/ indexed params (tokenKey, gameId, player)
  const filter = contract.filters.GameCreated(tokenKey, null, player);
  const logs = await contract.queryFilter(filter, fromBlock, "latest");
  if (!logs.length) return null;
  return logs[logs.length - 1];
}

/** ---- ROUTE ---- */
export async function POST(req) {
  try {
    const apiKey = req.headers.get("X-Api-Key");
    if (apiKey !== process.env.NEXT_PUBLIC_API_KEY) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const { address, tokenKey, chain } = await req.json();

    if (!address || !tokenKey || !chain) {
      return NextResponse.json(
        { error: "Missing address, tokenKey, or chain" },
        { status: 400 }
      );
    }

    const { rpcUrl, hashdleAddress, hashdleAbi, privKey } = getChainConfig(chain);

    // Provider + signer (SERVICE_ROLE)
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const signer = new ethers.Wallet(privKey, provider);
    const contract = new ethers.Contract(hashdleAddress, hashdleAbi, signer);

    // 1) Find latest GameCreated for this player + tokenKey (recent window)
    const player = ethers.getAddress(address);
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, currentBlock - 100_000);

    const ev = await findLatestGameCreated(contract, tokenKey, player, fromBlock);
    if (!ev) {
      return NextResponse.json(
        { error: "No GameCreated event found for player/tokenKey" },
        { status: 404 }
      );
    }

    const gameId = ev.args.gameId; // BigInt
    const txHash = ev.transactionHash.replace('0x', '').toUpperCase(); // 0x... lowercase

    // 2) Ensure game started == false via viewGameFor
    const [hasGame, activeGameId, g] = await contract.viewGameFor(tokenKey, player);
    if (!hasGame || activeGameId !== gameId) {
      return NextResponse.json(
        { error: "Active game not found or gameId mismatch for player" },
        { status: 409 }
      );
    }
    if (g.started) {
      return NextResponse.json({ error: "Game already started" }, { status: 409 });
    }

    // 3) gameHash (uppercased tx hash)
    const gameHash = txHash;

    // 4) Random 0..60 inclusive; pull 5 chars from tx hash (strip 0x)
    const hexNo0x = gameHash.slice(2); // 64 hex chars
    const idx = randInt(0, 60);
    const plainTextTarget = hexNo0x.slice(idx, idx + 5); // 5 chars

    // 5) Encrypt target with service key
    const encryptedTarget = encryptWithServiceKey(plainTextTarget, privKey);
    const encryptedAddress = encryptWithServiceKey(player, privKey);

    // 6) Random 32-byte salt
    const saltBytes = ethers.randomBytes(32);
    const salt = ethers.hexlify(saltBytes); // 0x...

    // 7) idHash = keccak256(abi.encodePacked(gameId, plainTextTarget, salt))
    const idHash = ethers.solidityPackedKeccak256(
      ["uint256", "string", "bytes32"],
      [gameId, plainTextTarget, salt]
    );

    // 8) startGame(tokenKey, gameId, idHash, salt, gameHash, encryptedTarget)
    //    If your ABI has the 4-arg version, remove `gameHash` from the call below.
    const tx = await contract.startGame(
      tokenKey,
      gameId,
      idHash,
      salt,
      gameHash,
      encryptedTarget
    );
    await tx.wait();

    return NextResponse.json({
      tokenKey,
      chain,
      gameId: gameId.toString(),
      gameHash,
      accessToken: encryptedAddress
    });
  } catch (err) {
    console.error("start route error:", err);
    const msg = err?.reason || err?.shortMessage || err?.message || "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}