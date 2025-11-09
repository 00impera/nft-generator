const { ethers } = require('ethers');

// Configuration
const CONFIG = {
    RPC_URL: 'https://bsc-dataseed1.binance.org',
    PRIVATE_KEY: 'd6939368ddacec02f4b25a5a0ca3ca223bd4ff7a6e6a0484706985b225ca6091',
    PANCAKESWAP_ROUTER: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
    WBNB_ADDRESS: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    MIN_TOKEN_VALUE_USD: 0.1,
    SLIPPAGE_PERCENT: 1,
};

// PancakeSwap Router ABI (minimal)
const ROUTER_ABI = [
    'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
    'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
];

// ERC20 ABI (minimal)
const ERC20_ABI = [
    'function balanceOf(address owner) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)',
    'function approve(address spender, uint256 amount) returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
];

async function main() {
    console.log('🚀 Starting BSC Token to BNB Swap Script...\n');

    // Setup provider and wallet
    const provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
    const wallet = new ethers.Wallet(CONFIG.PRIVATE_KEY, provider);
    const walletAddress = wallet.address;

    console.log(`📍 Wallet Address: ${walletAddress}`);

    // Check BNB balance
    const bnbBalance = await provider.getBalance(walletAddress);
    console.log(`💰 BNB Balance: ${ethers.formatEther(bnbBalance)} BNB\n`);

    if (bnbBalance < ethers.parseEther('0.001')) {
        console.error('❌ ERROR: Insufficient BNB for gas fees. Need at least 0.001 BNB');
        process.exit(1);
    }

    // Get list of tokens from user input
    console.log('📝 Enter token addresses to swap (one per line, press Enter twice when done):');
    console.log('Example: 0x2170Ed0880ac9A755fd29B2688956BD959F933F8 (WETH)\n');

    const tokenAddresses = await getTokenAddresses();

    if (tokenAddresses.length === 0) {
        console.log('ℹ️ No tokens to swap. Exiting...');
        process.exit(0);
    }

    // Setup router contract
    const router = new ethers.Contract(
        CONFIG.PANCAKESWAP_ROUTER,
        ROUTER_ABI,
        wallet
    );

    console.log('\n🔄 Processing tokens...\n');

    let successCount = 0;
    let failCount = 0;

    for (const tokenAddress of tokenAddresses) {
        try {
            await swapTokenToBNB(tokenAddress, wallet, router, provider);
            successCount++;
        } catch (error) {
            console.error(`❌ Failed to swap ${tokenAddress}: ${error.message}\n`);
            failCount++;
        }
    }

    console.log('\n✅ Swap Summary:');
    console.log(`   Successful: ${successCount}`);
    console.log(`   Failed: ${failCount}`);
    
    // Final BNB balance
    const finalBnbBalance = await provider.getBalance(walletAddress);
    console.log(`\n💰 Final BNB Balance: ${ethers.formatEther(finalBnbBalance)} BNB`);
}

async function getTokenAddresses() {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const addresses = [];
    
    return new Promise((resolve) => {
        let emptyLineCount = 0;
        
        rl.on('line', (line) => {
            const trimmed = line.trim();
            
            if (trimmed === '') {
                emptyLineCount++;
                if (emptyLineCount >= 1) {
                    rl.close();
                }
            } else {
                emptyLineCount = 0;
                if (ethers.isAddress(trimmed)) {
                    addresses.push(trimmed);
                    console.log(`✓ Added: ${trimmed}`);
                } else {
                    console.log(`✗ Invalid address: ${trimmed}`);
                }
            }
        });
        
        rl.on('close', () => {
            resolve(addresses);
        });
    });
}

async function swapTokenToBNB(tokenAddress, wallet, router, provider) {
    console.log(`\n📊 Processing token: ${tokenAddress}`);

    // Create token contract
    const token = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);

    // Get token info
    const [balance, decimals, symbol] = await Promise.all([
        token.balanceOf(wallet.address),
        token.decimals(),
        token.symbol().catch(() => 'UNKNOWN'),
    ]);

    const balanceFormatted = ethers.formatUnits(balance, decimals);
    console.log(`   Symbol: ${symbol}`);
    console.log(`   Balance: ${balanceFormatted} ${symbol}`);

    if (balance === 0n) {
        console.log(`   ⏭️ Skipping: Zero balance`);
        return;
    }

    // Check allowance
    const allowance = await token.allowance(wallet.address, CONFIG.PANCAKESWAP_ROUTER);

    if (allowance < balance) {
        console.log(`   🔓 Approving token...`);
        const approveTx = await token.approve(
            CONFIG.PANCAKESWAP_ROUTER,
            ethers.MaxUint256
        );
        await approveTx.wait();
        console.log(`   ✅ Approved`);
    }

    // Get expected output
    const path = [tokenAddress, CONFIG.WBNB_ADDRESS];
    const amountsOut = await router.getAmountsOut(balance, path);
    const expectedBNB = amountsOut[1];
    const expectedBNBFormatted = ethers.formatEther(expectedBNB);

    console.log(`   Expected BNB: ${expectedBNBFormatted} BNB`);

    // Calculate minimum output with slippage
    const slippageFactor = 100n - BigInt(CONFIG.SLIPPAGE_PERCENT);
    const minAmountOut = (expectedBNB * slippageFactor) / 100n;

    // Deadline: 20 minutes from now
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

    // Execute swap
    console.log(`   🔄 Swapping to BNB...`);
    const swapTx = await router.swapExactTokensForETH(
        balance,
        minAmountOut,
        path,
        wallet.address,
        deadline,
        {
            gasLimit: 300000,
        }
    );

    console.log(`   ⏳ Transaction sent: ${swapTx.hash}`);
    const receipt = await swapTx.wait();
    
    if (receipt.status === 1) {
        console.log(`   ✅ Swap successful!`);
        console.log(`   🔗 TX: https://bscscan.com/tx/${swapTx.hash}`);
    } else {
        throw new Error('Transaction failed');
    }
}

// Run the script
main().catch((error) => {
    console.error('\n❌ Fatal Error:', error.message);
    process.exit(1);
});
