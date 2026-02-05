import { vi } from 'vitest'
import { ContractState, BlueprintInfo, ContractHistory } from '@/types/hathor'
import { Network } from '@/lib/config'

export const mockBlueprintInfo: BlueprintInfo = {
  id: 'test-blueprint-id',
  name: 'HathorDice',
  attributes: {
    public_methods: ['place_bet', 'add_liquidity', 'remove_liquidity', 'claim_balance'],
  },
}

export const mockContractStates: Record<string, ContractState> = {
  'contract-htr': {
    token_uid: '00',
    max_bet_amount: 10000n,
    house_edge_basis_points: 190,
    random_bit_length: 16,
    available_tokens: 100000000n,
    total_liquidity_provided: 100000000n,
  },
  'contract-usdc': {
    token_uid: '01',
    max_bet_amount: 5000n,
    house_edge_basis_points: 250,
    random_bit_length: 20,
    available_tokens: 50000000n,
    total_liquidity_provided: 50000000n,
  },
}

export const mockTransactions = [
  {
    tx_id: '0000000000000001',
    timestamp: Date.now() - 60000,
    nc_method: 'place_bet',
    nc_caller: 'WYBwT3xLpDnHNtYZiU52oanupVeDKhAvNp',
    first_block: '0000000000000abc',
    is_voided: false,
    nc_args_decoded: {
      threshold: 32768,
    },
    nc_events: [
      {
        type: 'BetPlaced',
        data: '{"user":"WYBwT3xLpDnHNtYZiU52oanupVeDKhAvNp","amount":1000,"threshold":32768,"result":12345,"won":true,"payout":1900}',
      },
    ],
  },
  {
    tx_id: '0000000000000002',
    timestamp: Date.now() - 120000,
    nc_method: 'place_bet',
    nc_caller: 'WYBwT3xLpDnHNtYZiU52oanupVeDKhAvNp',
    first_block: '0000000000000abd',
    is_voided: false,
    nc_args_decoded: {
      threshold: 16384,
    },
    nc_events: [
      {
        type: 'BetPlaced',
        data: '{"user":"WYBwT3xLpDnHNtYZiU52oanupVeDKhAvNp","amount":500,"threshold":16384,"result":50000,"won":false,"payout":0}',
      },
    ],
  },
]

export const mockContractHistory: ContractHistory = {
  transactions: mockTransactions,
  total: mockTransactions.length,
  hasMore: false,
}

export class MockHathorCoreAPI {
  private baseUrl: string
  public network: Network

  constructor(network: Network) {
    this.network = network
    this.baseUrl = `https://mock-${network}.hathor.network/v1a`
  }

  async getBlueprintInfo(blueprintId: string): Promise<BlueprintInfo> {
    return mockBlueprintInfo
  }

  async getContractState(contractId: string): Promise<ContractState> {
    return mockContractStates[contractId] || mockContractStates['contract-htr']
  }

  async getContractHistory(
    contractId: string,
    limit: number = 50,
    after?: string
  ): Promise<ContractHistory> {
    // Simulate pagination
    const allTransactions = mockTransactions
    const startIndex = after ? allTransactions.findIndex(tx => tx.tx_id === after) + 1 : 0
    const transactions = allTransactions.slice(startIndex, startIndex + limit)

    return {
      transactions,
      total: transactions.length,
      hasMore: startIndex + limit < allTransactions.length,
    }
  }

  async getTransaction(txId: string): Promise<any> {
    const tx = mockTransactions.find(t => t.tx_id === txId)
    if (!tx) {
      throw new Error(`Transaction not found: ${txId}`)
    }
    return tx
  }

  async callViewFunction(
    contractId: string,
    method: string,
    args: any[] = [],
    callerAddress?: string
  ): Promise<any> {
    const callKey = `${method}(${args.map(arg => JSON.stringify(arg)).join(', ')})`

    // Mock different view function responses
    if (method === 'get_address_balance') {
      return {
        calls: {
          [callKey]: {
            value: 5000,
          },
        },
      }
    }

    if (method === 'calculate_address_maximum_liquidity_removal') {
      return {
        calls: {
          [callKey]: {
            value: 10000,
          },
        },
      }
    }

    return {
      calls: {
        [callKey]: {
          value: 0,
        },
      },
    }
  }

  async getMaximumLiquidityRemoval(contractId: string, callerAddress: string): Promise<bigint> {
    const result = await this.callViewFunction(
      contractId,
      'calculate_address_maximum_liquidity_removal',
      [callerAddress],
      callerAddress
    )
    const callKey = Object.keys(result.calls)[0]
    if (callKey && result.calls[callKey]?.value !== undefined) {
      return BigInt(result.calls[callKey].value)
    }
    return 0n
  }

  async getClaimableBalance(contractId: string, callerAddress: string): Promise<bigint> {
    const result = await this.callViewFunction(contractId, 'get_address_balance', [callerAddress], callerAddress)
    const callKey = Object.keys(result.calls)[0]
    if (callKey && result.calls[callKey]?.value !== undefined) {
      return BigInt(result.calls[callKey].value)
    }
    return 0n
  }
}

// Create mock instance
export const createMockHathorCoreAPI = (network: Network = 'testnet') => {
  return new MockHathorCoreAPI(network)
}

// Vitest mock factory
export const mockHathorCoreAPIFactory = () => {
  const mockInstance = createMockHathorCoreAPI()

  return {
    HathorCoreAPI: vi.fn().mockImplementation((network: Network) => {
      const instance = createMockHathorCoreAPI(network)
      return {
        getBlueprintInfo: vi.fn().mockImplementation(instance.getBlueprintInfo.bind(instance)),
        getContractState: vi.fn().mockImplementation(instance.getContractState.bind(instance)),
        getContractHistory: vi.fn().mockImplementation(instance.getContractHistory.bind(instance)),
        getTransaction: vi.fn().mockImplementation(instance.getTransaction.bind(instance)),
        callViewFunction: vi.fn().mockImplementation(instance.callViewFunction.bind(instance)),
        getMaximumLiquidityRemoval: vi.fn().mockImplementation(instance.getMaximumLiquidityRemoval.bind(instance)),
        getClaimableBalance: vi.fn().mockImplementation(instance.getClaimableBalance.bind(instance)),
      }
    }),
  }
}
