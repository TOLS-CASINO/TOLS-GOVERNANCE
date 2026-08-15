import { NextResponse } from 'next/server'

const now = new Date()
const ts = (minsAgo: number) => new Date(now.getTime() - minsAgo * 60000).toISOString()

const wallets = [
  { id: 'w-001', address: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18', network: 'ethereum', type: 'hot', label: 'Main Hot Wallet', balance: 12.5, balanceUsd: 31250, currency: 'ETH', isActive: true, isVerified: true, lastSyncAt: ts(2), createdAt: '2024-01-10T00:00:00.000Z' },
  { id: 'w-002', address: 'bc1qxy2kgdygjrsqtzqkz42z8l9j4h3f7v5c6d7e8', network: 'bitcoin', type: 'cold', label: 'Cold Storage', balance: 2.3, balanceUsd: 142600, currency: 'BTC', isActive: true, isVerified: true, lastSyncAt: ts(15), createdAt: '2024-01-10T00:00:00.000Z' },
  { id: 'w-003', address: 'TJYeQxN4pX7kLm9Rg3vB2cW8dF5hJ6sA1', network: 'tron', type: 'hot', label: 'Player Deposits', balance: 50000, balanceUsd: 4250, currency: 'TRX', isActive: true, isVerified: true, lastSyncAt: ts(1), createdAt: '2024-02-15T00:00:00.000Z' },
  { id: 'w-004', address: '0x3a8B7c2D9e1F4g6H8i0J2k4L6m8N0o2P', network: 'polygon', type: 'hot', label: 'Staking Wallet', balance: 5000, balanceUsd: 3750, currency: 'MATIC', isActive: true, isVerified: true, lastSyncAt: ts(8), createdAt: '2024-03-01T00:00:00.000Z' },
  { id: 'w-005', address: '0x9fE8dC7bA6f5E4d3C2b1A0z9Y8x7W6v5U', network: 'ethereum', type: 'multi_sig', label: 'Multi-sig Treasury', balance: 45.2, balanceUsd: 112500, currency: 'ETH', isActive: true, isVerified: true, lastSyncAt: ts(20), createdAt: '2024-01-10T00:00:00.000Z' },
]

const transactions = [
  { id: 'tx-001', walletId: 'w-001', txHash: '0xabc123def456789012345678901234567890abcdef', type: 'deposit', fromAddress: '0xPlayer1...', toAddress: '0x742d...', amount: 2.5, currency: 'ETH', amountUsd: 6250, gasFee: 0.003, gasFeeUsd: 7.5, blockNumber: 19456789, confirmations: 12, status: 'confirmed', confirmedAt: ts(10), createdAt: ts(10) },
  { id: 'tx-002', walletId: 'w-002', txHash: '0xbtc9876543210abcdef0123456789abcde', type: 'withdrawal', fromAddress: 'bc1qxy2...', toAddress: 'bc1qPlayer2...', amount: 0.5, currency: 'BTC', amountUsd: 31000, gasFee: 0.0001, gasFeeUsd: 6.2, blockNumber: 823456, confirmations: 6, status: 'confirming', createdAt: ts(30) },
  { id: 'tx-003', walletId: 'w-003', txHash: '0xtron_abcdef1234567890', type: 'deposit', fromAddress: 'TPlayer3...', toAddress: 'TJYeQx...', amount: 10000, currency: 'TRX', amountUsd: 850, gasFee: 1, gasFeeUsd: 0.085, blockNumber: 56789012, confirmations: 19, status: 'confirmed', confirmedAt: ts(45), createdAt: ts(45) },
  { id: 'tx-004', walletId: 'w-001', txHash: '0xeth_transfer_9876543210abc', type: 'transfer', fromAddress: '0x742d...', toAddress: '0x3a8B...', amount: 5, currency: 'ETH', amountUsd: 12500, gasFee: 0.005, gasFeeUsd: 12.5, blockNumber: 19456790, confirmations: 3, status: 'confirming', createdAt: ts(60) },
  { id: 'tx-005', walletId: 'w-004', txHash: '0xpoly_stake_1234567890', type: 'contract_call', fromAddress: '0x3a8B...', toAddress: '0xStakingContract...', amount: 1000, currency: 'MATIC', amountUsd: 750, gasFee: 0.01, gasFeeUsd: 0.0075, blockNumber: 51234567, confirmations: 25, status: 'confirmed', confirmedAt: ts(90), createdAt: ts(90) },
  { id: 'tx-006', walletId: 'w-001', txHash: '0xfail_tx_abcdef', type: 'withdrawal', fromAddress: '0x742d...', toAddress: '0xExternal...', amount: 1, currency: 'ETH', amountUsd: 2500, gasFee: 0, gasFeeUsd: 0, blockNumber: null, confirmations: 0, status: 'failed', createdAt: ts(120) },
  { id: 'tx-007', walletId: 'w-005', txHash: '0xmultisig_proposal_1234', type: 'transfer', fromAddress: '0x9fE8...', toAddress: '0x742d...', amount: 10, currency: 'ETH', amountUsd: 25000, gasFee: 0.008, gasFeeUsd: 20, blockNumber: null, confirmations: 0, status: 'pending', createdAt: ts(5) },
  { id: 'tx-008', walletId: 'w-003', txHash: '0xtron_deposit_5678', type: 'deposit', fromAddress: 'TPlayer4...', toAddress: 'TJYeQx...', amount: 25000, currency: 'TRX', amountUsd: 2125, gasFee: 1, gasFeeUsd: 0.085, blockNumber: 56789013, confirmations: 30, status: 'confirmed', confirmedAt: ts(150), createdAt: ts(150) },
  { id: 'tx-009', walletId: 'w-004', txHash: '0xpoly_claim_rewards', type: 'contract_call', fromAddress: '0x3a8B...', toAddress: '0xRewardPool...', amount: 500, currency: 'MATIC', amountUsd: 375, gasFee: 0.005, gasFeeUsd: 0.00375, blockNumber: 51234568, confirmations: 18, status: 'confirmed', confirmedAt: ts(180), createdAt: ts(180) },
  { id: 'tx-010', walletId: 'w-001', txHash: '0xeth_deposit_latest', type: 'deposit', fromAddress: '0xPlayer5...', toAddress: '0x742d...', amount: 0.75, currency: 'ETH', amountUsd: 1875, gasFee: 0.002, gasFeeUsd: 5, blockNumber: null, confirmations: 0, status: 'pending', createdAt: ts(1) },
]

const networks = [
  { id: 'net-001', name: 'Ethereum Mainnet', chainId: 1, symbol: 'ETH', type: 'mainnet', rpcUrl: 'https://eth.mainnet.gateway.tols', explorerUrl: 'https://etherscan.io', isSupported: true, isActive: true },
  { id: 'net-002', name: 'Bitcoin', chainId: null, symbol: 'BTC', type: 'mainnet', rpcUrl: 'https://btc.mainnet.gateway.tols', explorerUrl: 'https://blockstream.info', isSupported: true, isActive: true },
  { id: 'net-003', name: 'Tron', chainId: null, symbol: 'TRX', type: 'mainnet', rpcUrl: 'https://trx.mainnet.gateway.tols', explorerUrl: 'https://tronscan.org', isSupported: true, isActive: true },
  { id: 'net-004', name: 'Solana', chainId: null, symbol: 'SOL', type: 'mainnet', rpcUrl: 'https://sol.mainnet.gateway.tols', explorerUrl: 'https://solscan.io', isSupported: true, isActive: true },
  { id: 'net-005', name: 'Polygon', chainId: 137, symbol: 'MATIC', type: 'mainnet', rpcUrl: 'https://polygon.mainnet.gateway.tols', explorerUrl: 'https://polygonscan.com', isSupported: true, isActive: true },
  { id: 'net-006', name: 'BSC', chainId: 56, symbol: 'BNB', type: 'mainnet', rpcUrl: 'https://bsc.mainnet.gateway.tols', explorerUrl: 'https://bscscan.com', isSupported: true, isActive: true },
]

const contracts = [
  { id: 'sc-001', name: 'Escrow Vault', address: '0xEscrowVault1234567890abcdef', network: 'Ethereum', type: 'escrow', isVerified: true, deployedAt: '2024-01-15T00:00:00.000Z', isActive: true },
  { id: 'sc-002', name: 'TOLS Token', address: '0xTOLS_Token_abcdef1234567890', network: 'Ethereum', type: 'token', isVerified: true, deployedAt: '2024-02-01T00:00:00.000Z', isActive: true },
  { id: 'sc-003', name: 'Player NFT Collection', address: '0xNFT_Collection_9876543210', network: 'Polygon', type: 'nft', isVerified: true, deployedAt: '2024-03-15T00:00:00.000Z', isActive: true },
  { id: 'sc-004', name: 'Staking Pool', address: '0xStaking_Pool_abcdef1234', network: 'Polygon', type: 'staking', isVerified: false, deployedAt: '2024-04-01T00:00:00.000Z', isActive: true },
  { id: 'sc-005', name: 'Governance DAO', address: '0xGovernance_DAO_5678', network: 'Ethereum', type: 'governance', isVerified: true, deployedAt: '2024-05-01T00:00:00.000Z', isActive: true },
]

export async function GET() {
  return NextResponse.json({ wallets, transactions, networks, contracts })
}
