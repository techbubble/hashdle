// /app/api/hydrate/route.js
const { Web3 } = require("web3"); // Changed: destructure Web3

const web3 = new Web3(process.env.NEXT_PUBLIC_VITRUVEO_RPC_URL);
const account = web3.eth.accounts.privateKeyToAccount(`0x${process.env.HYDRATE_PRIVATE_KEY}`);

async function fund(target, valueWeiString) {
  const nonce = await web3.eth.getTransactionCount(account.address, "pending");

  const gasLimit = 21000n;
  const gasPrice = 5n * 10n ** 9n; // 5 gwei
  const value = BigInt(valueWeiString); // already a decimal string of wei

  const txInfo = {
    nonce: `0x${nonce.toString(16)}`,
    to: target,
    gas: `0x${gasLimit.toString(16)}`,
    gasPrice: `0x${gasPrice.toString(16)}`,
    value: `0x${value.toString(16)}`
  };

  const signed = await web3.eth.accounts.signTransaction(txInfo, account.privateKey);
  return web3.eth.sendSignedTransaction(signed.rawTransaction);
}

export async function POST(request) {
    try {
        const apiKey = request.headers.get("X-Api-Key");
        
        if (apiKey !== process.env.NEXT_PUBLIC_API_KEY) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const data = await request.json();
        console.log('Hydrate: ', data)
        if (!data.address || data.address.length !== 42) {
            return new Response(JSON.stringify({ error: 'Invalid address' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const currentBalance = await web3.eth.getBalance(data.address);
        const currentBalanceInEth = parseFloat(web3.utils.fromWei(currentBalance, 'ether'));
        
        // Check if balance is less than 0.002
        if (currentBalanceInEth < 0.005) {
            const targetBalance = '5100000000000000'; // 0.005 ETH in wei
            const funds = BigInt(targetBalance) - BigInt(currentBalance);
            
            if (funds > 0n) {
                const receipt = await fund(data.address, funds.toString());
                return Response.json({ 
                    success: true, 
                    funded: true,
                    txHash: receipt.transactionHash,
                    balance: Number(targetBalance)
                });
            }
        }

        return Response.json({ 
            success: true, 
            funded: false,
            message: 'Balance already sufficient',
            balance: Number(currentBalance)
        });

    } catch (error) {
        console.error('Hydrate error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}