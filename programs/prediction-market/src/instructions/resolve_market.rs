```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
pub struct ResolveMarket<'info> {
    #[account(
        mut,
        has_one = oracle @ PredictionMarketError::InvalidOracle,
        constraint = market.status == MarketStatus::Active @ PredictionMarketError::MarketNotActive,
        constraint = market.resolution_time <= Clock::get()?.unix_timestamp @ PredictionMarketError::MarketNotExpired
    )]
    pub market: Account<'info, Market>,
    
    #[account(
        constraint = oracle.key() == market.oracle @ PredictionMarketError::InvalidOracle
    )]
    pub oracle: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"vault", market.key().as_ref()],
        bump = market.vault_bump,
        token::mint = market.token_mint,
        token::authority = market_authority
    )]
    pub vault: Account<'info, TokenAccount>,
    
    #[account(
        seeds = [b"authority", market.key().as_ref()],
        bump = market.authority_bump
    )]
    /// CHECK: This is a PDA used as authority for the vault
    pub market_authority: UncheckedAccount<'info>,
    
    #[account(
        mut,
        constraint = oracle_fee_account.mint == market.token_mint @ PredictionMarketError::InvalidMint
    )]
    pub oracle_fee_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn resolve_market(
    ctx: Context<ResolveMarket>,
    outcome: u8,
    oracle_data: Vec<u8>,
) -> Result<()> {
    let market = &mut ctx.accounts.market;
    
    // Validate outcome
    require!(outcome <= 1, PredictionMarketError::InvalidOutcome);
    
    // Validate oracle data (basic validation)
    require!(!oracle_data.is_empty(), PredictionMarketError::InvalidOracleData);
    require!(oracle_data.len() <= 256, PredictionMarketError::OracleDataTooLarge);
    
    // Calculate oracle fee (1% of total pool)
    let total_pool = market.yes_amount + market.no_amount;
    let oracle_fee = total_pool
        .checked_mul(market.oracle_fee_bps as u64)
        .ok_or(PredictionMarketError::MathOverflow)?
        .checked_div(10000)
        .ok_or(PredictionMarketError::MathOverflow)?;
    
    // Transfer oracle fee if there's a fee to pay
    if oracle_fee > 0 {
        let market_key = market.key();
        let authority_seeds = &[
            b"authority",
            market_key.as_ref(),
            &[market.authority_bump],
        ];
        let signer_seeds = &[&authority_seeds[..]];
        
        let cpi_accounts = Transfer {
            from: ctx.accounts.vault.to_account_info(),
            to: ctx.accounts.oracle_fee_account.to_account_info(),
            authority: ctx.accounts.market_authority.to_account_info(),
        };
        
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
        
        token::transfer(cpi_ctx, oracle_fee)?;
    }
    
    // Update market state
    market.status = MarketStatus::Resolved;
    market.winning_outcome = Some(outcome);
    market.resolution_timestamp = Clock::get()?.unix_timestamp;
    market.oracle_data = oracle_data;
    
    // Calculate winning pool and losing pool
    let (winning_pool, losing_pool) = if outcome == 0 {
        (market.no_amount, market.yes_amount)
    } else {
        (market.yes_amount, market.no_amount)
    };
    
    // Calculate total payout pool (losing pool + remaining winning pool after oracle fee)
    let remaining_pool = total_pool.checked_sub(oracle_fee).ok_or(PredictionMarketError::MathOverflow)?;
    market.total_payout_pool = remaining_pool;
    market.winning_pool = winning_pool;
    
    emit!(MarketResolvedEvent {
        market: market.key(),
        outcome,
        winning_pool,
        losing_pool,
        oracle_fee,
        resolution_timestamp: market.resolution_timestamp,
    });
    
    Ok(())
}

#[event]
pub struct MarketResolvedEvent {
    pub market: Pubkey,
    pub outcome: u8,
    pub winning_pool: u64,
    pub losing_pool: u64,
    pub oracle_fee: u64,
    pub resolution_timestamp: i64,
}
```