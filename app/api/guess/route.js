// app/api/guess/route.js
import { NextResponse } from "next/server";
import { ethers } from "ethers";
import crypto from "node:crypto";
import contracts from "@/app/lib/hashdle-contracts.json";

export const runtime = "nodejs";

/** ---- ENV / CHAIN SELECTION ---- */
function getChainConfig(chain) {
  const rpcByChain = {
    mainnet: process.env.NEXT_PUBLIC_VITRUVEO_RPC_URL,
    bsc:     process.env.NEXT_PUBLIC_BSC_RPC_URL,
    base:    process.env.NEXT_PUBLIC_BASE_RPC_URL,
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
// Mirror of the start route’s AES-256-GCM scheme.
// Input: base64("iv:cipher:tag"), key = keccak256(privKey)
function decryptWithServiceKey(b64, privKey) {
  const keyHex = ethers.keccak256(privKey);
  const key = Buffer.from(keyHex.slice(2), "hex");

  const buf = Buffer.from(b64, "base64");

  // Extract fixed-length fields: iv(12) + ct(variable) + tag(16)
  if (buf.length < 28) throw new Error("Encrypted data too short");
  
  const iv = buf.slice(0, 12);
  const tag = buf.slice(-16);
  const ct = buf.slice(12, -16);

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const pt = Buffer.concat([decipher.update(ct), decipher.final()]);
  return pt.toString("utf8");
}
/** ---- FEEDBACK (Wordle-style with duplicates) ---- */
function buildFeedback(guess, solution) {
  // Both are 5-char uppercase hex strings
  const feedback = Array(5).fill(0);

  // First pass: mark greens and count remaining solution letters
  const solArr = solution.split("");
  const guessArr = guess.split("");

  const remaining = {}; // letter -> count (for misplaced/yellows)
  for (let i = 0; i < 5; i++) {
    if (guessArr[i] === solArr[i]) {
      feedback[i] = 2; // green
      solArr[i] = null; // consumed
      guessArr[i] = null;
    }
  }
  for (let i = 0; i < 5; i++) {
    const c = solArr[i];
    if (c !== null) remaining[c] = (remaining[c] || 0) + 1;
  }

  // Second pass: mark oranges where letter exists elsewhere (respect counts)
  for (let i = 0; i < 5; i++) {
    const g = guessArr[i];
    if (g !== null && remaining[g] > 0) {
      feedback[i] = 1; // orange
      remaining[g]--;
    }
  }
  return feedback;
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

    const { accessToken, tokenKey, chain, gameId, guessValue } = await req.json();

    // Basic input checks
    if (!accessToken || !tokenKey || !chain || !gameId) {
      return NextResponse.json(
        { error: "Missing accessToken, tokenKey, gameId, or chain" },
        { status: 400 }
      );
    }


    if (!gameId || typeof gameId !== "string" && typeof gameId !== "number" && typeof gameId !== "bigint") {
      return NextResponse.json({ error: "gameId must be provided" }, { status: 400 });
    }
    const gid = BigInt(gameId);
    if (gid <= 0n) {
      return NextResponse.json({ error: "gameId must be > 0" }, { status: 400 });
    }

    // 5-char uppercase hex
    if (!/^[0-9A-F]{5}$/.test(guessValue || "")) {
      return NextResponse.json(
        { error: "guessValue must be exactly 5 uppercase hex chars (0-9, A-F)" },
        { status: 400 }
      );
    }

    const { rpcUrl, hashdleAddress, hashdleAbi, privKey } = getChainConfig(chain);

    // Provider + signer (SERVICE_ROLE)
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const signer = new ethers.Wallet(privKey, provider);
    const contract = new ethers.Contract(hashdleAddress, hashdleAbi, signer);

    //Validate token
    const address = decryptWithServiceKey(accessToken, privKey);
    console.log(address);

    // Load game (direct view by id)
    const gameTmp = await contract.viewGame(tokenKey, gid);
    const game = gameTmp.toObject(true);
    if (!game.g.started || Number(game.g.status) !== 1 || game.g.player.toLowerCase() != address.toLowerCase()) {
      return NextResponse.json({ error: "Game not active" }, { status: 409 });
    }

    const encrypted = game.g.hash.encryptedTarget; // string
    if (!encrypted) {
      return NextResponse.json({ error: "Missing encryptedTarget" }, { status: 409 });
    }

    // Decrypt to plaintext 5-letter solution
    const solution = decryptWithServiceKey(encrypted, privKey).toUpperCase();

    if (!/^[0-9A-F]{5}$/.test(solution)) {
      return NextResponse.json({ error: "Decrypted solution invalid" }, { status: 500 });
    }

    // Build feedback
    const feedback = buildFeedback(guessValue, solution); // array of 5 ints: 0/1/2

    // Submit on-chain
    const tx = await contract.submitGuess(tokenKey, gid, guessValue, feedback);
    const receipt = await tx.wait();

    return NextResponse.json({
      tokenKey,
      chain,
      gameId: gid.toString(),
      guessValue,
      feedback,             // [0..2]*5
      txHash: receipt?.hash || tx?.hash,
      status: "submitted",
    });
  } catch (err) {
    console.error("guess route error:", err);
    const msg = err?.reason || err?.shortMessage || err?.message || "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}