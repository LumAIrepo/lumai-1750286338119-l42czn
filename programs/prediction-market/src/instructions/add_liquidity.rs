```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
pub struct AddLiquidity<'info> {
    #[account(
        mut,
        seeds = [b"market", market.market_id.to_le_bytes().as_ref()],
        bump = market.bump,
        has_one = outcome_a_pool,
        has_one = outcome_b_pool,
    )]
    pub market: Account<'info, Market>,

    #[account(
        init_if_needed,
        payer = user,
        space = 8 + LiquidityProvider::INIT_SPACE,
        seeds = [b"liquidity_provider", market.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub liquidity_provider: Account<'info, LiquidityProvider>,

    #[account(mut)]
    pub outcome_a_pool: Account<'info, TokenAccount>,

    #[account(mut)]
    pub outcome_b_pool: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = user_token_account.mint == market.base_mint @ PredictionMarketError::InvalidMint,
        constraint = user_token_account.owner == user.key() @ PredictionMarketError::InvalidTokenAccountOwner,
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = market.lp_mint,
        associated_token::authority = user,
    )]
    pub user_lp_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub lp_mint: Account<'info, token::Mint>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, anchor_spl::associated_token::AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

impl<'info> AddLiquidity<'info> {
    pub fn add_liquidity(&mut self, amount: u64, bumps: &AddLiquidityBumps) -> Result<()> {
        require!(amount > 0, PredictionMarketError::InvalidAmount);
        require!(
            self.market.status == MarketStatus::Active,
            PredictionMarketError::MarketNotActive
        );

        let market = &mut self.market;
        let liquidity_provider = &mut self.liquidity_provider;

        // Calculate current pool ratio
        let pool_a_balance = self.outcome_a_pool.amount;
        let pool_b_balance = self.outcome_b_pool.amount;
        let total_liquidity = pool_a_balance.checked_add(pool_b_balance)
            .ok_or(PredictionMarketError::MathOverflow)?;

        // For initial liquidity, split equally between pools
        let (amount_a, amount_b) = if total_liquidity == 0 {
            let half_amount = amount.checked_div(2)
                .ok_or(PredictionMarketError::MathOverflow)?;
            (half_amount, amount.checked_sub(half_amount)
                .ok_or(PredictionMarketError::MathOverflow)?)
        } else {
            // Maintain current pool ratio
            let amount_a = amount.checked_mul(pool_a_balance)
                .ok_or(PredictionMarketError::MathOverflow)?
                .checked_div(total_liquidity)
                .ok_or(PredictionMarketError::MathOverflow)?;
            let amount_b = amount.checked_sub(amount_a)
                .ok_or(PredictionMarketError::MathOverflow)?;
            (amount_a, amount_b)
        };

        // Transfer tokens from user to pools
        let transfer_to_a_ctx = CpiContext::new(
            self.token_program.to_account_info(),
            Transfer {
                from: self.user_token_account.to_account_info(),
                to: self.outcome_a_pool.to_account_info(),
                authority: self.user.to_account_info(),
            },
        );
        token::transfer(transfer_to_a_ctx, amount_a)?;

        let transfer_to_b_ctx = CpiContext::new(
            self.token_program.to_account_info(),
            Transfer {
                from: self.user_token_account.to_account_info(),
                to: self.outcome_b_pool.to_account_info(),
                authority: self.user.to_account_info(),
            },
        );
        token::transfer(transfer_to_b_ctx, amount_b)?;

        // Calculate LP tokens to mint
        let lp_tokens_to_mint = if market.total_liquidity == 0 {
            amount
        } else {
            amount.checked_mul(self.lp_mint.supply)
                .ok_or(PredictionMarketError::MathOverflow)?
                .checked_div(market.total_liquidity)
                .ok_or(PredictionMarketError::MathOverflow)?
        };

        // Mint LP tokens to user
        let market_seeds = &[
            b"market",
            market.market_id.to_le_bytes().as_ref(),
            &[market.bump],
        ];
        let signer_seeds = &[&market_seeds[..]];

        let mint_ctx = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            token::MintTo {
                mint: self.lp_mint.to_account_info(),
                to: self.user_lp_token_account.to_account_info(),
                authority: market.to_account_info(),
            },
            signer_seeds,
        );
        token::mint_to(mint_ctx, lp_tokens_to_mint)?;

        // Update liquidity provider account
        if liquidity_provider.user == Pubkey::default() {
            liquidity_provider.user = self.user.key();
            liquidity_provider.market = market.key();
            liquidity_provider.bump = bumps.liquidity_provider;
        }
        
        liquidity_provider.lp_tokens = liquidity_provider.lp_tokens
            .checked_add(lp_tokens_to_mint)
            .ok_or(PredictionMarketError::MathOverflow)?;
        liquidity_provider.total_deposited = liquidity_provider.total_deposited
            .checked_add(amount)
            .ok_or(PredictionMarketError::MathOverflow)?;

        // Update market state
        market.total_liquidity = market.total_liquidity
            .checked_add(amount)
            .ok_or(PredictionMarketError::MathOverflow)?;
        market.liquidity_providers_count = market.liquidity_providers_count
            .checked_add(1)
            .ok_or(PredictionMarketError::MathOverflow)?;

        emit!(LiquidityAddedEvent {
            market: market.key(),
            user: self.user.key(),
            amount,
            amount_a,
            amount_b,
            lp_tokens_minted: lp_tokens_to_mint,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }
}

#[event]
pub struct LiquidityAddedEvent {
    pub market: Pubkey,
    pub user: Pubkey,
    pub amount: u64,
    pub amount_a: u64,
    pub amount_b: u64,
    pub lp_tokens_minted: u64,
    pub timestamp: i64,
}
```