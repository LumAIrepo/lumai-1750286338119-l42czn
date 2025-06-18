```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint};

declare_id!("11111111111111111111111111111112");

#[program]
pub mod prediction_market {
    use super::*;

    pub fn initialize_market(
        ctx: Context<InitializeMarket>,
        market_id: u64,
        question: String,
        end_time: i64,
        oracle: Pubkey,
    ) -> Result<()> {
        let market = &mut ctx.accounts.market;
        market.market_id = market_id;
        market.question = question;
        market.end_time = end_time;
        market.oracle = oracle;
        market.total_yes_amount = 0;
        market.total_no_amount = 0;
        market.is_resolved = false;
        market.outcome = None;
        market.authority = ctx.accounts.authority.key();
        market.bump = ctx.bumps.market;
        Ok(())
    }

    pub fn place_bet(
        ctx: Context<PlaceBet>,
        amount: u64,
        prediction: bool,
    ) -> Result<()> {
        let market = &mut ctx.accounts.market;
        let bet = &mut ctx.accounts.bet;
        let clock = Clock::get()?;

        require!(clock.unix_timestamp < market.end_time, PredictionError::MarketClosed);
        require!(!market.is_resolved, PredictionError::MarketResolved);
        require!(amount > 0, PredictionError::InvalidAmount);

        // Transfer tokens from user to market vault
        let cpi_accounts = Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.market_vault.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        // Update market totals
        if prediction {
            market.total_yes_amount = market.total_yes_amount.checked_add(amount).unwrap();
        } else {
            market.total_no_amount = market.total_no_amount.checked_add(amount).unwrap();
        }

        // Initialize bet account
        bet.user = ctx.accounts.user.key();
        bet.market = ctx.accounts.market.key();
        bet.amount = amount;
        bet.prediction = prediction;
        bet.is_claimed = false;
        bet.bump = ctx.bumps.bet;

        Ok(())
    }

    pub fn resolve_market(
        ctx: Context<ResolveMarket>,
        outcome: bool,
    ) -> Result<()> {
        let market = &mut ctx.accounts.market;
        let clock = Clock::get()?;

        require!(ctx.accounts.oracle.key() == market.oracle, PredictionError::UnauthorizedOracle);
        require!(clock.unix_timestamp >= market.end_time, PredictionError::MarketNotEnded);
        require!(!market.is_resolved, PredictionError::MarketAlreadyResolved);

        market.is_resolved = true;
        market.outcome = Some(outcome);

        Ok(())
    }

    pub fn claim_winnings(ctx: Context<ClaimWinnings>) -> Result<()> {
        let market = &ctx.accounts.market;
        let bet = &mut ctx.accounts.bet;

        require!(market.is_resolved, PredictionError::MarketNotResolved);
        require!(!bet.is_claimed, PredictionError::AlreadyClaimed);
        require!(bet.user == ctx.accounts.user.key(), PredictionError::UnauthorizedUser);

        let outcome = market.outcome.unwrap();
        require!(bet.prediction == outcome, PredictionError::LosingBet);

        // Calculate winnings
        let total_winning_pool = if outcome {
            market.total_yes_amount
        } else {
            market.total_no_amount
        };

        let total_losing_pool = if outcome {
            market.total_no_amount
        } else {
            market.total_yes_amount
        };

        let total_pool = market.total_yes_amount.checked_add(market.total_no_amount).unwrap();
        let user_share = (bet.amount as u128)
            .checked_mul(total_pool as u128).unwrap()
            .checked_div(total_winning_pool as u128).unwrap() as u64;

        // Transfer winnings
        let seeds = &[
            b"market",
            &market.market_id.to_le_bytes(),
            &[market.bump],
        ];
        let signer = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.market_vault.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.market.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, user_share)?;

        bet.is_claimed = true;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(market_id: u64)]
pub struct InitializeMarket<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Market::INIT_SPACE,
        seeds = [b"market", &market_id.to_le_bytes()],
        bump
    )]
    pub market: Account<'info, Market>,
    
    #[account(
        init,
        payer = authority,
        token::mint = mint,
        token::authority = market,
        seeds = [b"vault", market.key().as_ref()],
        bump
    )]
    pub market_vault: Account<'info, TokenAccount>,
    
    pub mint: Account<'info, Mint>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct PlaceBet<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
    
    #[account(
        init,
        payer = user,
        space = 8 + Bet::INIT_SPACE,
        seeds = [b"bet", user.key().as_ref(), market.key().as_ref()],
        bump
    )]
    pub bet: Account<'info, Bet>,
    
    #[account(mut)]
    pub market_vault: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        token::mint = market_vault.mint,
        token::authority = user
    )]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ResolveMarket<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
    
    pub oracle: Signer<'info>,
}

#[derive(Accounts)]
pub struct ClaimWinnings<'info> {
    pub market: Account<'info, Market>,
    
    #[account(
        mut,
        seeds = [b"bet", user.key().as_ref(), market.key().as_ref()],
        bump = bet.bump
    )]
    pub bet: Account<'info, Bet>,
    
    #[account(
        mut,
        seeds = [b"vault", market.key().as_ref()],
        bump
    )]
    pub market_vault: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        token::mint = market_vault.mint,
        token::authority = user
    )]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
}

#[account]
#[derive(InitSpace)]
pub struct Market {
    pub market_id: u64,
    #[max_len(200)]
    pub question: String,
    pub end_time: i64,
    pub oracle: Pubkey,
    pub total_yes_amount: u64,
    pub total_no_amount: u64,
    pub is_resolved: bool,
    pub outcome: Option<bool>,
    pub authority: Pubkey,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Bet {
    pub user: Pubkey,
    pub market: Pubkey,
    pub amount: u64,
    pub prediction: bool,
    pub is_claimed: bool,
    pub bump: u8,
}

#[error_code]
pub enum PredictionError {
    #[msg("Market has already closed")]
    MarketClosed,
    #[msg("Market has already been resolved")]
    MarketResolved,
    #[msg("Invalid bet amount")]
    InvalidAmount,
    #[msg("Unauthorized oracle")]
    UnauthorizedOracle,
    #[msg("Market has not ended yet")]
    MarketNotEnded,
    #[msg("Market already resolved")]
    MarketAlreadyResolved,
    #[msg("Market not resolved yet")]
    MarketNotResolved,
    #[msg("Winnings already claimed")]
    AlreadyClaimed,
    #[msg("Unauthorized user")]
    UnauthorizedUser,
    #[msg("This is a losing bet")]
    LosingBet,
}
```