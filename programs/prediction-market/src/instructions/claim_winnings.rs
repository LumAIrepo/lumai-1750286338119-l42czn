```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
pub struct ClaimWinnings<'info> {
    #[account(
        mut,
        seeds = [b"market", market.market_id.to_le_bytes().as_ref()],
        bump = market.bump,
        constraint = market.is_resolved @ PredictionMarketError::MarketNotResolved,
    )]
    pub market: Account<'info, Market>,

    #[account(
        mut,
        seeds = [
            b"position",
            market.key().as_ref(),
            user.key().as_ref()
        ],
        bump = position.bump,
        constraint = position.market == market.key() @ PredictionMarketError::InvalidPosition,
        constraint = position.user == user.key() @ PredictionMarketError::InvalidPosition,
        constraint = !position.claimed @ PredictionMarketError::AlreadyClaimed,
    )]
    pub position: Account<'info, Position>,

    #[account(
        mut,
        seeds = [b"vault", market.key().as_ref()],
        bump = market.vault_bump,
    )]
    pub vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = user_token_account.mint == market.token_mint @ PredictionMarketError::InvalidTokenAccount,
        constraint = user_token_account.owner == user.key() @ PredictionMarketError::InvalidTokenAccount,
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        seeds = [b"authority", market.key().as_ref()],
        bump = market.authority_bump,
    )]
    /// CHECK: This is a PDA used as authority for token transfers
    pub vault_authority: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn claim_winnings(ctx: Context<ClaimWinnings>) -> Result<()> {
    let market = &mut ctx.accounts.market;
    let position = &mut ctx.accounts.position;
    let vault = &ctx.accounts.vault;
    let user_token_account = &ctx.accounts.user_token_account;
    let vault_authority = &ctx.accounts.vault_authority;
    let token_program = &ctx.accounts.token_program;

    // Check if user has a winning position
    let is_winner = match market.outcome {
        Some(outcome) => position.outcome == outcome,
        None => return Err(PredictionMarketError::MarketNotResolved.into()),
    };

    require!(is_winner, PredictionMarketError::NotAWinner);

    // Calculate winnings
    let total_pool = market.total_yes_amount + market.total_no_amount;
    let winning_pool = if position.outcome {
        market.total_yes_amount
    } else {
        market.total_no_amount
    };

    require!(winning_pool > 0, PredictionMarketError::InvalidWinningPool);

    // Calculate user's share of the total pool
    let winnings = (position.amount as u128)
        .checked_mul(total_pool as u128)
        .ok_or(PredictionMarketError::MathOverflow)?
        .checked_div(winning_pool as u128)
        .ok_or(PredictionMarketError::MathOverflow)? as u64;

    require!(winnings > 0, PredictionMarketError::NoWinnings);
    require!(vault.amount >= winnings, PredictionMarketError::InsufficientVaultFunds);

    // Transfer winnings from vault to user
    let market_key = market.key();
    let authority_seeds = &[
        b"authority",
        market_key.as_ref(),
        &[market.authority_bump],
    ];
    let signer_seeds = &[&authority_seeds[..]];

    let transfer_ctx = CpiContext::new_with_signer(
        token_program.to_account_info(),
        Transfer {
            from: vault.to_account_info(),
            to: user_token_account.to_account_info(),
            authority: vault_authority.to_account_info(),
        },
        signer_seeds,
    );

    token::transfer(transfer_ctx, winnings)?;

    // Mark position as claimed
    position.claimed = true;
    position.winnings_claimed = winnings;

    // Update market statistics
    market.total_claimed = market.total_claimed.checked_add(winnings)
        .ok_or(PredictionMarketError::MathOverflow)?;

    emit!(WinningsClaimedEvent {
        market: market.key(),
        user: ctx.accounts.user.key(),
        amount: winnings,
        outcome: position.outcome,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}

#[event]
pub struct WinningsClaimedEvent {
    pub market: Pubkey,
    pub user: Pubkey,
    pub amount: u64,
    pub outcome: bool,
    pub timestamp: i64,
}
```