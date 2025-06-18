```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
#[instruction(market_id: u64, outcome: u8, amount: u64)]
pub struct PlaceBet<'info> {
    #[account(mut)]
    pub bettor: Signer<'info>,

    #[account(
        mut,
        seeds = [b"market", market_id.to_le_bytes().as_ref()],
        bump,
        constraint = market.is_active @ PredictionMarketError::MarketNotActive,
        constraint = outcome < market.outcomes.len() as u8 @ PredictionMarketError::InvalidOutcome
    )]
    pub market: Account<'info, Market>,

    #[account(
        init_if_needed,
        payer = bettor,
        space = 8 + Bet::INIT_SPACE,
        seeds = [b"bet", market.key().as_ref(), bettor.key().as_ref()],
        bump
    )]
    pub bet: Account<'info, Bet>,

    #[account(
        mut,
        constraint = bettor_token_account.owner == bettor.key(),
        constraint = bettor_token_account.mint == market.token_mint
    )]
    pub bettor_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"vault", market.key().as_ref()],
        bump,
        constraint = market_vault.mint == market.token_mint
    )]
    pub market_vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn place_bet(
    ctx: Context<PlaceBet>,
    _market_id: u64,
    outcome: u8,
    amount: u64,
) -> Result<()> {
    let market = &mut ctx.accounts.market;
    let bet = &mut ctx.accounts.bet;
    let bettor = &ctx.accounts.bettor;

    require!(amount > 0, PredictionMarketError::InvalidAmount);
    require!(
        ctx.accounts.bettor_token_account.amount >= amount,
        PredictionMarketError::InsufficientFunds
    );

    // Transfer tokens from bettor to market vault
    let transfer_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.bettor_token_account.to_account_info(),
            to: ctx.accounts.market_vault.to_account_info(),
            authority: bettor.to_account_info(),
        },
    );
    token::transfer(transfer_ctx, amount)?;

    // Initialize or update bet
    if bet.bettor == Pubkey::default() {
        bet.bettor = bettor.key();
        bet.market = market.key();
        bet.outcome = outcome;
        bet.amount = amount;
        bet.timestamp = Clock::get()?.unix_timestamp;
    } else {
        require!(
            bet.outcome == outcome,
            PredictionMarketError::OutcomeMismatch
        );
        bet.amount = bet.amount.checked_add(amount)
            .ok_or(PredictionMarketError::MathOverflow)?;
    }

    // Update market totals
    market.total_pool = market.total_pool.checked_add(amount)
        .ok_or(PredictionMarketError::MathOverflow)?;
    
    market.outcomes[outcome as usize] = market.outcomes[outcome as usize]
        .checked_add(amount)
        .ok_or(PredictionMarketError::MathOverflow)?;

    market.total_bets = market.total_bets.checked_add(1)
        .ok_or(PredictionMarketError::MathOverflow)?;

    emit!(BetPlacedEvent {
        market: market.key(),
        bettor: bettor.key(),
        outcome,
        amount,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}

#[event]
pub struct BetPlacedEvent {
    pub market: Pubkey,
    pub bettor: Pubkey,
    pub outcome: u8,
    pub amount: u64,
    pub timestamp: i64,
}
```