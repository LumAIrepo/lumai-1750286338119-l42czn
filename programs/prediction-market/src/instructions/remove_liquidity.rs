```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
pub struct RemoveLiquidity<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"market", market.market_id.to_le_bytes().as_ref()],
        bump = market.bump,
    )]
    pub market: Account<'info, Market>,
    
    #[account(
        mut,
        seeds = [b"pool", market.key().as_ref()],
        bump = pool.bump,
    )]
    pub pool: Account<'info, LiquidityPool>,
    
    #[account(
        mut,
        seeds = [b"user_position", user.key().as_ref(), market.key().as_ref()],
        bump = user_position.bump,
        constraint = user_position.user == user.key() @ PredictionMarketError::InvalidUser,
    )]
    pub user_position: Account<'info, UserPosition>,
    
    #[account(
        mut,
        constraint = pool_token_account.mint == pool.token_mint @ PredictionMarketError::InvalidTokenMint,
        constraint = pool_token_account.owner == pool.key() @ PredictionMarketError::InvalidTokenOwner,
    )]
    pub pool_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = user_token_account.mint == pool.token_mint @ PredictionMarketError::InvalidTokenMint,
        constraint = user_token_account.owner == user.key() @ PredictionMarketError::InvalidTokenOwner,
    )]
    pub user_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn remove_liquidity(
    ctx: Context<RemoveLiquidity>,
    liquidity_amount: u64,
) -> Result<()> {
    let market = &mut ctx.accounts.market;
    let pool = &mut ctx.accounts.pool;
    let user_position = &mut ctx.accounts.user_position;
    
    // Validate market is active
    require!(
        market.status == MarketStatus::Active,
        PredictionMarketError::MarketNotActive
    );
    
    // Validate liquidity amount
    require!(
        liquidity_amount > 0,
        PredictionMarketError::InvalidAmount
    );
    
    require!(
        user_position.liquidity_provided >= liquidity_amount,
        PredictionMarketError::InsufficientLiquidity
    );
    
    // Calculate withdrawal amount based on pool share
    let total_liquidity = pool.total_liquidity;
    require!(
        total_liquidity > 0,
        PredictionMarketError::NoLiquidityInPool
    );
    
    let pool_balance = ctx.accounts.pool_token_account.amount;
    let withdrawal_amount = (liquidity_amount as u128)
        .checked_mul(pool_balance as u128)
        .ok_or(PredictionMarketError::MathOverflow)?
        .checked_div(total_liquidity as u128)
        .ok_or(PredictionMarketError::MathOverflow)? as u64;
    
    require!(
        withdrawal_amount > 0,
        PredictionMarketError::InvalidWithdrawalAmount
    );
    
    require!(
        pool_balance >= withdrawal_amount,
        PredictionMarketError::InsufficientPoolBalance
    );
    
    // Calculate fees (if any)
    let fee_rate = pool.withdrawal_fee_rate;
    let fee_amount = (withdrawal_amount as u128)
        .checked_mul(fee_rate as u128)
        .ok_or(PredictionMarketError::MathOverflow)?
        .checked_div(10000u128)
        .ok_or(PredictionMarketError::MathOverflow)? as u64;
    
    let net_withdrawal = withdrawal_amount
        .checked_sub(fee_amount)
        .ok_or(PredictionMarketError::MathOverflow)?;
    
    // Transfer tokens from pool to user
    let market_key = market.key();
    let pool_seeds = &[
        b"pool",
        market_key.as_ref(),
        &[pool.bump],
    ];
    let pool_signer = &[&pool_seeds[..]];
    
    let transfer_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.pool_token_account.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: pool.to_account_info(),
        },
        pool_signer,
    );
    
    token::transfer(transfer_ctx, net_withdrawal)?;
    
    // Update user position
    user_position.liquidity_provided = user_position.liquidity_provided
        .checked_sub(liquidity_amount)
        .ok_or(PredictionMarketError::MathOverflow)?;
    
    user_position.total_withdrawn = user_position.total_withdrawn
        .checked_add(net_withdrawal)
        .ok_or(PredictionMarketError::MathOverflow)?;
    
    // Update pool state
    pool.total_liquidity = pool.total_liquidity
        .checked_sub(liquidity_amount)
        .ok_or(PredictionMarketError::MathOverflow)?;
    
    pool.total_fees_collected = pool.total_fees_collected
        .checked_add(fee_amount)
        .ok_or(PredictionMarketError::MathOverflow)?;
    
    // Update market liquidity
    market.total_liquidity = market.total_liquidity
        .checked_sub(liquidity_amount)
        .ok_or(PredictionMarketError::MathOverflow)?;
    
    // Emit event
    emit!(LiquidityRemovedEvent {
        user: ctx.accounts.user.key(),
        market: market.key(),
        liquidity_amount,
        withdrawal_amount: net_withdrawal,
        fee_amount,
        timestamp: Clock::get()?.unix_timestamp,
    });
    
    Ok(())
}

#[event]
pub struct LiquidityRemovedEvent {
    pub user: Pubkey,
    pub market: Pubkey,
    pub liquidity_amount: u64,
    pub withdrawal_amount: u64,
    pub fee_amount: u64,
    pub timestamp: i64,
}
```