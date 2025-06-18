```rust
use anchor_lang::prelude::*;

#[account]
pub struct PredictionMarket {
    pub authority: Pubkey,
    pub market_id: u64,
    pub title: String,
    pub description: String,
    pub category: String,
    pub oracle: Pubkey,
    pub resolution_time: i64,
    pub creation_time: i64,
    pub total_liquidity: u64,
    pub outcome_a_pool: u64,
    pub outcome_b_pool: u64,
    pub outcome_a_shares: u64,
    pub outcome_b_shares: u64,
    pub fee_rate: u16,
    pub status: MarketStatus,
    pub resolved_outcome: Option<bool>,
    pub resolution_price: Option<u64>,
    pub bump: u8,
}

impl PredictionMarket {
    pub const LEN: usize = 8 + // discriminator
        32 + // authority
        8 + // market_id
        4 + 200 + // title (max 200 chars)
        4 + 500 + // description (max 500 chars)
        4 + 50 + // category (max 50 chars)
        32 + // oracle
        8 + // resolution_time
        8 + // creation_time
        8 + // total_liquidity
        8 + // outcome_a_pool
        8 + // outcome_b_pool
        8 + // outcome_a_shares
        8 + // outcome_b_shares
        2 + // fee_rate
        1 + // status
        1 + 1 + // resolved_outcome (Option<bool>)
        1 + 8 + // resolution_price (Option<u64>)
        1; // bump
}

#[account]
pub struct UserPosition {
    pub user: Pubkey,
    pub market: Pubkey,
    pub outcome_a_shares: u64,
    pub outcome_b_shares: u64,
    pub total_invested: u64,
    pub last_update_time: i64,
    pub bump: u8,
}

impl UserPosition {
    pub const LEN: usize = 8 + // discriminator
        32 + // user
        32 + // market
        8 + // outcome_a_shares
        8 + // outcome_b_shares
        8 + // total_invested
        8 + // last_update_time
        1; // bump
}

#[account]
pub struct LiquidityPool {
    pub market: Pubkey,
    pub token_mint: Pubkey,
    pub token_vault: Pubkey,
    pub total_supply: u64,
    pub reserve_a: u64,
    pub reserve_b: u64,
    pub fee_collected: u64,
    pub bump: u8,
    pub vault_bump: u8,
}

impl LiquidityPool {
    pub const LEN: usize = 8 + // discriminator
        32 + // market
        32 + // token_mint
        32 + // token_vault
        8 + // total_supply
        8 + // reserve_a
        8 + // reserve_b
        8 + // fee_collected
        1 + // bump
        1; // vault_bump
}

#[account]
pub struct OracleAccount {
    pub authority: Pubkey,
    pub oracle_id: u64,
    pub name: String,
    pub description: String,
    pub reputation_score: u64,
    pub total_resolutions: u64,
    pub correct_resolutions: u64,
    pub is_active: bool,
    pub creation_time: i64,
    pub bump: u8,
}

impl OracleAccount {
    pub const LEN: usize = 8 + // discriminator
        32 + // authority
        8 + // oracle_id
        4 + 100 + // name (max 100 chars)
        4 + 300 + // description (max 300 chars)
        8 + // reputation_score
        8 + // total_resolutions
        8 + // correct_resolutions
        1 + // is_active
        8 + // creation_time
        1; // bump
}

#[account]
pub struct GlobalState {
    pub authority: Pubkey,
    pub total_markets: u64,
    pub total_volume: u64,
    pub total_fees_collected: u64,
    pub platform_fee_rate: u16,
    pub min_resolution_time: i64,
    pub max_resolution_time: i64,
    pub is_paused: bool,
    pub bump: u8,
}

impl GlobalState {
    pub const LEN: usize = 8 + // discriminator
        32 + // authority
        8 + // total_markets
        8 + // total_volume
        8 + // total_fees_collected
        2 + // platform_fee_rate
        8 + // min_resolution_time
        8 + // max_resolution_time
        1 + // is_paused
        1; // bump
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum MarketStatus {
    Active,
    Resolved,
    Cancelled,
    Disputed,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct MarketParams {
    pub title: String,
    pub description: String,
    pub category: String,
    pub resolution_time: i64,
    pub fee_rate: u16,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct TradeParams {
    pub outcome: bool,
    pub amount: u64,
    pub max_slippage: u16,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct ResolutionParams {
    pub outcome: bool,
    pub resolution_price: u64,
}
```