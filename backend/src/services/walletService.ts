import { ethers } from 'ethers';
import { logger } from '@/utils/logger';

export interface WalletBalance {
  address: string;
  ethBalance: string;
  usdcBalance: string;
  wethBalance: string;
  totalValueUSD: number;
}

export interface DepositTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  token: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}

class WalletService {
  private provider: ethers.JsonRpcProvider;

  constructor() {
    // Use Hedera testnet RPC or mainnet as configured
    const rpcUrl =
      process.env.HEDERA_RPC_URL || 'https://testnet.hashio.io/api';
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    logger.info('Wallet service initialized with Hedera RPC');
  }

  /**
   * Get wallet balance for a given address
   */
  async getWalletBalance(address: string): Promise<WalletBalance> {
    try {
      // Get ETH balance (HBAR on Hedera)
      const ethBalance = await this.provider.getBalance(address);

      // For demo purposes, we'll mock token balances
      // In production, you'd query actual token contracts
      const mockUsdcBalance = '1000.0'; // Mock USDC balance
      const mockWethBalance = '0.5'; // Mock WETH balance

      // Calculate total value in USD (mock prices)
      const ethPrice = 2000; // Mock ETH price
      const usdcPrice = 1; // USDC is stable
      const wethPrice = 2000; // WETH ≈ ETH price

      const totalValueUSD =
        parseFloat(ethers.formatEther(ethBalance)) * ethPrice +
        parseFloat(mockUsdcBalance) * usdcPrice +
        parseFloat(mockWethBalance) * wethPrice;

      return {
        address,
        ethBalance: ethers.formatEther(ethBalance),
        usdcBalance: mockUsdcBalance,
        wethBalance: mockWethBalance,
        totalValueUSD: Math.round(totalValueUSD * 100) / 100,
      };
    } catch (error) {
      logger.error('Error getting wallet balance:', error);
      throw new Error('Failed to fetch wallet balance');
    }
  }

  /**
   * Prepare deposit transaction data
   */
  async prepareDepositTransaction(
    fromAddress: string,
    amount: string,
    token: 'ETH' | 'USDC' = 'ETH'
  ): Promise<{
    to: string;
    value: string;
    data: string;
    gasLimit: string;
  }> {
    try {
      // This would be the contract address for your deposit contract
      const depositContractAddress =
        process.env.DEPOSIT_CONTRACT_ADDRESS ||
        '0x0000000000000000000000000000000000000000';

      // For ETH deposits, we send directly to the contract
      // For token deposits, we'd need to encode a transfer function call
      const value = token === 'ETH' ? ethers.parseEther(amount) : '0';

      // Mock gas limit - in production, estimate gas properly
      const gasLimit = '21000';

      return {
        to: depositContractAddress,
        value: value.toString(),
        data: '0x', // Empty data for simple ETH transfer
        gasLimit,
      };
    } catch (error) {
      logger.error('Error preparing deposit transaction:', error);
      throw new Error('Failed to prepare deposit transaction');
    }
  }

  /**
   * Validate deposit amount against wallet balance
   */
  async validateDepositAmount(
    address: string,
    amount: string,
    token: 'ETH' | 'USDC' = 'ETH'
  ): Promise<boolean> {
    try {
      const balance = await this.getWalletBalance(address);

      const requestedAmount = parseFloat(amount);
      let availableBalance: number;

      if (token === 'ETH') {
        availableBalance = parseFloat(balance.ethBalance);
      } else {
        availableBalance = parseFloat(balance.usdcBalance);
      }

      // Check if user has sufficient balance (with small buffer for gas)
      return availableBalance >= requestedAmount + 0.01; // 0.01 buffer for gas
    } catch (error) {
      logger.error('Error validating deposit amount:', error);
      return false;
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(
    txHash: string
  ): Promise<DepositTransaction | null> {
    try {
      const tx = await this.provider.getTransaction(txHash);
      if (!tx) {
        return null;
      }

      const receipt = await this.provider.getTransactionReceipt(txHash);
      const status = receipt
        ? receipt.status === 1
          ? 'confirmed'
          : 'failed'
        : 'pending';

      return {
        hash: txHash,
        from: tx.from || '',
        to: tx.to || '',
        value: tx.value.toString(),
        token: 'ETH', // Default to ETH, could be determined from tx data
        timestamp: Math.floor(Date.now() / 1000), // Use current time since tx.timestamp doesn't exist
        status,
      };
    } catch (error) {
      logger.error('Error getting transaction status:', error);
      return null;
    }
  }

  /**
   * Format balance for display
   */
  formatBalance(balance: string, decimals: number = 4): string {
    const num = parseFloat(balance);
    return num.toFixed(decimals);
  }

  /**
   * Convert wei to ether
   */
  weiToEther(wei: string): string {
    return ethers.formatEther(wei);
  }

  /**
   * Convert ether to wei
   */
  etherToWei(ether: string): string {
    return ethers.parseEther(ether).toString();
  }
}

export const walletService = new WalletService();
